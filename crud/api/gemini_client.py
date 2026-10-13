# # api/gemini_client.py
# import os
# import re
# import time
# import json
# import requests
# from jsonschema import validate, ValidationError
# from dotenv import load_dotenv

# load_dotenv()

# API_KEY = os.getenv("GOOGLE_GENAI_API_KEY")
# MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
# API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={API_KEY}"

# # ------------------------------
# # JSON Schemas
# # ------------------------------
# QUIZ_ITEM_SCHEMA = {
#     "type": "object",
#     "properties": {
#         "question": {"type": "string"},
#         "options": {
#             "type": "array",
#             "minItems": 2,
#             "items": {"type": "string"}
#         },
#         "answer": {"type": "string"}
#     },
#     "required": ["question", "options", "answer"]
# }

# FLASHCARD_SCHEMA = {
#     "type": "object",
#     "properties": {
#         "term": {"type": "string"},
#         "definition": {"type": "string"},
#     },
#     "required": ["term", "definition"]
# }

# TOPIC_SCHEMA = {
#     "type": "object",
#     "properties": {
#         "topic": {"type": "string"},
#         "summary": {"type": "string"}
#     },
#     "required": ["topic", "summary"]
# }

# # ------------------------------
# # Helpers
# # ------------------------------
# def _strip_codefences(text: str) -> str:
#     """Remove ```json fences and other wrapping to get raw JSON."""
#     stripped = re.sub(r"```(?:json)?\s*", "", text).strip()
#     stripped = re.sub(r"\s*```$", "", stripped).strip()
#     return stripped.strip('` \n\t')


# def call_gemini(prompt_text: str, max_retries: int = 3, timeout: int = 30):
#     """
#     Call Gemini API with a text prompt.
#     Returns the full JSON response from the API.
#     """
#     payload = {"contents": [{"parts": [{"text": prompt_text}]}]}

#     for attempt in range(1, max_retries + 1):
#         resp = requests.post(API_URL, json=payload, timeout=timeout)
#         if resp.status_code == 200:
#             return resp.json()
#         elif resp.status_code == 429:  # rate limit
#             try:
#                 details = resp.json().get("error", {}).get("details", [])
#                 retry_info = next((d for d in details if d.get("@type", "").endswith("RetryInfo")), None)
#                 delay_s = 30
#                 if retry_info:
#                     raw = retry_info.get("retryDelay", "30s").replace("s", "")
#                     delay_s = int(raw)
#             except Exception:
#                 delay_s = 30
#             time.sleep(delay_s)
#             continue
#         else:
#             raise RuntimeError(f"Gemini error {resp.status_code}: {resp.text}")

#     raise RuntimeError("Exceeded Gemini retries")


# def parse_first_candidate_text(resp_json: dict) -> str:
#     """
#     Extract the text contents from the first candidate.
#     """
#     candidates = resp_json.get("candidates") or []
#     if not candidates:
#         raise ValueError("No candidates returned by Gemini")
#     try:
#         return candidates[0]["content"]["parts"][0]["text"]
#     except Exception as e:
#         raise ValueError("Unable to extract text from Gemini response") from e


# def parse_json_from_text_block(text_block: str):
#     """
#     Find JSON in a text block, handle code fences, and parse into python object.
#     """
#     clean = _strip_codefences(text_block)
#     try:
#         return json.loads(clean)
#     except json.JSONDecodeError:
#         # Try to locate first JSON object inside the block
#         m = re.search(r'(\{[\s\S]*\})', text_block)
#         if m:
#             try:
#                 return json.loads(m.group(1))
#             except json.JSONDecodeError:
#                 pass
#         raise ValueError("No valid JSON found in model output")

# # ------------------------------
# # Validators
# # ------------------------------
# def validate_quiz_items(items):
#     valid = []
#     for it in items:
#         try:
#             validate(instance=it, schema=QUIZ_ITEM_SCHEMA)
#             valid.append(it)
#         except ValidationError:
#             continue
#     return valid


# def validate_flashcards(items):
#     valid = []
#     for it in items:
#         try:
#             validate(instance=it, schema=FLASHCARD_SCHEMA)
#             valid.append(it)
#         except ValidationError:
#             continue
#     return valid


# def validate_topics(items):
#     valid = []
#     for it in items:
#         try:
#             validate(instance=it, schema=TOPIC_SCHEMA)
#             valid.append(it)
#         except ValidationError:
#             continue
#     return valid

# # ------------------------------
# # Public wrapper
# # ------------------------------
# def gemini_generate(prompt_text: str, expect_json: bool = True):
#     """
#     Wrapper: sends prompt -> Gemini -> returns parsed JSON (if expect_json=True).
#     """
#     resp_json = call_gemini(prompt_text)
#     text = parse_first_candidate_text(resp_json)

#     if not expect_json:
#         return text

#     try:
#         return parse_json_from_text_block(text)
#     except Exception:
#         # fallback: return raw text in case of parsing issues
#         return {"raw_text": text}


# def generate_resources_for_topic(topics):
#     """
#     Uses Gemini API to generate resource suggestions for weak topics.
#     Returns a list of resource dictionaries.
#     """
#     prompt = f"""
#     The user scored low in these topics: {', '.join(topics)}.
#     Suggest 3 short extra learning tasks for each topic,
#     each with a direct resource link (free if possible).
#     Format as JSON list where each element is:
#     {{
#         "topic": "<topic>",
#         "task": "<short learning activity>",
#         "resource_link": "<direct link>"
#     }}
#     """

#     ai_response = gemini_generate(prompt, expect_json=True)

#     # Fallback to static example
#     if not ai_response or not isinstance(ai_response, list):
#         ai_response = [
#             {
#                 "topic": topic,
#                 "task": "Watch a YouTube tutorial",
#                 "resource_link": "https://www.youtube.com"
#             }
#             for topic in topics
#         ]

#     return ai_response
# api/gemini_client.py
# api/gemini_client.py
import os
import re
import time
import json
import logging
import requests
from pathlib import Path
from jsonschema import validate, ValidationError
from dotenv import load_dotenv

# Load .env from project root (two levels up from api/gemini_client.py)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

API_KEY = os.getenv("GOOGLE_GENAI_API_KEY")
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
API_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL_NAME}:generateContent?key={API_KEY}"
)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# ─────────────────────────────────────────
# GeminiError — returned instead of raising exceptions
# ─────────────────────────────────────────
class GeminiError:
    """
    Returned by call_gemini() when the API fails.
    Callers check: if isinstance(result, GeminiError): ...
    Never raises, so background threads don't crash.
    """
    def __init__(self, error_type: str, message: str):
        self.error_type = error_type  # quota_exceeded | rate_limited | api_error | timeout
        self.message = message

    def to_dict(self):
        return {"error": self.message, "error_type": self.error_type}

    def __repr__(self):
        return f"GeminiError({self.error_type}: {self.message})"


# ─────────────────────────────────────────
# JSON Schemas
# ─────────────────────────────────────────
QUIZ_ITEM_SCHEMA = {
    "type": "object",
    "properties": {
        "question": {"type": "string"},
        "options": {"type": "array", "minItems": 2, "items": {"type": "string"}},
        "answer": {"type": "string"},
    },
    "required": ["question", "options", "answer"],
}

FLASHCARD_SCHEMA = {
    "type": "object",
    "properties": {"term": {"type": "string"}, "definition": {"type": "string"}},
    "required": ["term", "definition"],
}

TOPIC_SCHEMA = {
    "type": "object",
    "properties": {"topic": {"type": "string"}, "summary": {"type": "string"}},
    "required": ["topic", "summary"],
}


# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────
def _strip_codefences(text: str) -> str:
    stripped = re.sub(r"```(?:json)?\s*", "", text).strip()
    stripped = re.sub(r"\s*```$", "", stripped).strip()
    return stripped.strip("` \n\t")


# ─────────────────────────────────────────
# Core API call — never raises, returns GeminiError on failure
# ─────────────────────────────────────────
def call_gemini(prompt_text: str, max_retries: int = 3, timeout: int = 30):
    """
    Call Gemini API with retry logic.
    Returns:
        dict  — successful API response
        GeminiError — on any failure (quota, rate limit, network, timeout)
    Never raises exceptions.
    """
    if not API_KEY:
        logger.error("[Gemini] GOOGLE_GENAI_API_KEY not set in .env")
        return GeminiError("config_error", "Gemini API key not configured.")

    payload = {"contents": [{"parts": [{"text": prompt_text}]}]}
    delay = 5

    for attempt in range(1, max_retries + 1):
        try:
            resp = requests.post(API_URL, json=payload, timeout=timeout)

            if resp.status_code == 200:
                return resp.json()

            if resp.status_code == 429:
                error_data = resp.json().get("error", {})
                error_msg = error_data.get("message", "")

                # Hard quota exceeded — no point retrying
                if "quota" in error_msg.lower() and ("limit: 0" in error_msg or "exhausted" in error_msg.lower()):
                    logger.error("[Gemini] Free tier quota exhausted")
                    return GeminiError(
                        "quota_exceeded",
                        "Gemini API free quota exhausted. Enable billing at console.cloud.google.com "
                        "or wait until the quota resets (usually midnight PST)."
                    )

                # Soft rate limit — retry with backoff
                logger.warning(f"[Gemini] 429 rate limited. Retry {attempt}/{max_retries}")
                try:
                    details = error_data.get("details", [])
                    retry_info = next(
                        (d for d in details if d.get("@type", "").endswith("RetryInfo")), None
                    )
                    if retry_info:
                        delay = int(retry_info.get("retryDelay", "30s").replace("s", ""))
                except Exception:
                    delay = min(delay * 2, 60)
                time.sleep(delay)
                continue

            if resp.status_code == 503:
                logger.warning(f"[Gemini] 503 overloaded. Retry {attempt}/{max_retries}")
                time.sleep(delay)
                delay = min(delay * 2, 60)
                continue

            logger.error(f"[Gemini] Error {resp.status_code}: {resp.text[:200]}")
            return GeminiError("api_error", f"Gemini API returned {resp.status_code}")

        except requests.Timeout:
            logger.warning(f"[Gemini] Timeout on attempt {attempt}")
            if attempt == max_retries:
                return GeminiError("timeout", "Gemini API request timed out after retries.")
            time.sleep(delay)
            delay = min(delay * 2, 60)

        except requests.RequestException as e:
            logger.warning(f"[Gemini] Request failed on attempt {attempt}: {e}")
            if attempt == max_retries:
                return GeminiError("network_error", f"Network error: {str(e)[:100]}")
            time.sleep(delay)
            delay = min(delay * 2, 60)

    return GeminiError("rate_limited", "Gemini API temporarily unavailable. Try again later.")


# ─────────────────────────────────────────
# Response parsing
# ─────────────────────────────────────────
def parse_first_candidate_text(resp_json: dict) -> str:
    """Extract text from the first Gemini candidate."""
    candidates = resp_json.get("candidates") or []
    if not candidates:
        raise ValueError("No candidates returned by Gemini")
    try:
        return candidates[0]["content"]["parts"][0]["text"]
    except Exception as e:
        raise ValueError("Unable to extract text from Gemini response") from e


def parse_json_from_text_block(text_block: str):
    """Parse JSON from a text block (handles code fences)."""
    clean = _strip_codefences(text_block)
    try:
        return json.loads(clean)
    except json.JSONDecodeError:
        m = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text_block)
        if m:
            try:
                return json.loads(m.group(1))
            except json.JSONDecodeError:
                pass
        raise ValueError("No valid JSON found in Gemini output")


# ─────────────────────────────────────────
# Validators
# ─────────────────────────────────────────
def _valid(item, schema):
    try:
        validate(instance=item, schema=schema)
        return True
    except ValidationError:
        return False


def validate_quiz_items(items):
    return [it for it in items if _valid(it, QUIZ_ITEM_SCHEMA)]


def validate_flashcards(items):
    return [it for it in items if _valid(it, FLASHCARD_SCHEMA)]


def validate_topics(items):
    return [it for it in items if _valid(it, TOPIC_SCHEMA)]


# ─────────────────────────────────────────
# Public wrapper
# ─────────────────────────────────────────
def gemini_generate(prompt_text: str, expect_json: bool = True):
    """
    Send a prompt to Gemini and return parsed result.
    Never raises — returns dict with 'error' key on failure.
    """
    result = call_gemini(prompt_text)

    # Handle GeminiError object
    if isinstance(result, GeminiError):
        return result.to_dict()

    if not result:
        return {"error": "Gemini service unavailable.", "error_type": "unknown"}

    try:
        text = parse_first_candidate_text(result)
    except ValueError as e:
        return {"error": str(e), "error_type": "parse_error"}

    if not expect_json:
        return text

    try:
        return parse_json_from_text_block(text)
    except Exception:
        return {"raw_text": text}


def generate_resources_for_topic(topics: list) -> list:
    """
    Ask Gemini for learning resources for given topics.
    Falls back to YouTube links on failure.
    """
    topics_str = ", ".join(str(t) for t in topics)
    prompt = f"""For topics: {topics_str}
Suggest 3 learning tasks each with a free resource link.
Return ONLY a JSON array:
[{{"topic":"...","task":"...","resource_link":"..."}}]"""

    result = gemini_generate(prompt, expect_json=True)

    if not result or not isinstance(result, list):
        return [
            {
                "topic": str(topic),
                "task": "Watch an introductory video",
                "resource_link": f"https://www.youtube.com/results?search_query={str(topic).replace(' ', '+')}",
            }
            for topic in topics
        ]
    return result