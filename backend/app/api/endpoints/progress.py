from app.api.deps import CurrentUser, SessionDep
from app.models import Chapter, Course, UserProgress
from app.schemas.chapter import ChapterProgressComplete
from fastapi import APIRouter, HTTPException

router = APIRouter()


def get_progress_percentage(db: SessionDep, course_id: int, owner_id: int):
    published_chapters = (
        db.query(Chapter.id)
        .filter(
            Chapter.course_id == course_id,
            Chapter.is_published,
        )
        .all()
    )

    published_chapter_ids = [chapter.id for chapter in published_chapters]
    if len(published_chapter_ids) <= 0:
        return None

    completed_chapters = (
        db.query(UserProgress)
        .filter(
            UserProgress.owner_id == owner_id,
            UserProgress.chapter_id.in_(published_chapter_ids),
            UserProgress.is_completed,
        )
        .count()
    )

    progress_percentage = round((completed_chapters / len(published_chapter_ids)) * 100, 1)
    return progress_percentage


@router.get("/{course_id}", status_code=200)
def get_progress(
    db: SessionDep,
    course_id: int,
    current_user: CurrentUser,
):
    progress_percentage = get_progress_percentage(
        db=db,
        course_id=course_id,
        owner_id=current_user.id,
    )
    return progress_percentage


@router.put(
    "/courses/{course_id}/chapters/{chapter_id}/progress",
    status_code=200,
    response_model=None,
)
def chapter_progress(
    db: SessionDep,
    course_id: int,
    chapter_id: int,
    current_user: CurrentUser,
    progress_data: ChapterProgressComplete,
):
    chapter = db.get(Chapter, chapter_id)
    if not chapter:
        raise HTTPException(detail="Chapter not found", status_code=404)

    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(detail="Course not found", status_code=404)

    user_progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.chapter_id == chapter_id,
            UserProgress.owner_id == current_user.id,
        )
        .first()
    )

    if user_progress:
        user_progress.is_completed = progress_data.is_completed
    else:
        data = UserProgress(
            chapter_id=chapter_id,
            owner_id=current_user.id,
            is_completed=progress_data.is_completed,
        )
        db.add(data)
        user_progress = data

    db.commit()
    db.refresh(user_progress)

    return user_progress
