from typing import Dict

from app.api.deps import CurrentUser, SessionDep
from app.crud.base import CRUDBase
from app.models import Course, Purchase
from app.schemas.purchase import PurchaseOut
from app.schemas.purchase_analytic import PurChaseAnalyticOut, PurchaseWithCourse
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import joinedload

router = APIRouter()
crud_purchase = CRUDBase(Purchase)


def group_by_course(purchases: list[PurchaseWithCourse]):
    grouped: Dict[str, float] = {}

    for purchase in purchases:
        course_title = purchase.course.title

        if not grouped.get(course_title):
            grouped[course_title] = 0.0

        grouped[course_title] += purchase.course.price

    return grouped


@router.get("/analist", status_code=200, response_model=PurChaseAnalyticOut)
def get_analytic(db: SessionDep, current_user: CurrentUser):
    purchases = (
        db.query(Purchase)
        .join(Course, Purchase.course_id == Course.id)
        .options(joinedload(Purchase.course))
        .filter(Course.owner_id == current_user.id)
        .all()
    )

    grouped_earnings = group_by_course(purchases=purchases)
    data = [
        {"name": course_title, "total": total} for course_title, total in grouped_earnings.items()
    ]
    total_revenue = sum(item["total"] for item in data)
    total_sales = len(purchases)

    return {"data": data, "total_revenue": total_revenue, "total_sales": total_sales}


@router.get("/courses/{course_id}", status_code=200, response_model=PurchaseOut)
def get_by_course_id(db: SessionDep, course_id: int, current_user: CurrentUser):
    purchase = (
        db.query(Purchase)
        .filter(
            Purchase.owner_id == current_user.id,
            Purchase.course_id == course_id,
        )
        .first()
    )

    if not purchase:
        raise HTTPException(detail="Purchase not found", status_code=404)

    return purchase
