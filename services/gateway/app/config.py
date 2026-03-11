from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ORCHESTRATOR_URL: str = "http://orchestrator:8001"
    VALKEY_URL: str = "redis://valkey:6379"
    VALKEY_CHANNEL_PREFIX: str = "sse:"
    ORCHESTRATOR_COMMANDS_PATH: str = "/commands"

    class Config:
        env_file = ".env"


settings = Settings()
