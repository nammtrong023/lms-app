import logging
from datetime import datetime, timedelta
from typing import Literal

from app.config import config
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import ExpiredSignatureError, JWTError, jwt
from passlib.context import CryptContext

from .config import config

logger = logging.getLogger(__name__)

SECRET_KEY = config.SECRET_KEY
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
pwd_context = CryptContext(schemes=["bcrypt"])


def get_credentials_exception(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=f"{detail}",
        headers={"WWW-Authenticate": "Bearer"},
    )


def create_token(email: str, type: Literal["access", "confirm", "recovery"]):
    logger.debug(f"Creating {type} token", extra={"email": email})

    expired_minues = config.AT_EXPIRED if type == "access" else 60 * 24
    expire = datetime.utcnow() + timedelta(minutes=expired_minues)

    jwt_data = {"sub": email, "exp": expire, "type": type}
    encoded_jwt = jwt.encode(jwt_data, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_subject_token_type(token: str, type: Literal["access", "confirm"]) -> str:
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[ALGORITHM])
    except ExpiredSignatureError as e:
        raise get_credentials_exception('Token has expired') from e
    except JWTError as e:
        raise get_credentials_exception('Invalid token') from e

    email = payload.get("sub")
    if email is None:
        raise get_credentials_exception('Token is missing "sub" field')

    token_type = payload.get("type")
    if token_type is None or token_type != type:
        raise get_credentials_exception('Token has incorrect type')

    return email
