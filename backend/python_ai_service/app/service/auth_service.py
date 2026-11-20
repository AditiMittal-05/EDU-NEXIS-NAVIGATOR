import httpx
from fastapi import HTTPException
from app.config import SPRING_AUTH_BASE_URL
from app.repository import save_registered_user, sync_and_get_user_profile
from app.schemas import RegisterRequest, RegisterResponse
from app.repository import record_user_login, save_registered_user
from app.schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse , UserProfileResponse


async def proxy_register_and_store(payload: RegisterRequest) -> RegisterResponse:
    spring_register_url = f"{SPRING_AUTH_BASE_URL}/auth/register"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(
                spring_register_url,
                json={
                    "username": payload.username,
                    "email": payload.email,
                    "password": payload.password,
                },
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Spring Boot Auth Service unreachable: {str(exc)}",
            )

    if response.status_code not in (200, 201):
        try:
            err_body = response.json()
            err_msg = err_body.get("message") or err_body.get("error") or response.text
        except Exception:
            err_msg = response.text or "Registration failed in Spring Boot service."
        raise HTTPException(status_code=response.status_code, detail=err_msg)

    spring_data = response.json()

    # Store Spring Boot's output in MongoDB
    try:
        mongo_id = save_registered_user(spring_data)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"User created in Spring Boot, but failed to save in MongoDB: {str(exc)}",
        )

    return RegisterResponse(
        message=spring_data.get("message", "User registered successfully!"),
        username=spring_data.get("username", payload.username),
        email=spring_data.get("email", payload.email),
        mongo_id=mongo_id,
    )


async def proxy_login_and_log(payload: LoginRequest) -> LoginResponse:
    spring_login_url = f"{SPRING_AUTH_BASE_URL}/auth/login"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(
                spring_login_url,
                json={
                    "username": payload.username,
                    "password": payload.password,
                },
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Spring Boot Auth Service unreachable: {str(exc)}",
            )

    if response.status_code != 200:
        try:
            err_body = response.json()
            err_msg = err_body.get("message") or err_body.get("error") or response.text
        except Exception:
            err_msg = response.text or "Invalid username or password."
        raise HTTPException(status_code=response.status_code, detail=err_msg)

    spring_data = response.json()
    authenticated_user = spring_data.get("username", payload.username)

    try:
        record_user_login(authenticated_user)
    except Exception:
        pass  # Do not block user login if MongoDB audit logging hiccups

    return LoginResponse(
        token=spring_data["token"],
        type=spring_data.get("type", "Bearer"),
        username=authenticated_user,
    )

async def proxy_get_user_profile(authorization: str) -> UserProfileResponse:
    spring_profile_url = f"{SPRING_AUTH_BASE_URL}/user/profile"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                spring_profile_url,
                headers={"Authorization": authorization},
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Spring Boot UserService unreachable: {str(exc)}",
            )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Session expired or unauthorized. Please sign in again.",
        )

    spring_data = response.json()
    username = spring_data.get("username", "")
    email = spring_data.get("email", "")

    mongo_meta = {}
    try:
        mongo_meta = sync_and_get_user_profile(username, email)
    except Exception:
        pass

    return UserProfileResponse(
        username=username,
        email=email,
        registered_at=mongo_meta.get("registered_at"),
        last_login_at=mongo_meta.get("last_login_at"),
    )