from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    app_name: str = "校园墙 API"
    database_url: str = "sqlite:///./campus_wall.db"
    admin_token: str = ""
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 24 hours
    upload_dir: str = "./uploads"
    require_approval: bool = False


settings = Settings()
