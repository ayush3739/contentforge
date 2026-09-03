import logging
import logging.handlers
import sys
from pathlib import Path


def setup_logging(log_level: str = "INFO"):
    """
    Configures clean, informative terminal logging for the FastAPI server.
    Ensures all application logs, uvicorn requests, and AI events are clearly
    visible in the terminal with timestamps and log levels.
    """
    # Fix Windows console UTF-8 encoding support
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    date_format = "%Y-%m-%d %H:%M:%S"
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper(), logging.INFO))

    # Console Handler (Stdout)
    if not root_logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(logging.Formatter(log_format, datefmt=date_format))
        root_logger.addHandler(console_handler)
    else:
        for handler in root_logger.handlers:
            handler.setFormatter(logging.Formatter(log_format, datefmt=date_format))

    # File Handler (Persistent AI Pipeline & Server Logs)
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / "ai_pipeline.log", maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
    )
    file_handler.setFormatter(logging.Formatter(log_format, datefmt=date_format))
    file_handler.setLevel(logging.INFO)
    root_logger.addHandler(file_handler)

    # Application loggers
    logging.getLogger("app").setLevel(logging.INFO)
    logging.getLogger("app.ai").setLevel(logging.INFO) # Detailed AI tracking
    logging.getLogger("app.main").setLevel(logging.INFO)
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("alembic").setLevel(logging.INFO)

    # Quiet down external dependency noise
    for noisy in [
        "httpcore",
        "httpx",
        "urllib3",
        "huggingface_hub",
        "sentence_transformers",
        "transformers",
        "filelock",
        "asyncio",
    ]:
        logging.getLogger(noisy).setLevel(logging.WARNING)
