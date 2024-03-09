from typing import Any, Literal, Optional

from app.api.deps import CurrentUser, SessionDep
from app.crud.base import CRUDBase
from app.crud.course import crud_course
from app.models import Category, Chapter, Course, Purchase, UserProgress
from app.schemas.chapter import (
    ChapterCreate,
    ChapterDashboard,
    ChapterOut,
    ChapterUpdate,
    ReorderList,
)
from app.schemas.course import (
    ChapterOut,
    CourseCreate,
    CourseOut,
    CourseUpdate,
    CourseWithChapterProgress,
    CourseWithProgressAndCategory,
    CourseWithProgressOut,
)
from fastapi import APIRouter, Body, HTTPException
from sqlalchemy.orm import contains_eager, joinedload

from .progress import get_progress_percentage

router = APIRouter()
crud_chapter = CRUDBase(Chapter)


def get_course_by_owner(db: SessionDep, course_id: int, current_user: CurrentUser):
    course = crud_course.get_one_by_owner(db=db, course_id=course_id, owner_id=current_user.id)
    if not course:
        raise HTTPException(detail="Course not found", status_code=404)
    if course.owner_id != current_user.id:
        raise HTTPException(detail="Don't have permission", status_code=403)
    return course


@router.post("/", status_code=201, response_model=CourseOut)
def create_course(db: SessionDep, course_in: CourseCreate, current_user: CurrentUser):
    if course_in.category_id:
        category = db.query(Category).filter(Category.id == course_in.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    course = crud_course.create_with_onwer(db=db, obj_in=course_in, owner_id=current_user.id)
    return course


@router.patch("/{course_id}/publish", status_code=200)
def publish_course(
    db: SessionDep,
    course_id: int,
    action: Literal["publish", "unpublish"],
    current_user: CurrentUser,
):
    course = get_course_by_owner(db=db, course_id=course_id, current_user=current_user)
    has_published_chapters = any(map(lambda chapter: chapter.is_published, course.chapters))

    if action == "publish":
        if not all(
            [
                course.title,
                course.description,
                course.image_url,
                course.category_id,
                has_published_chapters,
            ]
        ):
            raise HTTPException(detail="Missing fields required", status_code=400)

        course.is_published = True
        db.commit()
        db.refresh(course)
        return HTTPException(detail="Published course", status_code=200)
    else:
        course.is_published = False
        db.commit()
        db.refresh(course)
        return HTTPException(detail="Unpublished course", status_code=200)


@router.get("/", status_code=200, response_model=list[CourseOut])
def get_list_course(db: SessionDep, current_user: CurrentUser):
    courses = crud_course.get_all_by_owner(db=db, owner_id=current_user.id)
    return courses


@router.get("/dashboard-courses", status_code=200, response_model=CourseWithProgressOut)
def get_dashboard_courses(db: SessionDep, current_user: CurrentUser):
    purchased_courses = (
        db.query(Purchase)
        .join(Course, Course.id == Purchase.course_id)
        .join(Chapter, Chapter.course_id == Course.id)
        .options(contains_eager(Purchase.course).contains_eager(Course.chapters))
        .filter(Purchase.owner_id == current_user.id, Chapter.is_published)
        .all()
    )
    courses = [purchase.course for purchase in purchased_courses]
    progress_data = []

    for course in courses:
        progress = get_progress_percentage(
            db=db,
            course_id=course.id,
            owner_id=current_user.id,
        )
        course_dict = course.__dict__.copy()
        course_dict["progress"] = progress
        progress_data.append(course_dict)

    completed_courses = [course for course in progress_data if course["progress"] == 100]
    courses_in_progress = [course for course in progress_data if course.get("progress", 0) < 100]
    return {"completed_courses": completed_courses, "courses_in_progress": courses_in_progress}


@router.get(
    "/courses-progress",
    status_code=200,
    response_model=list[CourseWithProgressAndCategory],
)
def get_courses_with_progress(
    db: SessionDep,
    current_user: CurrentUser,
    category_id: Optional[int] = None,
    title: Optional[str] = None,
):
    base_query = (
        db.query(Course)
        .join(Chapter, Chapter.course_id == Course.id)
        .join(Category, Category.id == Course.category_id)
        .options(
            contains_eager(Course.chapters),
            contains_eager(Course.category),
        )
        .filter(Course.is_published, Chapter.is_published)
        .order_by(Course.created_at.desc())
    )

    if category_id is not None:
        base_query = base_query.filter(Course.category_id == category_id)

    if title is not None:
        base_query = base_query.filter(Course.title.ilike(f"%{title}%"))

    courses = base_query.all()
    response_data = []
    for course in courses:
        purchase = (
            db.query(Purchase)
            .filter(
                Purchase.owner_id == current_user.id,
                Purchase.course_id == course.id,
            )
            .first()
        )

        course_data = course.__dict__.copy()
        course_data.pop('chapters', None)

        chapter_ids = [chapter.id for chapter in course.chapters]
        course_data["chapter_ids"] = chapter_ids

        if not purchase:
            course_data["progress"] = None
            course_data["purchase"] = None
        else:
            progress_percentage = get_progress_percentage(
                db=db,
                course_id=course.id,
                owner_id=current_user.id,
            )
            course_data["progress"] = progress_percentage
            course_data["purchase"] = purchase

        response_data.append(course_data)

    return response_data


@router.patch("/{course_id}", status_code=200, response_model=CourseOut)
def update_course(
    db: SessionDep,
    course_id: int,
    course_in: CourseUpdate,
    current_user: CurrentUser,
):
    course = get_course_by_owner(db=db, course_id=course_id, current_user=current_user)

    if course_in.category_id:
        category = db.query(Category).filter(Category.id == course_in.category_id).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    course = crud_course.update(db=db, db_obj=course, obj_in=course_in)
    return course


@router.get("/{course_id}", status_code=200, response_model=CourseOut)
def get_course_with_onwer(db: SessionDep, course_id: int, current_user: CurrentUser):
    course = get_course_by_owner(
        db=db,
        course_id=course_id,
        current_user=current_user,
    )
    return course


@router.get("/public-course/{course_id}", status_code=200, response_model=CourseOut)
def get_public_course(db: SessionDep, course_id: int):
    course = (
        db.query(Course)
        .join(Chapter, Chapter.course_id == Course.id)
        .filter(Course.id == course_id, Course.is_published)
        .order_by(Chapter.position.asc())
        .first()
    )
    if not course:
        raise HTTPException(detail="Course not found", status_code=404)

    return course


@router.get(
    "/{course_id}/chapter-progress",
    status_code=200,
    response_model=CourseWithChapterProgress,
)
def get_course_with_chapter_progress(db: SessionDep, course_id: int, current_user: CurrentUser):
    course = (
        db.query(Course)
        .join(Chapter, Chapter.course_id == Course.id)
        # .join(UserProgress, UserProgress.chapter_id == Chapter.id)
        .filter(
            Course.id == course_id,
            Chapter.is_published == True,
            # UserProgress.owner_id == current_user.id,
        )
        .order_by(Chapter.position.asc())
        .first()
    )

    if not course:
        raise HTTPException(detail="Course not found", status_code=404)

    return course


@router.delete("/{course_id}", status_code=200)
def delete_course(
    db: SessionDep,
    course_id: int,
    current_user: CurrentUser,
):
    get_course_by_owner(db=db, course_id=course_id, current_user=current_user)
    crud_course.delete(db=db, id=course_id)
    return HTTPException(detail="Course deleted", status_code=200)


# CHAPTERS
@router.get("/{course_id}/chapters/{chapter_id}", status_code=200, response_model=ChapterOut)
def get_chapter(
    db: SessionDep,
    course_id: int,
    chapter_id: int,
    current_user: CurrentUser,
):
    get_course_by_owner(db=db, course_id=course_id, current_user=current_user)
    chapter = db.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(detail="Chapter not found", status_code=404)
    return chapter


@router.post("/{course_id}/chapters", status_code=201, response_model=ChapterOut)
def create_chapter(
    db: SessionDep,
    course_id: int,
    chapter_in: ChapterCreate,
    current_user: CurrentUser,
):
    get_course_by_owner(db=db, course_id=course_id, current_user=current_user)
    db_obj = crud_chapter.create_with_id_field(
        db=db,
        obj_in=chapter_in,
        id_name="course_id",
        id_value=course_id,
    )
    return db_obj


@router.put("/{course_id}/chapters/reorder", status_code=200)
def reorder_chapter(
    db: SessionDep,
    course_id: int,
    obj_in: list[ReorderList],
    current_user: CurrentUser,
):
    get_course_by_owner(db=db, course_id=course_id, current_user=current_user)

    for item in obj_in:
        chapter = db.query(Chapter).filter(Chapter.id == item.id).first()
        chapter.position = item.position

    db.commit()

    return HTTPException(detail="Reorder successfully", status_code=200)


@router.patch("/{course_id}/chapters/{chapter_id}", status_code=200, response_model=ChapterOut)
def update_chapter(
    db: SessionDep,
    course_id: int,
    chapter_id: int,
    chapter_in: ChapterUpdate,
    current_user: CurrentUser,
):
    chapter = db.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(detail="Chapter not found", status_code=404)

    get_course_by_owner(db=db, course_id=course_id, current_user=current_user)
    chapter.video_url = chapter_in.video_url
    db_obj = crud_chapter.update(
        db=db,
        db_obj=chapter,
        obj_in=chapter_in,
    )
    return db_obj


@router.delete("/{course_id}/chapters/{chapter_id}", status_code=200)
def delete_chapter(
    db: SessionDep,
    course_id: int,
    chapter_id: int,
    current_user: CurrentUser,
):
    chapter = db.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(detail="Chapter not found", status_code=404)
    course = get_course_by_owner(db=db, course_id=course_id, current_user=current_user)

    published_chapter = (
        db.query(Chapter).filter(Chapter.course_id == course_id, Chapter.is_published).all()
    )
    if not published_chapter:
        course.is_published = False
        db.commit()

    crud_chapter.delete(db=db, id=chapter_id)
    return HTTPException(detail="Chapter deleted", status_code=200)


@router.patch("/{course_id}/chapters/{chapter_id}/publish", status_code=200)
def publish_chapter(
    db: SessionDep,
    course_id: int,
    chapter_id: int,
    action: Literal["publish", "unpublish"],
    current_user: CurrentUser,
):
    chapter = crud_chapter.get_one(db=db, id=chapter_id)
    if not chapter:
        raise HTTPException(detail="Chapter not found", status_code=404)

    course = get_course_by_owner(db=db, course_id=course_id, current_user=current_user)

    if action == "publish":
        if not (chapter.title and chapter.description and chapter.video_url):
            raise HTTPException(detail="Missing required fields", status_code=400)

        chapter.is_published = True
        db.commit()
        return HTTPException(detail="Chapter is published", status_code=200)
    else:
        chapter.is_published = False
        db.commit()
        published_chapter = (
            db.query(Chapter).filter(Chapter.course_id == course_id, is_published=True).all()
        )
        if not published_chapter:
            course.is_published = False
            db.commit()

        return HTTPException(detail="Chapter is unpublished", status_code=200)


@router.get(
    "/{course_id}/chapters/{chapter_id}/dashboard",
    status_code=200,
    response_model=ChapterDashboard,
)
def chapter_in_dashboard(
    db: SessionDep,
    course_id: int,
    chapter_id: int,
    current_user: CurrentUser,
):
    purchase = (
        db.query(Purchase)
        .filter(
            Purchase.course_id == course_id,
            Purchase.owner_id == current_user.id,
        )
        .first()
    )
    course = db.query(Course).filter(Course.id == course_id).first()
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()

    if not course or not chapter:
        raise HTTPException(detail="Not found chapter or course", status_code=404)

    if chapter.is_free or purchase:
        next_chapter = (
            db.query(Chapter)
            .filter(
                Chapter.course_id == course_id,
                Chapter.is_published,
                Chapter.position >= chapter.position,
            )
            .order_by(Chapter.position.asc())
            .first()
        )

    user_progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.chapter_id == chapter_id,
            UserProgress.owner_id == current_user.id,
        )
        .first()
    )

    response_dict = {
        "purchase": purchase,
        "course_price": course.price,
        "chapter": chapter,
        "user_progress": user_progress,
        "next_chapter": next_chapter if chapter.is_free or purchase else None,
    }

    return response_dict
