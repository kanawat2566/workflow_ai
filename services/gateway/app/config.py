from pydantic import BaseSettings


class Settings(BaseSettings):
    ORCHESTRATOR_URL: str
    VALKEY_URL: str
    VALKEY_CHANNEL_PREFIX: str = "sse:"
    ORCHESTRATOR_COMMANDS_PATH: str = "/commands"

    class Config:
        env_file = ".env"


settings = Settings()
