from datetime import datetime
from typing import Optional

from app.schemas.category import CategoryOut
from app.schemas.chapter import ChapterOut, ChapterWithProgress
from app.schemas.purchase import PurchaseOut
from pydantic import BaseModel, ConfigDict


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    is_published: Optional[bool] = False


class CourseCreate(CourseBase):
    pass


class CourseUpdate(CourseBase):
    title: Optional[str] = None


class CourseOut(CourseBase):
    id: int
    owner_id: int
    chapters: list[ChapterOut]

    created_at: datetime
    updated_at: datetime

    model_config: ConfigDict(format_attributes=True)


class CourseWithProgress(CourseOut):
    progress: float
    pass


class CourseWithProgressAndCategory(CourseBase):
    id: int
    owner_id: int
    chapter_ids: list[int]
    purchase: Optional[PurchaseOut] = None
    category: Optional[CategoryOut] = None
    progress: Optional[float] = None

    created_at: datetime
    updated_at: datetime

    model_config: ConfigDict(format_attributes=True)


class CourseWithProgressOut(BaseModel):
    completed_courses: list[CourseWithProgress] = []
    courses_in_progress: list[CourseWithProgress] = []


class CourseWithChapterProgress(CourseBase):
    id: int
    owner_id: int
    chapters: list[ChapterWithProgress]

    created_at: datetime
    updated_at: datetime


class CourseInPurchase(CourseOut):
    pass
