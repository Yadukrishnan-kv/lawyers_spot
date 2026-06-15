from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.cms import load_cms

router = APIRouter(prefix="/api/v1", tags=["public"])


@router.get("/cms")
def get_public_cms(db: Session = Depends(get_db)):
    return load_cms(db).model_dump()
