from typing import Any, Dict, Optional, Union

from app.crud.base import CRUDBase
from app.models import Course
from app.schemas.course import CourseCreate, CourseUpdate
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session


class CRUDCourse(CRUDBase[Course, CourseCreate, CourseUpdate]):
    def create_with_onwer(self, db: Session, *, obj_in: CourseCreate, owner_id: int) -> Course:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_one_by_owner(self, db: Session, *, course_id: str, owner_id: int) -> Optional[Course]:
        course = db.query(Course).filter(Course.id == course_id, owner_id == owner_id).first()
        return course

    def get_all_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> list[Course]:
        return (
            db.query(self.model).filter(Course.owner_id == owner_id).offset(skip).limit(limit).all()
        )

    def update(
        self,
        db: Session,
        *,
        db_obj: Course,
        obj_in: Union[CourseUpdate, Dict[str, Any]],
    ) -> Course:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


crud_course = CRUDCourse(Course)
