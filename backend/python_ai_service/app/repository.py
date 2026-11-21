import json
from typing import List
from app.config import DATA_PATH
from datetime import datetime, timezone
from pymongo import MongoClient
from app.config import MONGO_URI, MONGO_DB_NAME

_mongo_client = MongoClient(MONGO_URI)
_mongo_db = _mongo_client[MONGO_DB_NAME]
users_collection = _mongo_db["users"]

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
    Upserts the Spring Boot registration response into MongoDB
    and returns the inserted/updated document ID.
    """
    user_doc = {
        "username": spring_response.get("username"),
        "email": spring_response.get("email"),
        "spring_message": spring_response.get("message", "User registered successfully!"),
        "auth_provider": "spring_boot_userservice",
        "registered_at": datetime.now(timezone.utc).isoformat(),
    }

    result = users_collection.update_one(
        {"username": user_doc["username"]},
        {"$set": user_doc},
        upsert=True,
    )

    if result.upserted_id:
        return str(result.upserted_id)

    existing = users_collection.find_one({"username": user_doc["username"]})
    return str(existing["_id"]) if existing else ""

def record_user_login(username: str) -> None:
    """
    Records the latest successful login timestamp for the user in MongoDB.
    """
    users_collection.update_one(
        {"username": username},
        {
            "$set": {
                "username": username,
                "last_login_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True,
    )

def sync_and_get_user_profile(username: str, email: str) -> dict:
    """
    Ensures MongoDB has the latest email from Spring Boot and returns
    stored metadata (registered_at, last_login_at).
    """
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

def record_user_logout(username: str) -> None:
    """
    Records the latest logout timestamp for the user in MongoDB.
    """
    if not username:
        return
    users_collection.update_one(
        {"username": username},
        {
            "$set": {
                "last_logout_at": datetime.now(timezone.utc).isoformat(),
            }
        },
    )