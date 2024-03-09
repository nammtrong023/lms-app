from typing import Annotated, Generator

from app.crud.user import crud_user
from app.database import engine
from app.models import User
from app.security import get_subject_token_type
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_db() -> Generator:
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[Session, Depends(oauth2_scheme)]


def get_current_user(db: SessionDep, token: TokenDep) -> User:
    email = get_subject_token_type(token, 'access')
    user = crud_user.get_by_email(db=db, email=email)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
