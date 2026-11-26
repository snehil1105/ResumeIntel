from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "ResumeIntel AI Microservice"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Database & Cache
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://resumeintel_user:resumeintel_secure_pass_2026@localhost:5432/resumeintel_db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # LLM Providers
    DEFAULT_LLM_PROVIDER: str = os.getenv("DEFAULT_LLM_PROVIDER", "gemini") # gemini, openai, groq, mock
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    
    # Web Search Providers
    TAVILY_API_KEY: Optional[str] = os.getenv("TAVILY_API_KEY", None)
    SERPER_API_KEY: Optional[str] = os.getenv("SERPER_API_KEY", None)
    
    # File Storage
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", "./storage")
    MAX_FILE_SIZE_MB: int = 10
    
    class Config:
        env_file = [
            ".env",
            "../.env",
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        ]
        extra = "allow"

settings = Settings()
