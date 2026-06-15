import base64
import hashlib
import hmac
import time
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.config import settings


def create_session_token(email: str) -> str:
    exp = int((time.time() + settings.session_days * 86400) * 1000)
    payload = f"{email}|{exp}"
    sig = hmac.new(
        settings.admin_session_secret.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()
    raw = f"{payload}|{sig}".encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def verify_session_token(token: str | None) -> str | None:
    if not token:
        return None
    try:
        padded = token + "=" * (-len(token) % 4)
        decoded = base64.urlsafe_b64decode(padded.encode()).decode()
        parts = decoded.split("|")
        if len(parts) != 3:
            return None
        email, exp_str, sig = parts
        exp = int(exp_str)
        if not email or time.time() * 1000 > exp:
            return None
        payload = f"{email}|{exp}"
        expected = hmac.new(
            settings.admin_session_secret.encode(),
            payload.encode(),
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return None
        return email
    except Exception:
        return None


def require_admin(
    lawyerspot_admin_session: Annotated[str | None, Cookie(alias=settings.cookie_name)] = None,
) -> str:
    email = verify_session_token(lawyerspot_admin_session)
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    return email
