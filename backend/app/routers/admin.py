from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.auth import create_session_token, require_admin
from app.config import settings
from app.database import get_db
from app.schemas.cms import CmsDataSchema, LoginRequest
from app.services.cms import load_cms, save_cms

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.post("/auth/login")
def login(body: LoginRequest, response: Response):
    if body.email != settings.admin_email or body.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_session_token(body.email)
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        samesite="lax",
        path="/",
        max_age=settings.session_days * 86400,
    )
    return {"success": True}


@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key=settings.cookie_name, path="/")
    return {"success": True}


@router.get("/cms")
def get_admin_cms(
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    return load_cms(db).model_dump()


@router.put("/cms")
def put_admin_cms(
    body: CmsDataSchema,
    db: Session = Depends(get_db),
    _admin: str = Depends(require_admin),
):
    saved = save_cms(db, body)
    return saved.model_dump()
