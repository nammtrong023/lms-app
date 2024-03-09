import logging

from app.api.deps import CurrentUser, SessionDep
from app.config import config
from app.crud.user import crud_user
from app.models import User
from app.schemas.user import PasswordRecovery, UserBase, UserCreate, UserLogin
from app.security import create_token, get_subject_token_type
from app.utils import send_email
from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/register", status_code=201)
def register(
    db: SessionDep,
    user_in: UserCreate,
    background_tasks: BackgroundTasks,
):
    if crud_user.get_by_email(db=db, email=user_in.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with that email already exists",
        )
    crud_user.create(db=db, obj_in=user_in)
    confirm_token = create_token(email=user_in.email, type='confirm')
    link = f"{config.FRONTEND_URL}/confirm?confirm_token={confirm_token}"

    background_tasks.add_task(
        send_email,
        user_in.email,
        link,
        "Active account",
        "active-email.html",
    )
    return {"detail": "User created. Please confirm your email."}


@router.post("/login", status_code=200)
def login(db: SessionDep, user_in: UserLogin):
    user = crud_user.authenticate(db=db, email=user_in.email, password=user_in.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token = create_token(user.email, 'access')
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/active-email", status_code=200)
async def active_email(
    db: SessionDep,
    request: Request,
):
    data = await request.json()
    token = data.get("token")
    if not token:
        raise HTTPException(detail="Token is required", status_code=400)

    email = get_subject_token_type(token=token, type='confirm')
    db.query(User).filter(User.email == email).update({"is_active": True})
    db.commit()

    access_token = create_token(email, 'access')
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/verify-email", status_code=200)
async def verify_email(db: SessionDep, request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    email = payload["email"]
    if not email:
        raise HTTPException(detail="Email is required", status_code=400)

    existing_email = crud_user.get_by_email(db=db, email=email)
    if not existing_email:
        raise HTTPException(detail="Email not found", status_code=404)

    recovery_token = create_token(email=email, type='recovery')
    link = f"{config.FRONTEND_URL}/recovery?recovery_token={recovery_token}"

    background_tasks.add_task(
        send_email,
        email,
        link,
        "Recovery password",
        "recovery-template.html",
    )
    return {"detail": "Please check your email"}


@router.post("/password-recovery", status_code=200)
def password_recovery(db: SessionDep, recovery_token: str, obj_in: PasswordRecovery):
    email = get_subject_token_type(token=recovery_token, type='recovery')

    if obj_in.password != obj_in.confirm_password:
        raise HTTPException(detail="Password does not match", status_code=400)

    user = crud_user.get_by_email(db=db, email=email)
    crud_user.update(db=db, db_obj=user, obj_in=obj_in)

    access_token = create_token(email, 'access')
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/current-user", status_code=200, response_model=UserBase)
def get_current_user(current_user: CurrentUser):
    return current_user
