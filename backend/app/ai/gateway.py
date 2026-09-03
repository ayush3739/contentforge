import json
import logging
from abc import ABC, abstractmethod
from typing import Any, Optional, Type
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base class for all LLM providers in ContentForge AI."""

    @abstractmethod
    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
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
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            # Fallback if raw text contains markdown fences
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            return json.loads(clean_text.strip())


class GroqProvider(LLMProvider):
    """Groq Provider using groq SDK with ultra-fast inference."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        if not self.api_key:
            logger.warning("GROQ_API_KEY is not set in environment.")
        try:
            from groq import AsyncGroq
            self.client = AsyncGroq(api_key=self.api_key) if self.api_key else None
        except Exception as e:
            logger.error(f"Failed to initialize AsyncGroq client: {e}")
            self.client = None

    async def generate(
        self,
        messages: list[dict[str, str]],
        response_schema: Optional[Type[BaseModel]] = None,
        model: Optional[str] = None,
        temperature: float = 0.2,
    ) -> dict[str, Any]:
        if not self.client:
            raise RuntimeError("Groq client is not initialized or GROQ_API_KEY is missing.")

        model_name = model or getattr(settings, "GROQ_GENERATION_MODEL", "llama-3.1-70b-versatile")

        # If response schema is provided, instruct JSON output
        formatted_messages = list(messages)
        if response_schema:
            schema_json = json.dumps(response_schema.model_json_schema(), indent=2)
            schema_instruction = (
                f"\nYou MUST respond with valid JSON strictly adhering to this JSON Schema:\n{schema_json}"
            )
            # Append to system or last user message
            if formatted_messages and formatted_messages[0]["role"] == "system":
                formatted_messages[0]["content"] += schema_instruction
            else:
                formatted_messages.insert(0, {"role": "system", "content": schema_instruction})

        response = await self.client.chat.completions.create(
                model=model_name,
                messages=formatted_messages,
                temperature=temperature,
                response_format={"type": "json_object"} if response_schema else None,
        )

        content = response.choices[0].message.content or "{}"
        try:
            data = json.loads(content)
            if response_schema:
                # Validate with Pydantic
                validated = response_schema.model_validate(data)
                return validated.model_dump()
            return data
        except Exception as e:
            logger.error(f"Groq output parsing error: {e}, raw: {content}")
            raise


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
            )
            parsed = response.choices[0].message.parsed
            return parsed.model_dump() if parsed else {}
        else:
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
            )
            content = response.choices[0].message.content or "{}"
            return json.loads(content)


def get_llm_provider(provider_name: Optional[str] = None) -> LLMProvider:
    """
    Factory function returning the active LLMProvider.
    Gracefully falls back in order: Gemini -> Groq -> OpenAI.
    """
    target = (provider_name or settings.LLM_PROVIDER).lower()

    if target == "gemini" and settings.GEMINI_API_KEY:
        return GeminiProvider()
    elif target == "groq" and settings.GROQ_API_KEY:
        return GroqProvider()
    elif target == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider()

    # Fallback cascade prioritizing configured provider
    if settings.LLM_PROVIDER.lower() == "groq" and settings.GROQ_API_KEY:
        return GroqProvider()
    if settings.GEMINI_API_KEY:
        return GeminiProvider()
    if settings.GROQ_API_KEY:
        return GroqProvider()
    if settings.OPENAI_API_KEY:
        return OpenAIProvider()

    # If no keys are set, return GeminiProvider (will error on call with clear message)
    return GeminiProvider()
