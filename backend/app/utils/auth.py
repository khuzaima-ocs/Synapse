import time
import jwt
from passlib.context import CryptContext
from app.config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_in_seconds: int = 60 * 60 * 24 * 7) -> str:
    now = int(time.time())
    payload = {"sub": subject, "iat": now, "exp": now + expires_in_seconds}
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    return token


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])


