from fastapi import APIRouter, HTTPException, Header
from app.schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse , UserProfileResponse
from app.service.auth_service import proxy_get_user_profile, proxy_login_and_log, proxy_register_and_store

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=RegisterResponse)
async def register_user(payload: RegisterRequest):
    return await proxy_register_and_store(payload)


@router.post("/login", response_model=LoginResponse)
async def login_user(payload: LoginRequest):
    return await proxy_login_and_log(payload)

@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(authorization: str = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Bearer token.")
    return await proxy_get_user_profile(authorization)