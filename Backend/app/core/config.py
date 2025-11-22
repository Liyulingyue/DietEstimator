from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import EmailStr
import json


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DietEstimator Backend"

    # 数据库配置
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_PORT: str = "5432"

    # AI后端配置
    AI_BACKEND_URL: str = "http://localhost:8001"  # AI后端服务地址

    # AI模型配置
    MODEL_URL: str
    MODEL_KEY: str
    MODEL_NAME: str

    # CORS允许的前端来源（以逗号分隔的字符串或列表）
    CORS_ORIGINS: str | list[str] | None = None

    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @property
    def get_database_url(self) -> str:
        """获取数据库连接URL"""
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = (
                f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
                f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        return self.SQLALCHEMY_DATABASE_URI

    @property
    def get_cors_origins(self) -> list[str]:
        """解析并返回CORS允许的来源列表。支持：
        1. 未设置则返回生产安全默认值（可根据需要扩展）
        2. 逗号分隔字符串
        3. JSON风格的列表字符串（FastAPI官方常见用法）
        """
        raw = self.CORS_ORIGINS
        if not raw or raw == "*":
            return []
        if isinstance(raw, list):
            return raw
        # 字符串情况
        text = raw.strip()
        # 可能是 '["https://a.com","https://b.com"]'
        if text.startswith("[") and text.endswith("]"):
            try:
                data = json.loads(text)
                if isinstance(data, list):
                    return [str(x).strip() for x in data if x]
            except (ValueError, TypeError):
                pass
        # 逗号分隔
        return [x.strip() for x in text.split(",") if x.strip()]

    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env"
    )


settings = Settings()
