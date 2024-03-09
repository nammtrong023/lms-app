from app.api.deps import get_current_user
from app.api.endpoints import (
    auth,
    category,
    course,
    payment,
    progress,
    purchase,
    upload,
)
from fastapi import APIRouter, Depends

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    course.router,
    prefix="/courses",
    tags=["courses"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    category.router,
    prefix="/categories",
    tags=["categories"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    upload.router,
    prefix="/upload",
    tags=["upload"],
)
api_router.include_router(
    purchase.router,
    prefix="/purchases",
    tags=["purchases"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    progress.router,
    prefix="/progress",
    tags=["progress"],
    dependencies=[Depends(get_current_user)],
)
api_router.include_router(
    payment.router,
    prefix="/payment",
    tags=["payment"],
)
