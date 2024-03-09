from app.schemas.course import CourseOut
from pydantic import BaseModel, ConfigDict


class PurchaseOut(BaseModel):
    id: int
    course_id: int
    owner_id: int

    model_config: ConfigDict(format_attributes=True)


class PurchaseWithCourse(PurchaseOut):
    course: CourseOut

    model_config: ConfigDict(format_attributes=True)


class PurChaseAnalytic(BaseModel):
    name: str
    total: float


class PurChaseAnalyticOut(BaseModel):
    data: list[PurChaseAnalytic] = []
    total_revenue: float
    total_sales: int
