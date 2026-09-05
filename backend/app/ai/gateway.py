import asyncio
import json
import logging
from abc import ABC, abstractmethod
from typing import Any, Optional, Type
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


def clean_json_str(raw: str) -> dict[str, Any]:
    """Extracts and parses JSON safely, handling markdown fences and surrounding commentary."""
    text = (raw or "{}").strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start_obj = text.find("{")
        start_arr = text.find("[")
        start_idx = -1
        if start_obj != -1 and (start_arr == -1 or start_obj < start_arr):
            start_idx = start_obj
            end_idx = text.rfind("}")
        elif start_arr != -1:
            start_idx = start_arr
            end_idx = text.rfind("]")
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            return json.loads(text[start_idx:end_idx + 1])
        raise


class LLMProvider(ABC):
    """Abstract base class for all LLM providers in ContentForge AI."""

    @abstractmethod
    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        """
        Generate structured JSON output adhering to response_schema.
        Returns a Python dictionary parsed from the validated model output.
        """
        pass


class GeminiProvider(LLMProvider):
    """Google Gemini Provider using official google-genai SDK."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set in environment.")
        try:
            from google import genai
            self.client = genai.Client(api_key=self.api_key) if self.api_key else None
        except Exception as e:
            logger.error(f"Failed to initialize google-genai client: {e}")
            self.client = None

    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        if not self.client:
            raise RuntimeError("Gemini client is not initialized or GEMINI_API_KEY is missing.")

        model_name = model or settings.GEMINI_MODEL

        # Convert standard message format to prompt
        system_instructions = []
        contents = []
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")
            if role == "system":
                system_instructions.append(content)
            else:
                contents.append(f"[{role.upper()}]:\n{content}")

        system_instruction_str = "\n\n".join(system_instructions) if system_instructions else None
        user_prompt = "\n\n".join(contents)

        from google.genai import types

        config_args: dict[str, Any] = {
            "temperature": temperature,
        }
        if system_instruction_str:
            config_args["system_instruction"] = system_instruction_str

        if response_schema is not None:
            config_args["response_mime_type"] = "application/json"
            config_args["response_schema"] = response_schema

        config = types.GenerateContentConfig(**config_args)

        # Asynchronous generation with timeout
        import asyncio
        response = await asyncio.wait_for(
            self.client.aio.models.generate_content(
                model=model_name,
                contents=user_prompt,
                config=config,
            ),
            timeout=15.0,
        )

        response_text = response.text or "{}"
        return clean_json_str(response_text)


class GroqKeyPool:
    """
    Thread-safe / async pool managing multiple Groq API keys with:
    - Round-robin load balancing across multiple developer accounts
    - Instant failover upon rate limits (HTTP 429) or token quotas
    - Temporary cooldown period for rate-limited keys
    """

    def __init__(self, keys: Optional[list[str]] = None):
        raw_keys = keys if keys is not None else settings.groq_api_keys
        self.keys: list[str] = [k.strip() for k in raw_keys if k and k.strip()]
        self._index: int = 0
        self._cooldowns: dict[str, float] = {}
        self._clients: dict[str, Any] = {}

    def get_client(self, api_key: str):
        if api_key not in self._clients:
            from groq import AsyncGroq
            self._clients[api_key] = AsyncGroq(api_key=api_key)
        return self._clients[api_key]

    def mark_rate_limited(self, api_key: str, cooldown_seconds: float = 45.0):
        import time
        masked = f"...{api_key[-6:]}" if len(api_key) > 6 else "***"
        logger.warning(
            f"[GROQ-POOL] Key {masked} hit rate limit (429). Deprioritizing for {cooldown_seconds}s."
        )
        self._cooldowns[api_key] = time.time() + cooldown_seconds

    def get_candidate_keys(self) -> list[str]:
        """
        Returns keys in round-robin order, prioritizing healthy non-cooldown keys.
        """
        import time
        if not self.keys:
            return []

        now = time.time()
        n = len(self.keys)
        start_idx = self._index % n
        self._index = (self._index + 1) % n

        ordered = [self.keys[(start_idx + i) % n] for i in range(n)]
        healthy = [k for k in ordered if now >= self._cooldowns.get(k, 0)]
        cooling = [k for k in ordered if now < self._cooldowns.get(k, 0)]

        # Try healthy keys first; fall back to cooling keys if all are cooling
        return healthy + cooling


_global_groq_pool: Optional[GroqKeyPool] = None


def get_groq_pool() -> GroqKeyPool:
    global _global_groq_pool
    if _global_groq_pool is None:
        _global_groq_pool = GroqKeyPool()
    return _global_groq_pool


class GroqProvider(LLMProvider):
    """
    Groq Provider supporting multi-account round-robin, rate-limit (429) failover,
    and multi-tier model fallback.
    """

    def __init__(self, api_key: Optional[str] = None):
        if api_key:
            self.pool = GroqKeyPool([api_key])
        else:
            self.pool = get_groq_pool()

    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        candidate_keys = self.pool.get_candidate_keys()
        if not candidate_keys:
            raise RuntimeError("Groq client is not initialized or GROQ_API_KEY is missing.")

        model_name = model or getattr(settings, "GROQ_GENERATION_MODEL", "openai/gpt-oss-120b")

        # Build candidate fallback models list (eliminating duplicates)
        candidate_models = [model_name]
        fb_1 = getattr(settings, "GROQ_FALLBACK_MODEL", "openai/gpt-oss-20b")
        fb_2 = getattr(settings, "GROQ_SECOND_FALLBACK_MODEL", "qwen/qwen3.8-27b")
        if fb_1 and fb_1 not in candidate_models:
            candidate_models.append(fb_1)
        if fb_2 and fb_2 not in candidate_models:
            candidate_models.append(fb_2)

        # If response schema is provided, instruct JSON output
        formatted_messages = list(messages)
        if response_schema:
            schema_json = json.dumps(response_schema.model_json_schema(), indent=2)
            schema_instruction = (
                f"\nYou MUST respond with valid JSON strictly adhering to this JSON Schema:\n{schema_json}"
            )
            if formatted_messages and formatted_messages[0]["role"] == "system":
                formatted_messages[0]["content"] += schema_instruction
            else:
                formatted_messages.insert(0, {"role": "system", "content": schema_instruction})

        last_err: Optional[Exception] = None

        # Outer loop: Try keys in round-robin sequence with failover
        for key_idx, current_key in enumerate(candidate_keys):
            client = self.pool.get_client(current_key)
            masked_key = f"...{current_key[-6:]}" if len(current_key) > 6 else "***"

            # Inner loop: Try candidate models
            for model_idx, attempt_model in enumerate(candidate_models):
                try:
                    response = await client.chat.completions.create(
                        model=attempt_model,
                        messages=formatted_messages,
                        temperature=temperature,
                        max_tokens=max_tokens,
                        response_format={"type": "json_object"} if response_schema else None,
                    )

                    content = response.choices[0].message.content or "{}"
                    data = clean_json_str(content)
                    if response_schema:
                        validated = response_schema.model_validate(data)
                        return validated.model_dump()
                    return data

                except Exception as e:
                    last_err = e
                    err_str = str(e).lower()
                    is_rate_limit = (
                        "429" in err_str
                        or "rate_limit" in err_str
                        or "rate limit" in err_str
                        or "tokens per minute" in err_str
                        or "requests per minute" in err_str
                        or type(e).__name__ == "RateLimitError"
                    )

                    if is_rate_limit:
                        self.pool.mark_rate_limited(current_key)
                        next_key = (
                            candidate_keys[key_idx + 1]
                            if key_idx + 1 < len(candidate_keys)
                            else None
                        )
                        if next_key:
                            masked_next = f"...{next_key[-6:]}" if len(next_key) > 6 else "***"
                            logger.warning(
                                f"[GROQ-FAILOVER] Key {masked_key} hit rate limit (429). "
                                f"Failing over to secondary key {masked_next}..."
                            )
                            # Break model loop to immediately try the next key
                            break
                        else:
                            logger.warning(
                                f"[GROQ-FAILOVER] Key {masked_key} rate limited, no other key available in pool."
                            )

                    next_model = (
                        candidate_models[model_idx + 1]
                        if model_idx + 1 < len(candidate_models)
                        else None
                    )
                    if next_model:
                        logger.warning(
                            f"[GROQ-FALLBACK] Model '{attempt_model}' failed on key {masked_key}: {e}. "
                            f"Retrying with fallback model '{next_model}'..."
                        )
                    else:
                        logger.error(
                            f"[GROQ] All candidate models {candidate_models} failed on key {masked_key}: {e}"
                        )

        if last_err:
            raise last_err
        raise RuntimeError("Groq generation failed with unknown error.")


class GrokProvider(LLMProvider):
    """xAI Grok Provider using OpenAI-compatible client interface."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, "GROK_API_KEY", None) or getattr(settings, "XAI_API_KEY", None)
        if not self.api_key:
            logger.warning("GROK_API_KEY / XAI_API_KEY is not set in environment.")
        try:
            from openai import AsyncOpenAI
            self.client = (
                AsyncOpenAI(api_key=self.api_key, base_url="https://api.x.ai/v1")
                if self.api_key
                else None
            )
        except Exception as e:
            logger.error(f"Failed to initialize Grok client: {e}")
            self.client = None

    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        if not self.client:
            raise RuntimeError("Grok client is not initialized or GROK_API_KEY is missing.")

        model_name = model or getattr(settings, "GROK_MODEL", "grok-2-latest")
        candidate_models = [model_name]
        fb_1 = getattr(settings, "GROK_FALLBACK_MODEL", None)
        fb_2 = getattr(settings, "GROK_SECOND_FALLBACK_MODEL", None)
        if fb_1 and fb_1 not in candidate_models:
            candidate_models.append(fb_1)
        if fb_2 and fb_2 not in candidate_models:
            candidate_models.append(fb_2)

        formatted_messages = list(messages)
        if response_schema:
            schema_json = json.dumps(response_schema.model_json_schema(), indent=2)
            schema_instruction = (
                f"\nYou MUST respond with valid JSON strictly adhering to this JSON Schema:\n{schema_json}"
            )
            if formatted_messages and formatted_messages[0]["role"] == "system":
                formatted_messages[0]["content"] += schema_instruction
            else:
                formatted_messages.insert(0, {"role": "system", "content": schema_instruction})

        last_err: Optional[Exception] = None
        for idx, attempt_model in enumerate(candidate_models):
            try:
                response = await self.client.chat.completions.create(
                    model=attempt_model,
                    messages=formatted_messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format={"type": "json_object"} if response_schema else None,
                )
                content = response.choices[0].message.content or "{}"
                data = clean_json_str(content)
                if response_schema:
                    validated = response_schema.model_validate(data)
                    return validated.model_dump()
                return data
            except Exception as e:
                last_err = e
                next_m = candidate_models[idx + 1] if idx + 1 < len(candidate_models) else None
                if next_m:
                    logger.warning(
                        f"[GROK-FALLBACK] Grok model '{attempt_model}' failed: {e}. Retrying with '{next_m}'..."
                    )
                else:
                    logger.error(f"[GROK] All candidate Grok models {candidate_models} failed: {e}")

        if last_err:
            raise last_err
        raise RuntimeError("Grok generation failed.")


class OpenAIProvider(LLMProvider):
    """OpenAI Provider as secondary/fallback."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=self.api_key) if self.api_key else None
        except Exception as e:
            logger.error(f"Failed to initialize AsyncOpenAI client: {e}")
            self.client = None

    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096,
    ) -> dict[str, Any]:
        if not self.client:
            raise RuntimeError("OpenAI client is not initialized or OPENAI_API_KEY is missing.")

        model_name = model or settings.OPENAI_MODEL

        if response_schema:
            response = await self.client.beta.chat.completions.parse(
                model=model_name,
                messages=messages,
                response_format=response_schema,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            parsed = response.choices[0].message.parsed
            return parsed.model_dump() if parsed else {}
        else:
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            content = response.choices[0].message.content or "{}"
            return clean_json_str(content)


def get_llm_provider(provider_name: Optional[str] = None) -> LLMProvider:
    """
    Factory function returning the active LLMProvider.
    Gracefully falls back in order: Groq -> Gemini -> Grok -> OpenAI.
    """
    target = (provider_name or settings.LLM_PROVIDER).lower()
    has_groq = bool(settings.groq_api_keys)

    if target == "groq" and has_groq:
        return GroqProvider()
    elif target == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider()
    elif target in ("grok", "xai") and (settings.GROK_API_KEY or settings.XAI_API_KEY):
        return GrokProvider()
    elif target == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()

    # Fallback cascade prioritizing configured provider
    if has_groq:
        return GroqProvider()
    if settings.GEMINI_API_KEY:
        return GeminiProvider()
    if settings.GROK_API_KEY or settings.XAI_API_KEY:
        return GrokProvider()
    if settings.OPENAI_API_KEY:
        return OpenAIProvider()

    # Default fallback to GroqProvider or GeminiProvider
    return GroqProvider() if has_groq else GeminiProvider()
