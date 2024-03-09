from app.api.deps import SessionDep
from app.crud.base import CRUDBase
from app.models import Category
from app.schemas.category import CategoryCreate, CategoryOut
from fastapi import APIRouter, HTTPException

router = APIRouter()
crud_category = CRUDBase(Category)


@router.post("/", status_code=201, response_model=CategoryOut)
def create_category(db: SessionDep, category_in: CategoryCreate):
    category = crud_category.create(db=db, obj_in=category_in)
    return category


@router.get("/", status_code=200, response_model=list[CategoryOut])
def get_list_category(db: SessionDep):
    categories = db.query(Category).order_by(Category.name.asc()).all()
    return categories


@router.get("/{category_id}", status_code=200, response_model=CategoryOut)
def get_category_with_onwer(db: SessionDep, category_id: int):
    category = crud_category.get_one(db=db, id=category_id)
    if not category:
        raise HTTPException(detail="Category not found", status_code=404)
    return category
