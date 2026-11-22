import httpx
from app.config import LLM_API_KEY, LLM_BASE_URL, LLM_MODEL, LLM_PROVIDER


def chat_completion(messages: list[dict], temperature: float = 0.0, json_mode: bool = False) -> str:
    """
    Centralized LLM Client using pure httpx (no blocked C-extension DLLs).
    Swap providers in app/config.py by updating LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL.
    """
    if not LLM_API_KEY or "YOUR_" in LLM_API_KEY:
        raise ValueError(
            f"Valid LLM_API_KEY not configured for provider '{LLM_PROVIDER}'. "
            "Set LLM_API_KEY in app/config.py or as an environment variable."
        )

    url = f"{LLM_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": LLM_MODEL,
        "messages": messages,
        "temperature": temperature,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=45.0) as client:
        resp = client.post(url, headers=headers, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"]