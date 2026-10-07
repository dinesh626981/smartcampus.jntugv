import os
from datetime import timedelta
from typing import List


class Config:
    """Application configuration container."""

    # Security & Sessions
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "smart-college-super-secret-key-12345")
    ADMIN_REGISTRATION_KEY: str = os.environ.get("ADMIN_REGISTRATION_KEY", "admin123")
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(days=1)

    # Database
    _raw_db_url: str = os.environ.get("DATABASE_URL", "")
    if not _raw_db_url:
        _raw_db_url = "sqlite:///" + os.path.join(
            os.path.abspath(os.path.dirname(__file__)), "college_system.db"
        )

    # Render produces 'postgres://', SQLAlchemy 2.x requires 'postgresql://'
    # Cloud MySQL URLs often start with 'mysql://', PyMySQL dialect requires 'mysql+pymysql://'
    if _raw_db_url.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI: str = _raw_db_url.replace("postgres://", "postgresql://", 1)
    elif _raw_db_url.startswith("mysql://"):
        SQLALCHEMY_DATABASE_URI: str = _raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
    else:
        SQLALCHEMY_DATABASE_URI: str = _raw_db_url

    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False

    # Production connection pool settings
    SQLALCHEMY_ENGINE_OPTIONS: dict = {
        "pool_recycle": 280,
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20,
    }

    # Resolve CA Certificate path for Aiven / Cloud MySQL SSL
    _backend_dir: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    _ca_file_env: str = os.environ.get("MYSQL_SSL_CA", "ca.pem")
    _ca_path: str = _ca_file_env if os.path.isabs(_ca_file_env) else os.path.join(_backend_dir, _ca_file_env)

    if ("mysql" in SQLALCHEMY_DATABASE_URI.lower()) and os.path.exists(_ca_path):
        SQLALCHEMY_ENGINE_OPTIONS["connect_args"] = {
            "ssl": {
                "ca": _ca_path
            }
        }

    # CORS Origins
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.environ.get("CORS_ORIGINS", "*").split(",")
        if origin.strip()
    ]

    # Google Identity Services (OAuth2)
    GOOGLE_CLIENT_ID: str = os.environ.get("GOOGLE_CLIENT_ID", "")
    ALLOWED_EMAIL_DOMAINS: str = os.environ.get("ALLOWED_EMAIL_DOMAINS", "")
    ALLOWED_GOOGLE_ADMIN_LOGIN: bool = (
        os.environ.get("ALLOWED_GOOGLE_ADMIN_LOGIN", "false").lower() in ["true", "on", "1"]
    )

    # LLM & AI Provider
    LLM_PROVIDER: str = os.environ.get("LLM_PROVIDER", "gemini")
    LLM_API_KEY: str = os.environ.get("LLM_API_KEY", "")

    # Storage & Upload Boundaries
    BASE_DIR: str = os.path.abspath(os.path.dirname(__file__))
    MAX_CONTENT_LENGTH: int = 15 * 1024 * 1024  # 15 MB

    # Cloudinary CDN
    CLOUDINARY_CLOUD_NAME: str = os.environ.get("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.environ.get("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.environ.get("CLOUDINARY_API_SECRET", "")

    # Flask Mail
    MAIL_SERVER: str = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    MAIL_PORT: int = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS: bool = os.environ.get("MAIL_USE_TLS", "True").lower() in ["true", "on", "1"]
    MAIL_USE_SSL: bool = os.environ.get("MAIL_USE_SSL", "False").lower() in ["true", "on", "1"]
    MAIL_USERNAME: str = os.environ.get("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.environ.get("MAIL_PASSWORD", "")
    MAIL_DEFAULT_SENDER: str = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@smartcollegesystem.com")
