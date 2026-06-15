from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql://lawyerspot:lawyerspot@localhost:5432/lawyerspot"
    admin_email: str = "admin@lawyerspot.com"
    admin_password: str = "admin123"
    admin_session_secret: str = "lawyerspot-dev-secret-change-in-production"
    cors_origins: str = "http://localhost:3000"
    cookie_name: str = "lawyerspot_admin_session"
    session_days: int = 7

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
