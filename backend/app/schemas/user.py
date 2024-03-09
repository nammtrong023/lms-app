from pydantic import BaseModel, ConfigDict

from .course import CourseOut


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserUpdate(UserBase):
    pass


class User(UserBase):
    id: int
    posts: list[CourseOut] = []

    model_config = ConfigDict(from_attributes=True)


class UserProgressBase(BaseModel):
    is_complete: bool


class UserProgressOut(UserProgressBase):
    id: int
    chapter_id: int
    owner_id: int


class PasswordRecovery(BaseModel):
    password: str
    confirm_password: str
