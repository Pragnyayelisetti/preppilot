from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gmail_address: str = ""
    gmail_app_password: str = ""

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_from: str = "whatsapp:+14155238886"
    student_whatsapp_to: str = "+919876543210"

    mongo_uri: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
