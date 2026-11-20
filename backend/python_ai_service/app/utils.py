import re
from typing import Set

STOP_WORDS = {
    "in", "of", "and", "the", "for", "with",
    "seeking", "role", "area", "job", "jobs", "to", "a"
}


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"[^a-z0-9\s+#]", "", text.lower())
    return re.sub(r"\s+", " ", cleaned).strip()


def extract_goal_tokens(goal: str) -> Set[str]:
    base_tokens = {
        w for w in normalize_text(goal or "").split()
        if len(w) > 2 and w not in STOP_WORDS
    }
    expanded = set(base_tokens)

    if "government" in expanded or "govt" in expanded:
        expanded.update([
            "government", "govt", "central", "upsc",
            "ssc", "kvs", "commission", "barc", "uppsc"
        ])
    if "teaching" in expanded or "teacher" in expanded:
        expanded.update([
            "teacher", "teaching", "ctet", "pedagogy",
            "bed", "educators", "faculty", "professor", "lecturer"
        ])

    return expanded