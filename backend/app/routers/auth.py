from urllib.parse import urlencode
from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import httpx
import logging

logger = logging.getLogger(__name__)

from app.config import settings
from app.database import get_db
from app.models import User
from app.auth import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL   = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL  = "https://oauth2.googleapis.com/token"
GOOGLE_INFO_URL   = "https://www.googleapis.com/oauth2/v3/userinfo"

COOKIE_MAX_AGE    = 7 * 24 * 60 * 60  # 7 days in seconds


@router.get("/google")
async def google_login():
    """Redirect user to Google OAuth consent screen."""
    params = {
        "client_id":     settings.GOOGLE_CLIENT_ID,
        "redirect_uri":  settings.GOOGLE_CALLBACK_URL,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "offline",
    }
    return RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback — find/create user, set JWT cookie, redirect."""
    frontend = settings.FRONTEND_URL

    try:
        async with httpx.AsyncClient() as client:
            # Exchange code → access token
            token_res = await client.post(GOOGLE_TOKEN_URL, data={
                "client_id":     settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "code":          code,
                "grant_type":    "authorization_code",
                "redirect_uri":  settings.GOOGLE_CALLBACK_URL,
            })
            tokens = token_res.json()
            logger.error(f"Google token response: {tokens}")

            if 'access_token' not in tokens:
                logger.error(f"Token exchange failed: {tokens}")
                return RedirectResponse(f"{frontend}?error=auth_failed")

            # Get user profile from Google
            info_res = await client.get(
                GOOGLE_INFO_URL,
                headers={"Authorization": f"Bearer {tokens['access_token']}"},
            )
            info = info_res.json()
            logger.error(f"Google user info: {info}")

    except Exception as e:
        logger.error(f"Auth exception: {e}")
        return RedirectResponse(f"{frontend}?error=auth_failed")

    email = info.get("email")
    if not email:
        return RedirectResponse(f"{frontend}?error=no_email")

    # Find or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            email_id=email,
            name=info.get("name", email.split("@")[0]),
            first_name=info.get("given_name", ""),
            last_name=info.get("family_name", ""),
            role="USER",
            record_status="Active",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Generate JWT
    token = create_access_token({"id": user.id, "email": user.email})

    # Decide redirect based on user state
    if not user.registration_complete:
        redirect_to = f"{frontend}/register"
    elif not user.is_active:
        redirect_to = f"{frontend}/pending"
    else:
        redirect_to = f"{frontend}/dashboard"

    response = RedirectResponse(redirect_to)
    cookie_kwargs = dict(
        key="token",
        value=token,
        httponly=True,
        secure=settings.NODE_ENV == "production",
        samesite="lax",
        max_age=COOKIE_MAX_AGE,
    )
    # In production, scope the cookie to .swais.in so both swais.in and api.swais.in can read it
    if settings.COOKIE_DOMAIN:
        cookie_kwargs["domain"] = settings.COOKIE_DOMAIN
    logger.error(f"Setting cookie with domain: {settings.COOKIE_DOMAIN!r}, redirect to: {redirect_to}")
    response.set_cookie(**cookie_kwargs)
    return response


@router.post("/logout")
async def logout(response: Response):
    """Clear the JWT cookie."""
    response.delete_cookie("token")
    return {"message": "Logged out successfully"}
