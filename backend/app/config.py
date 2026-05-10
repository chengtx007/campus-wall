from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")

    app_name: str = "校园墙 API"
    database_url: str = "sqlite:///./campus_wall.db"
    admin_token: str = ""
    upload_dir: str = "./uploads"
    require_approval: bool = False


settings = Settings()
