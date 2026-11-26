import json
from datetime import datetime, timezone
from typing import List
from pymongo import MongoClient
from app.config import BASE_DIR, DATA_PATH, MONGO_DB_NAME, MONGO_URI

USERS_META_PATH = BASE_DIR / "data" / "users_meta.json"

_mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500, connectTimeoutMS=1500)
_mongo_db = _mongo_client[MONGO_DB_NAME]
users_collection = _mongo_db["users"]
opportunities_collection = _mongo_db["opportunities"]


def _load_local_users() -> dict:
    if not USERS_META_PATH.exists():
        return {}
    try:
        with open(USERS_META_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_local_users(users_map: dict) -> None:
    USERS_META_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(USERS_META_PATH, "w", encoding="utf-8") as f:
        json.dump(users_map, f, indent=2, ensure_ascii=False)


def load_opportunities() -> List[dict]:
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_opportunities(opportunities: List[dict]) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(opportunities, f, indent=2, ensure_ascii=False)


def save_registered_user(spring_response: dict) -> str:
    """
    Upserts the Spring Boot registration response into MongoDB,
    falling back automatically to local JSON metadata if MongoDB is offline.
    """
    username = spring_response.get("username")
    user_doc = {
        "username": username,
        "email": spring_response.get("email"),
        "spring_message": spring_response.get("message", "User registered successfully!"),
        "auth_provider": "spring_boot_userservice",
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        result = users_collection.update_one(
            {"username": username},
            {"$set": user_doc},
            upsert=True,
        )
        if result.upserted_id:
            return str(result.upserted_id)
        existing = users_collection.find_one({"username": username})
        return str(existing["_id"]) if existing else f"local-{username}"
    except Exception:
        users_map = _load_local_users()
        existing = users_map.get(username, {})
        existing.update(user_doc)
        users_map[username] = existing
        _save_local_users(users_map)
        return f"local-{username}"


def record_user_login(username: str) -> None:
    """
    Records the latest successful login timestamp in MongoDB or local fallback.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        users_collection.update_one(
            {"username": username},
            {"$set": {"username": username, "last_login_at": now_iso}},
            upsert=True,
        )
    except Exception:
        users_map = _load_local_users()
        existing = users_map.get(username, {"username": username})
        existing["last_login_at"] = now_iso
        users_map[username] = existing
        _save_local_users(users_map)


def sync_and_get_user_profile(username: str, email: str) -> dict:
    """
    Ensures metadata store has the latest email from Spring Boot and returns
    stored metadata (registered_at, last_login_at).
    """
    try:
        users_collection.update_one(
            {"username": username},
            {"$set": {"username": username, "email": email}},
            upsert=True,
        )
        doc = users_collection.find_one({"username": username}) or {}
        return {
            "registered_at": doc.get("registered_at"),
            "last_login_at": doc.get("last_login_at"),
        }
    except Exception:
        users_map = _load_local_users()
        existing = users_map.get(username, {"username": username})
        existing["email"] = email
        users_map[username] = existing
        _save_local_users(users_map)
        return {
            "registered_at": existing.get("registered_at"),
            "last_login_at": existing.get("last_login_at"),
        }


def record_user_logout(username: str) -> None:
    """
    Records the latest logout timestamp for the user in MongoDB or local fallback.
    """
    if not username:
        return
    now_iso = datetime.now(timezone.utc).isoformat()
    try:
        users_collection.update_one(
            {"username": username},
            {"$set": {"last_logout_at": now_iso}},
        )
    except Exception:
        users_map = _load_local_users()
        existing = users_map.get(username, {"username": username})
        existing["last_logout_at"] = now_iso
        users_map[username] = existing
        _save_local_users(users_map)


def upsert_opportunities_to_mongo(items: List[dict]) -> int:
    """
    Persists discovered opportunities into MongoDB `opportunities` collection
    deduplicated by `id`. Returns count of newly inserted documents.
    """
    inserted = 0
    for item in items:
        res = opportunities_collection.update_one(
            {"id": item["id"]},
            {"$set": item},
            upsert=True,
        )
        if res.upserted_id:
            inserted += 1
    return inserted