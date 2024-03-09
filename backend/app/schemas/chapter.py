from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from .purchase import PurchaseOut


class ChapterBase(BaseModel):
    title: str
    description: Optional[str] = None
    video_url: Optional[str] = None
    position: Optional[int] = None
    is_published: Optional[bool] = None
    is_free: Optional[bool] = None


class ChapterCreate(ChapterBase):
    pass


class ChapterUpdate(ChapterBase):
    title: Optional[str] = None


class ReorderList(BaseModel):
    id: int
    position: int


class ChapterOut(ChapterBase):
    id: int
    course_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(format_attributes=True)


class UserProgress(BaseModel):
    pass


class ChapterWithProgress(ChapterOut):
    user_progress: list[UserProgress]


class ChapterProgressComplete(BaseModel):
    is_completed: bool


class ChapterDashboard(BaseModel):
    chapter: ChapterOut
    course_price: float
    purchase: Optional[PurchaseOut] = None
    user_progress: Optional[UserProgress] = None
    next_chapter: Optional[ChapterOut] = None

    model_config = ConfigDict(format_attributes=True)
