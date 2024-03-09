from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class BaseConfig(BaseSettings):
    ENV_STATE: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env")


class GlobalConfig(BaseConfig):
    SECRET_KEY: Optional[str] = None
    DATABASE_URL: Optional[str] = None
    DB_FORCE_ROLL_BACK: bool = False
    AT_EXPIRED: Optional[int] = None

    EMAILS_FROM_NAME: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAIL_TEMPLATES_DIR: str = "app/email-templates"

    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_PORT: Optional[str] = None
    SMTP_TLS: bool = True

    CLOUD_NAME: Optional[str] = None
    CLOUD_API_KEY: Optional[int] = None
    CLOUD_API_SECRET: Optional[str] = None

    FRONTEND_URL: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    STRIPE_API_KEY: Optional[str] = None


config = GlobalConfig()
