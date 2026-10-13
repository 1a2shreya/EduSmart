"""
EduSmart Views
Key fixes vs previous version:
  1. AdaptStudyPlanAPI — checks isinstance(result, GeminiError) before parse_first_candidate_text
  2. UpdateStudyPlanAPI — accepts both 'id'/'plan_id', handles plan_data update mode correctly
  3. StudyPlanListView — returns lightweight list (no heavy plan_data) to fix 6.3MB response
  4. ForgotPasswordAPI/ResetPasswordAPI — filter().first() no crash on duplicate emails
  5. SubmitQuizAttemptView — 1 batched Gemini call for explanations
"""

import os
import re
import json
import traceback
import random
from threading import Thread
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Avg, Count, Sum

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework.throttling import AnonRateThrottle

import docx
import fitz  # PyMuPDF

from .models import (
    NoteUpload, TopicSummary, QuizQuestion, Flashcard,
    QuizAttempt, Profile, QuizResponse, StudyPlan, ResourceVisitLog,
    FlashcardReviewLog,
)
from .serializers import (
    NoteUploadSerializer, RegisterSerializer, UserSerializer,
    TopicSummarySerializer, QuizAttemptSerializer, FlashcardSerializer,
    ProfileUpdateSerializer, QuizQuestionSerializer, StudyPlanSerializer,
)
import time
from .gemini_client import (
    call_gemini, parse_first_candidate_text, GeminiError,
    parse_json_from_text_block, validate_topics, gemini_generate,
    validate_flashcards, validate_quiz_items, generate_resources_for_topic,
)
from ml.career_model import predict_career
from .roadmap import get_roadmap, get_learning_resources, get_salary
from scraper.intershala_scraper import scrape_internshala_jobs


class AuthRateThrottle(AnonRateThrottle):
    rate = '5/minute'
    scope = 'auth'


# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────
def generate_otp():
    return str(random.randint(100000, 999999))


def _ics_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n")


def _extract_json_block(text: str):
    if not text:
        return None
    m = re.search(r"```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```", text, flags=re.S | re.I)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    try:
        return json.loads(text)
    except Exception:
        starts = [i for i in [text.find('['), text.find('{')] if i != -1]
        if not starts:
            return None
        frag = text[min(starts):]
        end = max(frag.rfind(']'), frag.rfind('}'))
        if end > 0:
            try:
                return json.loads(frag[:end + 1])
            except Exception:
                return None
    return None


def _ensure_list_resources(resources):
    out = []
    if not resources:
        return out
    if isinstance(resources, dict):
        for k, v in resources.items():
            out.append({
                "title": str(k), "url": str(v),
                "type": "video" if "youtube" in str(v).lower() else "article",
                "visited": False, "time_spent": 0
            })
    elif isinstance(resources, list):
        for r in resources:
            if isinstance(r, str):
                out.append({"title": r, "url": r, "type": "article", "visited": False, "time_spent": 0})
            elif isinstance(r, dict):
                out.append({
                    "title": str(r.get("title") or r.get("name") or r.get("label") or "Resource"),
                    "url": str(r.get("url") or r.get("link") or r.get("href") or ""),
                    "type": r.get("type", "article"),
                    "visited": bool(r.get("visited", False)),
                    "time_spent": int(r.get("time_spent", 0))
                })
    elif isinstance(resources, str):
        out.append({"title": "Resource", "url": resources, "type": "article", "visited": False, "time_spent": 0})
    return out


def _ensure_task_schema(task, default_type="reading"):
    t = {}
    if isinstance(task, dict):
        title = task.get("title") or task.get("task") or task.get("topic") or "Untitled Task"
        t["title"] = str(title)
        t["type"] = str(task.get("type") or default_type).lower()
        raw = task.get("resources") or get_learning_resources(title)
        t["resources"] = _ensure_list_resources(raw)
        t["done"] = bool(task.get("done", False))
        if task.get("topic"):
            t["topic"] = str(task["topic"])
        if task.get("description"):
            t["description"] = str(task["description"])
    else:
        title = str(task)
        t["title"] = title
        t["type"] = default_type
        t["resources"] = _ensure_list_resources(get_learning_resources(title))
        t["done"] = False
    if t["type"] not in {"reading", "video", "article", "quiz", "study"}:
        t["type"] = default_type
    return t


def _normalize_task(task):
    if not isinstance(task, dict):
        return {"title": str(task), "type": "article", "done": False,
                "topic": str(task), "resources": [], "description": ""}
    title = task.get("title") or task.get("task") or task.get("topic") or "Untitled Task"
    ttype = (task.get("type") or "article").lower()
    if ttype not in {"reading", "video", "article", "quiz", "study"}:
        ttype = "video" if any(
            isinstance(r, dict) and r.get("type") == "video"
            for r in task.get("resources", [])
        ) else "article"
    return {
        "title": str(title),
        "type": ttype,
        "done": bool(task.get("done", False)),
        "topic": task.get("topic") or str(title),
        "resources": _ensure_list_resources(task.get("resources") or []),
        "description": (task.get("description") or "").strip()
    }


def update_plan_status(plan_data: dict) -> dict:
    weeks = plan_data.get("weeks", [])
    total = sum(len(w.get("tasks", [])) for w in weeks)
    done = sum(1 for w in weeks for t in w.get("tasks", []) if t.get("done"))
    progress = round((done / total) * 100, 2) if total else 0.0
    sv = "NOT_STARTED" if (total == 0 or done == 0) else ("COMPLETED" if done == total else "IN_PROGRESS")
    plan_data["progress"] = progress
    plan_data["status"] = sv
    if sv == "COMPLETED":
        plan_data.setdefault("completed_at", timezone.now().isoformat())
        plan_data["next_steps"] = [
            "Take a mock interview based on this plan.",
            "Create an advanced plan on tougher topics.",
            "Apply to 2–3 internships related to your plan.",
        ]
    else:
        plan_data.pop("completed_at", None)
        plan_data.pop("next_steps", None)
    return plan_data


def _career_weeks_from_roadmap(career: str):
    raw = get_roadmap(career) or {}
    weeks = []
    if isinstance(raw, dict):
        for name, task_items in raw.items():
            tasks = []
            for item in (task_items or []):
                topic = item.get("topic") or item.get("title") or "Study Topic"
                resources = item.get("resources") or get_learning_resources(topic)
                tasks.append(_ensure_task_schema({
                    "title": topic, "type": "reading",
                    "topic": topic, "resources": resources, "done": False
                }))
            weeks.append({"title": name, "tasks": tasks})
    return weeks


def add_dates_to_weeks(roadmap_weeks):
    start_date = datetime.today()
    weeks_with_dates = []
    if isinstance(roadmap_weeks, dict):
        for i, (title, tasks) in enumerate(roadmap_weeks.items()):
            week_start = start_date + timedelta(weeks=i)
            normalized = [
                _normalize_task(
                    {**t, "resources": t.get("resources", [])} if isinstance(t, dict)
                    else {"title": str(t), "resources": get_learning_resources(t)}
                )
                for t in (tasks or [])
            ]
            weeks_with_dates.append({
                "week": i + 1, "title": str(title),
                "starts_on": week_start.strftime("%Y-%m-%d"), "tasks": normalized
            })
    elif isinstance(roadmap_weeks, list):
        for i, w in enumerate(roadmap_weeks):
            week_start = start_date + timedelta(weeks=i)
            title = (w or {}).get("title") or f"Week {(w or {}).get('week', i+1)}"
            normalized = [_normalize_task(t) for t in (w or {}).get("tasks", [])]
            weeks_with_dates.append({
                "week": i + 1, "title": str(title),
                "starts_on": week_start.strftime("%Y-%m-%d"), "tasks": normalized
            })
    return weeks_with_dates


def _build_weeks_from_notes(user, note_ids):
    """Build study plan weeks from note topics — proper structure for notes plan."""
    notes_qs = NoteUpload.objects.filter(
        id__in=note_ids, user=user, status="COMPLETED"
    ).prefetch_related("topics", "quiz_questions")

    weeks = []
    all_topics = []

    for note in notes_qs:
        for t in note.topics.all():
            if t.topic:
                all_topics.append({
                    "topic": t.topic,
                    "summary": t.summary,
                    "note_title": note.title,
                    "note_id": note.id,
                })

    # Group topics into weeks (3 topics per week)
    TOPICS_PER_WEEK = 3
    for wi in range(0, max(len(all_topics), 1), TOPICS_PER_WEEK):
        chunk = all_topics[wi:wi + TOPICS_PER_WEEK]
        week_num = (wi // TOPICS_PER_WEEK) + 1
        week_start = datetime.today() + timedelta(weeks=wi // TOPICS_PER_WEEK)
        tasks = []

        for item in chunk:
            topic = item["topic"]
            note_id = item.get("note_id")
            note_title = item.get("note_title", "")
            # Study task with resources
            resources = _ensure_list_resources(get_learning_resources(topic))
            tasks.append({
                "title": f"Study: {topic}",
                "topic": topic,
                "note_id": note_id,
                "note_title": note_title,
                "type": "reading",
                "description": item.get("summary", "")[:200],
                "resources": resources,
                "done": False,
            })
            # Quiz task
            tasks.append({
                "title": f"Quiz: {topic}",
                "topic": topic,
                "note_id": note_id,
                "note_title": note_title,
                "type": "quiz",
                "resources": [],
                "done": False,
            })

        if tasks:
            weeks.append({
                "week": week_num,
                "title": f"Week {week_num}",
                "starts_on": week_start.strftime("%Y-%m-%d"),
                "tasks": tasks,
            })

    if not weeks:
        weeks = [{
            "week": 1, "title": "Week 1",
            "starts_on": datetime.today().strftime("%Y-%m-%d"),
            "tasks": [
                {"title": "Review your notes", "type": "reading",
                 "resources": [], "done": False},
                {"title": "Create flashcards", "type": "reading",
                 "resources": [], "done": False},
            ]
        }]

    return weeks, notes_qs


def add_adaptive_resources(user, topic_scores: dict):
    try:
        plan = StudyPlan.objects.filter(user=user, status="active").latest("created_at")
    except StudyPlan.DoesNotExist:
        return None
    plan_data = plan.plan_data or {}
    plan_data.setdefault("extra", [])
    weak_topics = [t for t, pct in (topic_scores or {}).items() if pct < 70]
    if weak_topics:
        try:
            extra_res = generate_resources_for_topic(weak_topics)
        except Exception:
            extra_res = [
                {"title": f"{t} tutorial",
                 "url": f"https://www.youtube.com/results?search_query={t}+tutorial",
                 "type": "video", "visited": False}
                for t in weak_topics
            ]
        plan_data["extra"].append({"topics": weak_topics, "resources": _ensure_list_resources(extra_res)})
    plan.plan_data = update_plan_status(plan_data)
    plan.save()
    return plan


# ─────────────────────────────────────────
# File extraction
# ─────────────────────────────────────────
class FileExtractor:
    @staticmethod
    def extract_text(file_obj, filename):
        name = filename.lower()
        if name.endswith(".pdf"):
            doc = fitz.open(stream=file_obj.read(), filetype="pdf")
            return "\n".join([p.get_text() for p in doc])
        if name.endswith(".docx"):
            return "\n".join([p.text for p in docx.Document(file_obj).paragraphs])
        if name.endswith(".txt"):
            return file_obj.read().decode("utf-8", errors="ignore")
        raise ValueError("Unsupported file format. Use PDF, DOCX, or TXT.")


def split_text_into_chunks(text, chunk_size=3500):
    return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]


def process_note_task(note_id):
    from .models import NoteUpload, TopicSummary, Flashcard, QuizQuestion

    try:
        note = NoteUpload.objects.get(id=note_id)
    except NoteUpload.DoesNotExist:
        return

    try:
        note.status = 'PROCESSING'
        note.save(update_fields=['status'])

        text = (note.content or "").strip()
        if not text:
            raise ValueError("Note content is empty.")

        # ✅ Single prompt — 1 API call, no parallel threads
        # First 6000 chars fits free-tier context window safely
        content = text[:6000]

        prompt = f"""You are an educational assistant. Analyze the study notes below.

Return ONLY a valid JSON object with exactly these 3 keys:
{{
  "topics": [
    {{"topic": "Topic Name", "summary": "2-3 sentence summary"}}
  ],
  "flashcards": [
    {{"term": "Key term", "definition": "Clear definition"}}
  ],
  "quiz": [
    {{
      "question": "A clear question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exactly one of the option texts above"
    }}
  ]
}}

Generate 3-6 topics, 5-10 flashcards, 5-10 quiz questions.
Return ONLY the JSON — no explanation, no markdown, no code fences.

Study Notes:
{content}
"""

        # ✅ Retry up to 3 times with 35s delay on rate limit
        parsed = None
        for attempt in range(1, 4):
            result = call_gemini(prompt, max_retries=1, timeout=60)

            if isinstance(result, GeminiError):
                if result.error_type == "quota_exceeded":
                    print(f"[NoteProcessor] Quota exhausted — cannot process note {note_id}.")
                    raise RuntimeError("Gemini quota exhausted.")
                print(f"[NoteProcessor] Gemini unavailable (attempt {attempt}/3). Waiting 35s...")
                time.sleep(35)
                continue

            if result is None:
                print(f"[NoteProcessor] No response (attempt {attempt}/3). Waiting 35s...")
                time.sleep(35)
                continue

            try:
                text_response = parse_first_candidate_text(result)
                parsed = parse_json_from_text_block(text_response)
                break  # ✅ Success
            except Exception as e:
                print(f"[NoteProcessor] Parse failed attempt {attempt}: {e}")
                time.sleep(5)
                continue

        if not parsed or not isinstance(parsed, dict):
            raise RuntimeError(
                "Gemini could not process this note after 3 attempts. "
                "Wait 1 minute and re-upload."
            )

        topics_data    = validate_topics(parsed.get("topics", []))
        flashcards_data = validate_flashcards(parsed.get("flashcards", []))
        quiz_data      = validate_quiz_items(parsed.get("quiz", []))

        print(f"[NoteProcessor] Note {note_id}: "
              f"{len(topics_data)} topics, {len(flashcards_data)} flashcards, "
              f"{len(quiz_data)} quiz questions")

        if not topics_data and not flashcards_data and not quiz_data:
            raise ValueError("Gemini returned empty results. Note may be too short.")

        if topics_data:
            TopicSummary.objects.bulk_create([
                TopicSummary(note=note, topic=t["topic"], summary=t["summary"])
                for t in topics_data
            ])

        if flashcards_data:
            Flashcard.objects.bulk_create([
                Flashcard(note=note, owner=note.user, term=f["term"],
                          definition=f["definition"], next_review=timezone.now())
                for f in flashcards_data
            ])

        for q in quiz_data:
            opts = (q.get("options") or [])[:4]
            answer_text = (q.get("answer") or "").strip().lower()
            opt_map = {chr(65 + i): opt for i, opt in enumerate(opts)}
            correct_key = next(
                (k for k, v in opt_map.items() if (v or "").strip().lower() == answer_text),
                "A"
            )
            QuizQuestion.objects.create(
                note=note, question=q["question"],
                options=opt_map, answer=correct_key, difficulty="medium"
            )

        note.status = 'COMPLETED'
        note.save(update_fields=['status'])
        print(f"[NoteProcessor] ✅ Note {note_id} processed successfully.")

    except Exception as e:
        traceback.print_exc()
        print(f"[NoteProcessor] ❌ Note {note_id} failed: {e}")
        try:
            note.status = 'FAILED'
            note.save(update_fields=['status'])
        except Exception:
            pass


# ─────────────────────────────────────────
# AUTH
# ─────────────────────────────────────────
class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.otp = generate_otp()
        profile.is_verified = False
        profile.otp_created_at = timezone.now()
        profile.save()
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        send_mail("EduSmart — Verify Your Account",
                  f"Your OTP is: {profile.otp}\nExpires in 10 minutes.",
                  "noreply@edusmart.com", [user.email], fail_silently=True)
        return Response({
            "token": token.key,
            "user": UserSerializer(user).data,
            "is_verified": False,
            "message": "OTP sent to your email.",
        }, status=201)


class VerifyOTP(APIView):
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        try:
            user = User.objects.get(username=request.data.get("username", ""))
            profile = Profile.objects.get(user=user)
            otp_age = timezone.now() - profile.otp_created_at
            if otp_age.total_seconds() > 600:
                return Response({"error": "OTP expired. Request a new one."}, status=400)
            if profile.otp != request.data.get("otp"):
                return Response({"error": "Invalid OTP."}, status=400)
            profile.is_verified = True
            profile.otp = None
            profile.save()
            return Response({"message": "Account verified!"})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)


class ResendOTPAPI(APIView):
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        try:
            user = User.objects.get(username=request.data.get("username", ""))
            profile = Profile.objects.get(user=user)
            if profile.is_verified:
                return Response({"message": "Account already verified."}, status=400)
            profile.otp = generate_otp()
            profile.otp_created_at = timezone.now()
            profile.save()
            send_mail("EduSmart OTP — Resend",
                      f"Your new OTP: {profile.otp}\nExpires in 10 minutes.",
                      "noreply@edusmart.com", [user.email], fail_silently=True)
            return Response({"message": "New OTP sent."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)


class LoginAPI(APIView):
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        user = authenticate(
            username=request.data.get("username", ""),
            password=request.data.get("password", "")
        )
        if not user:
            return Response({"error": "Invalid credentials."}, status=400)
        profile = Profile.objects.get(user=user)
        if not profile.is_verified:
            return Response({"error": "Account not verified. Check your email for OTP."}, status=403)
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username, "is_verified": True})


class LogoutAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response({"message": "Logged out."})


class ForgotPasswordAPI(APIView):
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        email = request.data.get("email", "").strip()
        if not email:
            return Response({"error": "Email is required."}, status=400)
        try:
            user = User.objects.filter(email=email).first()  # ✅ no crash on duplicates
            if user:
                profile = Profile.objects.get(user=user)
                profile.otp = generate_otp()
                profile.otp_created_at = timezone.now()
                profile.save()
                send_mail("EduSmart — Password Reset OTP",
                          f"Your OTP: {profile.otp}\nExpires in 10 minutes.",
                          "noreply@edusmart.com", [user.email], fail_silently=True)
        except Exception as e:
            print(f"[ForgotPassword] {e}")
        return Response({"message": "If this email is registered, you will receive an OTP."})


class ResetPasswordAPI(APIView):
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        email = request.data.get("email", "").strip()
        otp = request.data.get("otp", "").strip()
        new_password = request.data.get("new_password", "").strip()
        if not all([email, otp, new_password]):
            return Response({"error": "Email, OTP, and new password required."}, status=400)
        try:
            user = User.objects.filter(email=email).first()  # ✅ no crash on duplicates
            if not user:
                return Response({"error": "No account found with this email."}, status=404)
            profile = Profile.objects.get(user=user)
            otp_age = timezone.now() - profile.otp_created_at
            if otp_age.total_seconds() > 600:
                return Response({"error": "OTP expired. Please request a new one."}, status=400)
            if profile.otp != otp:
                return Response({"error": "Invalid OTP."}, status=400)
            user.set_password(new_password)
            user.save()
            profile.otp = None
            profile.is_verified = True
            profile.save()
            return Response({"message": "Password reset successful."})
        except Exception as e:
            print(f"[ResetPassword] {e}")
            return Response({"error": "Something went wrong."}, status=500)


# ─────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────
class UserProfileAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profile.objects.get(user=request.user)
            return Response({
                "username": request.user.username,
                "email": request.user.email,
                "is_verified": profile.is_verified,
                "avatar": request.build_absolute_uri(profile.avatar.url) if profile.avatar else None,
                "last_login": request.user.last_login,
            })
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=404)


class ProfileUpdateAPI(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, *args, **kwargs):
        try:
            profile = Profile.objects.get(user=request.user)
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_verified": profile.is_verified,
                    "avatar": request.build_absolute_uri(profile.avatar.url) if profile.avatar else None,
                    "last_login": request.user.last_login,
                    "date_joined": request.user.date_joined,
                })
            return Response(serializer.errors, status=400)
        except Profile.DoesNotExist:
            return Response({"error": "Profile not found."}, status=404)


# ─────────────────────────────────────────
# DASHBOARD
# ─────────────────────────────────────────
class DashboardAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = Profile.objects.get(user=user)
        plans_qs = StudyPlan.objects.filter(user=user).order_by("-status", "-created_at")
        plans = []
        overall_progress = 0.0
        for p in plans_qs:
            pd = p.plan_data or {}
            prog = float(pd.get("progress", p.completion_percentage or 0.0))
            overall_progress = max(overall_progress, prog)
            plans.append({
                "id": str(p.id), "plan_type": p.plan_type, "status": p.status,
                "career": pd.get("career") or "Custom Plan",
                "progress": prog, "created_at": p.created_at,
            })
        latest_active = StudyPlan.objects.filter(user=user, status="active").order_by("-created_at").first()
        notes_qs = NoteUpload.objects.filter(user=user).order_by("-created_at")
        notes_count = notes_qs.count()
        last_quiz = QuizResponse.objects.filter(user=user).order_by("-created_at").first()
        last_quiz_obj = {
            "career": last_quiz.predicted_career if last_quiz else None,
            "date": last_quiz.created_at if last_quiz else None,
        }
        attempts_qs = QuizAttempt.objects.filter(user=user).order_by("-attempt_date")[:5]
        attempts = [{
            "note": a.note.title if a.note else "Untitled",
            "score": a.score, "date": a.attempt_date,
            "per_topic_score": a.per_topic_score or {},
        } for a in attempts_qs]
        try:
            flash_reviews = [{
                "term": r.flashcard.term if r.flashcard else "Card",
                "correct": r.correct, "date": r.reviewed_at,
            } for r in FlashcardReviewLog.objects.filter(user=user).order_by("-reviewed_at")[:5]]
        except Exception:
            flash_reviews = []
        jobs = []
        if last_quiz and last_quiz.predicted_career:
            try:
                all_jobs = scrape_internshala_jobs(last_quiz.predicted_career) or []
                jobs = [{
                    "title": j.get("title") or "Role",
                    "company": j.get("company") or "Company",
                    "salary": j.get("salary") or j.get("stipend") or "—",
                    "location": j.get("location") or "",
                    "apply_url": j.get("link") or j.get("apply_url") or "",
                } for j in all_jobs[:5]]
            except Exception:
                jobs = []
        activity = []
        for n in notes_qs[:3]:
            activity.append({"type": "note", "message": f"Uploaded note: {n.title}", "date": n.created_at})
        for a in attempts_qs[:2]:
            activity.append({
                "type": "quiz",
                "message": f"Scored {a.score}% on {a.note.title if a.note else 'quiz'}",
                "date": a.attempt_date,
            })
        for sp in StudyPlan.objects.filter(user=user).order_by("-created_at")[:2]:
            pd = sp.plan_data or {}
            activity.append({
                "type": "plan",
                "message": f"Created {sp.plan_type.replace('_', ' ')} plan ({pd.get('career') or 'Custom'})",
                "date": sp.created_at,
            })
        activity.sort(key=lambda x: x["date"], reverse=True)
        study_plan_bars = []
        if latest_active:
            for w in (latest_active.plan_data or {}).get("weeks", []):
                total = len(w.get("tasks", []))
                done = sum(1 for t in w.get("tasks", []) if t.get("done"))
                pct = round((done / total) * 100.0, 2) if total else 0.0
                study_plan_bars.append({"name": w.get("title") or "Week", "progress": pct})
        leaderboard_qs = (
            QuizAttempt.objects.values("user__username", "user__profile__avatar")
            .annotate(avg_score=Avg("score"), total_score=Sum("score"), attempts=Count("id"))
            .order_by("-avg_score", "-total_score")[:10]
        )
        leaderboard = [{
            "username": row["user__username"],
            "avatar": request.build_absolute_uri(f"/media/{row['user__profile__avatar']}") if row.get("user__profile__avatar") else None,
            "avg_score": round(row["avg_score"] or 0, 1),
            "total_score": round(row["total_score"] or 0, 1),
            "attempts": row["attempts"],
        } for row in leaderboard_qs]
        return Response({
            "user": {
                "username": user.username, "email": user.email,
                "verified": profile.is_verified, "last_login": user.last_login,
                "avatar": profile.avatar.url if getattr(profile, "avatar", None) else None,
            },
            "notes_count": notes_count,
            "overall_progress": overall_progress,
            "study_plans": plans,
            "study_plan_breakdown": study_plan_bars,
            "career_quiz": last_quiz_obj,
            "recent_attempts": attempts,
            "flashcard_reviews": flash_reviews,
            "jobs": jobs,
            "activity": activity[:7],
            "leaderboard": leaderboard,
        })


# ─────────────────────────────────────────
# JOBS
# ─────────────────────────────────────────
class JobsRecommendedAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        career = request.query_params.get("career")
        limit = int(request.query_params.get("limit", 20))
        if not career:
            last_quiz = QuizResponse.objects.filter(user=request.user).order_by("-created_at").first()
            career = last_quiz.predicted_career if last_quiz else None
        if not career:
            return Response({"jobs": [], "career": None})
        try:
            raw = scrape_internshala_jobs(career) or []
            jobs = [{
                "title": j.get("title") or "Role",
                "company": j.get("company") or "Company",
                "salary": j.get("salary") or j.get("stipend") or "—",
                "location": j.get("location") or "",
                "apply_url": j.get("link") or j.get("apply_url") or "",
            } for j in raw[:limit]]
        except Exception:
            jobs = []
        return Response({"career": career, "jobs": jobs})


# ─────────────────────────────────────────
# NOTES
# ─────────────────────────────────────────
class UploadNoteView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "File is required."}, status=400)
        try:
            text = FileExtractor.extract_text(file, file.name)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
        note = NoteUpload.objects.create(
            user=request.user, title=file.name, content=text, status='PENDING'
        )
        Thread(target=process_note_task, args=(note.id,)).start()
        return Response({
            "message": "Upload successful, processing started.",
            "note": {"id": note.id, "title": note.title, "status": note.status}
        }, status=202)


class NoteStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, note_id):
        try:
            note = (NoteUpload.objects
                    .prefetch_related("topics", "flashcards", "quiz_questions")
                    .get(id=note_id, user=request.user))
        except NoteUpload.DoesNotExist:
            return Response({"error": "Note not found."}, status=404)
        valid = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
        return Response({
            "status": note.status if note.status in valid else 'PENDING',
            "data": NoteUploadSerializer(note).data
        })


class GetNoteProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notes = (NoteUpload.objects
                 .filter(user=request.user)
                 .prefetch_related("topics", "flashcards", "quiz_questions")
                 .order_by("-created_at"))
        response = []
        for note in notes:
            note_data = NoteUploadSerializer(note).data
            for fc in note_data.get("flashcards", []):
                if not fc.get("definition"):
                    fc["definition"] = "No definition available"
            response.append(note_data)
        return Response(response)


class DeleteNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, note_id):
        try:
            note = NoteUpload.objects.get(id=note_id, user=request.user)
            note.delete()
            return Response(status=204)
        except NoteUpload.DoesNotExist:
            return Response({"error": "Note not found."}, status=404)


# ─────────────────────────────────────────
# QUIZ
# ─────────────────────────────────────────
class RetakeQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, note_id):
        try:
            note = NoteUpload.objects.get(id=note_id, user=request.user)
            if note.status != 'COMPLETED':
                return Response({"error": "Note is still processing."}, status=400)
            return Response(QuizQuestionSerializer(note.quiz_questions.all(), many=True).data)
        except NoteUpload.DoesNotExist:
            return Response({"error": "Note not found."}, status=404)


class SubmitQuizAttemptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, note_id):
        try:
            note = NoteUpload.objects.get(id=note_id, user=request.user)
        except NoteUpload.DoesNotExist:
            return Response({"error": "Note not found."}, status=404)
        answers = request.data.get("answers", {})
        if not isinstance(answers, dict):
            return Response({"error": "Invalid answers format."}, status=400)
        questions = list(note.quiz_questions.all())
        total = len(questions)
        correct = 0
        topic_scores = {}
        details = []
        for q in questions:
            user_key = answers.get(str(q.id))
            is_correct = user_key == q.answer
            if is_correct:
                correct += 1
            topic = getattr(q, "topic", None)
            if topic:
                topic_scores.setdefault(topic, {"correct": 0, "total": 0})
                topic_scores[topic]["total"] += 1
                if is_correct:
                    topic_scores[topic]["correct"] += 1
            details.append({
                "qid": q.id, "question": q.question,
                "user_answer": user_key, "is_correct": is_correct,
                "user_answer_text": q.options.get(user_key, "N/A") if isinstance(q.options, dict) else "N/A",
                "correct_answer_text": q.options.get(q.answer, "N/A") if isinstance(q.options, dict) else "N/A",
            })
        score = round((correct / total) * 100, 2) if total else 0.0
        topic_scores_percent = {
            t: round((v["correct"] / v["total"]) * 100, 2) for t, v in topic_scores.items()
        }
        # ✅ Batched Gemini — 1 call
        exp_map = {}
        try:
            qa_text = "\n\n".join([
                f"Q{i+1}: {d['question']}\nCorrect: {d['correct_answer_text']}\nUser: {d['user_answer_text']}"
                for i, d in enumerate(details)
            ])
            prompt = f"""Educational assistant. 1-2 sentence explanation per question why correct answer is right.
Return ONLY JSON array: [{{"question_num":1,"explanation":"..."}}]
Notes: {note.content[:1500]}
Questions:\n{qa_text}"""
            gem = call_gemini(prompt)
            if gem and not isinstance(gem, GeminiError):
                raw_text = parse_first_candidate_text(gem)
                parsed = _extract_json_block(raw_text)
                exp_map = {e["question_num"]: e["explanation"] for e in (parsed or []) if isinstance(e, dict)}
        except Exception:
            pass
        explanations = [{
            "question": d["question"],
            "userAnswer": d["user_answer_text"],
            "correctAnswer": d["correct_answer_text"],
            "isCorrect": d["is_correct"],
            "explanation": exp_map.get(i + 1, f"Correct: '{d['correct_answer_text']}'"),
        } for i, d in enumerate(details)]
        attempt = QuizAttempt.objects.create(
            user=request.user, note=note, score=score, per_topic_score=topic_scores_percent
        )
        sp = StudyPlan.objects.filter(
            user=request.user, plan_type="note_quiz", status="active"
        ).order_by("-created_at").first()
        if sp:
            weeks = sp.plan_data.get("weeks", [])
            for wi, w in enumerate(weeks):
                for ti, t in enumerate(w.get("tasks", [])):
                    if t.get("type") == "quiz" and not t.get("done"):
                        top = (t.get("topic") or "").lower()
                        if not top or any(top in str(k).lower() for k in topic_scores_percent.keys()):
                            t["done"] = True
                            sp.plan_data["weeks"][wi]["tasks"][ti] = t
            sp.plan_data = update_plan_status(sp.plan_data)
            sp.save(update_fields=["plan_data"])
        add_adaptive_resources(request.user, topic_scores_percent)
        return Response({
            "score": score,
            "per_topic_score": topic_scores_percent,
            "attempt": QuizAttemptSerializer(attempt).data,
            "explanations": explanations,
        })


class QuizLeaderboardView(APIView):
    def get(self, request):
        top = QuizAttempt.objects.all().order_by("-score", "attempt_date")[:10]
        return Response([{
            "user": a.user.username, "note": a.note.title,
            "score": a.score, "date": a.attempt_date.strftime("%b %d, %Y")
        } for a in top])


# ─────────────────────────────────────────
# FLASHCARDS
# ─────────────────────────────────────────
class FlashcardsDueAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        due = Flashcard.objects.filter(
            note__user=request.user, next_review__lte=now
        ).order_by("next_review")[:10]
        data = FlashcardSerializer(due, many=True).data
        for fc in data:
            if not fc.get("definition"):
                fc["definition"] = "No definition available"
        return Response({"due_flashcards": data})


class FlashcardReviewAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            fc = Flashcard.objects.get(pk=pk, note__user=request.user)
        except Flashcard.DoesNotExist:
            return Response({"error": "Flashcard not found."}, status=404)
        is_correct = bool(request.data.get("correct", False))
        fc.next_review = timezone.now() + (timedelta(days=3) if is_correct else timedelta(hours=12))
        fc.last_reviewed = timezone.now()
        fc.save()
        return Response({"message": "Updated."})


# ─────────────────────────────────────────
# ADAPTIVE QUIZ
# ─────────────────────────────────────────
class AdaptiveNextQuestionAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, note_id):
        try:
            note = NoteUpload.objects.get(id=note_id, user=request.user)
        except NoteUpload.DoesNotExist:
            return Response({"error": "Note not found."}, status=404)
        q = note.quiz_questions.order_by("difficulty").first()
        if not q:
            return Response({"message": "No more questions."})
        return Response({"id": q.id, "question": q.question, "options": q.options, "difficulty": q.difficulty})


class SubmitAdaptiveAnswerAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            question = QuizQuestion.objects.get(pk=pk, note__user=request.user)
        except QuizQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=404)
        user_answer = request.data.get("answer", "").upper()
        is_correct = user_answer == question.answer
        if is_correct and question.difficulty != "hard":
            question.difficulty = "hard" if question.difficulty == "medium" else "medium"
        elif not is_correct and question.difficulty != "easy":
            question.difficulty = "easy"
        question.save()
        explanation_text = f"Correct: '{question.options.get(question.answer, '')}'"
        try:
            gem = call_gemini(
                f"2 sentences: why is '{question.options.get(question.answer, '')}' "
                f"correct for: {question.question}"
            )
            if gem and not isinstance(gem, GeminiError):
                explanation_text = parse_first_candidate_text(gem).strip()
        except Exception:
            pass
        return Response({"is_correct": is_correct, "correct_answer": question.answer, "explanation": explanation_text})


# ─────────────────────────────────────────
# CAREER RECOMMENDATION
# ─────────────────────────────────────────
class CareerRecommendationAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        results = predict_career(request.data)
        QuizResponse.objects.create(
            user=request.user,
            response_data=request.data,
            predicted_career=results[0]["career"]
        )
        final_data = []
        for r in results:
            career_name = r["career"]
            try:
                jobs = scrape_internshala_jobs(career_name)
            except Exception:
                jobs = []
            final_data.append({
                "career": career_name,
                "confidence": r.get("confidence", 0),
                "salary_range": get_salary(career_name),
                "roadmap": _career_weeks_from_roadmap(career_name),
                "jobs": jobs,
            })
        return Response({"recommendations": final_data})


class LatestQuizResponseAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        quiz = QuizResponse.objects.filter(user=request.user).order_by("-created_at").first()
        if quiz:
            return Response({"predicted_career": quiz.predicted_career, "created_at": quiz.created_at})
        return Response({"message": "No quiz result found."})


# ─────────────────────────────────────────
# STUDY PLANS
# ─────────────────────────────────────────
class StudyPlanGenerateAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        mode = (request.data.get("plan_type") or "career_quiz").lower()
        if mode not in {"career_quiz", "note_quiz"}:
            return Response({"error": "plan_type must be 'career_quiz' or 'note_quiz'."}, status=400)

        if mode == "career_quiz":
            career = request.data.get("career") or "Custom Plan"
            weeks = add_dates_to_weeks(get_roadmap(career) or [])
            for week in weeks:
                for i, task in enumerate(week.get("tasks", [])):
                    topic = task.get("topic") or task.get("title") or "Topic"
                    static = get_learning_resources(topic)
                    task["resources"] = _ensure_list_resources([
                        {"title": p, "url": u, "type": p.lower()} for p, u in static.items() if u
                    ])
                    week["tasks"][i] = _normalize_task(task)
            pd = {
                "source": "career_quiz", "career": career,
                "salary_range": get_salary(career), "weeks": weeks, "extra": []
            }
            pd = update_plan_status(pd)
            with transaction.atomic():
                StudyPlan.objects.filter(
                    user=request.user, plan_type="career_quiz", status="active"
                ).update(status="archived")
                sp = StudyPlan.objects.create(
                    user=request.user, plan_type="career_quiz", status="active", plan_data=pd
                )
            return Response(StudyPlanSerializer(sp).data, status=201)

        # Notes-based plan
        note_ids = request.data.get("note_ids") or []
        if not isinstance(note_ids, list) or not note_ids:
            return Response({"error": "note_ids required for note_quiz."}, status=400)
        notes_qs = NoteUpload.objects.filter(id__in=note_ids, user=request.user)
        if not notes_qs.exists():
            return Response({"error": "No matching notes found."}, status=404)

        # ✅ Use improved notes week builder
        weeks, note_qs = _build_weeks_from_notes(request.user, note_ids)
        pd = {
            "source": "note_quiz",
            "career": "Notes Study Plan",
            "weeks": weeks,
            "extra": [],
        }
        pd = update_plan_status(pd)
        with transaction.atomic():
            StudyPlan.objects.filter(
                user=request.user, plan_type="note_quiz", status="active"
            ).update(status="archived")
            sp = StudyPlan.objects.create(
                user=request.user, plan_type="note_quiz", status="active", plan_data=pd
            )
            sp.notes.add(*note_qs)
        return Response(StudyPlanSerializer(sp).data, status=201)


class StudyPlanLatestAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sp = StudyPlan.objects.filter(user=request.user, status="active").order_by("-created_at").first()
        if not sp:
            return Response({"message": "No active study plan."}, status=404)
        return Response(StudyPlanSerializer(sp).data)


class StudyPlanListView(generics.ListAPIView):
    """Returns lightweight plan summaries — no full plan_data to avoid huge responses."""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user).order_by("-created_at")

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        data = []
        for sp in qs:
            pd = sp.plan_data or {}
            data.append({
                "id": str(sp.id),
                "plan_type": sp.plan_type,
                "status": sp.status,
                "career": pd.get("career") or "Custom Plan",
                "progress": pd.get("progress", sp.completion_percentage or 0.0),
                "salary_range": pd.get("salary_range", ""),
                "created_at": sp.created_at,
                "updated_at": sp.updated_at,
            })
        return Response(data)


class StudyPlanDetailView(generics.RetrieveAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)


class StudyPlanDeleteView(generics.DestroyAPIView):
    serializer_class = StudyPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user)


class StudyPlanExportAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        sp = get_object_or_404(StudyPlan, pk=pk, user=request.user)
        lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//EduSmart//StudyPlan//EN"]
        for w in sp.plan_data.get("weeks", []):
            if not w.get("starts_on"):
                continue
            start = datetime.fromisoformat(w["starts_on"])
            end = start + timedelta(days=7)
            desc = "\n".join(f"- {t.get('title', 'Task')}" for t in w.get("tasks", []))
            lines += [
                "BEGIN:VEVENT",
                f"DTSTART;VALUE=DATE:{start.strftime('%Y%m%d')}",
                f"DTEND;VALUE=DATE:{end.strftime('%Y%m%d')}",
                f"SUMMARY:{_ics_escape(w.get('title', 'Study Week'))}",
                f"DESCRIPTION:{_ics_escape(desc)}",
                "END:VEVENT"
            ]
        lines.append("END:VCALENDAR")
        resp = HttpResponse("\r\n".join(lines), content_type="text/calendar")
        resp["Content-Disposition"] = f'attachment; filename="study-plan-{sp.id}.ics"'
        return resp


class UpdateStudyPlanAPI(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        # ✅ Accept both 'id' and 'plan_id'
        plan_id = request.data.get("id") or request.data.get("plan_id")
        if not plan_id:
            return Response({"error": "id or plan_id is required."}, status=400)

        study_plan = get_object_or_404(StudyPlan, id=plan_id, user=request.user)

        # Mode 1: toggle a specific task by index
        if "week_index" in request.data and "task_index" in request.data:
            wi = int(request.data.get("week_index"))
            ti = int(request.data.get("task_index"))
            weeks = study_plan.plan_data.get("weeks", [])
            if wi < 0 or wi >= len(weeks):
                return Response({"error": "Invalid week_index."}, status=400)
            tasks = weeks[wi].get("tasks", [])
            if ti < 0 or ti >= len(tasks):
                return Response({"error": "Invalid task_index."}, status=400)
            task = tasks[ti]
            ttype = (task.get("type") or "article").lower()
            if ttype == "quiz":
                return Response({"error": "Quiz tasks complete automatically."}, status=400)
            task["done"] = not task.get("done", False)
            study_plan.plan_data["weeks"][wi]["tasks"][ti] = task

        # Mode 2: replace entire plan_data (used by frontend toggleTask)
        elif "plan_data" in request.data:
            new_pd = request.data.get("plan_data")
            if not isinstance(new_pd, dict):
                return Response({"error": "plan_data must be a JSON object."}, status=400)
            # Preserve existing extra resources if not included
            existing_extra = study_plan.plan_data.get("extra", [])
            new_pd.setdefault("extra", existing_extra)
            study_plan.plan_data = new_pd

        else:
            return Response({"error": "Provide week_index+task_index or plan_data."}, status=400)

        study_plan.plan_data = update_plan_status(study_plan.plan_data)
        study_plan.save(update_fields=["plan_data"])
        return Response({
            "message": "Updated.",
            "plan_data": study_plan.plan_data,
            "id": str(study_plan.id),
        })


class ResetStudyPlanAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        study_plan = StudyPlan.objects.filter(
            user=request.user, status="active"
        ).order_by("-created_at").first()
        if not study_plan:
            return Response({"error": "No study plan found."}, status=404)
        pd = study_plan.plan_data or {}
        for w in pd.get("weeks", []):
            for t in w.get("tasks", []):
                t["done"] = False
        pd["extra"] = []
        pd = update_plan_status(pd)
        study_plan.plan_data = pd
        study_plan.completion_percentage = 0.0
        study_plan.status = "active"
        study_plan.save(update_fields=["plan_data", "completion_percentage", "status", "updated_at"])
        return Response({
            "message": "Plan reset.",
            "plan_data": study_plan.plan_data,
            "id": str(study_plan.id),
        })


class AdaptStudyPlanAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        weak_topics_raw = request.data.get("weak_topics", [])

        # Normalise topics input — accepts strings or dicts
        norm_topics = []
        for t in (weak_topics_raw or []):
            if isinstance(t, dict):
                norm_topics.append(t.get("topic") or str(t))
            elif isinstance(t, str) and t.strip():
                norm_topics.append(t.strip())

        # Get the plan
        if plan_id:
            sp = get_object_or_404(StudyPlan, id=plan_id, user=request.user)
        else:
            sp = StudyPlan.objects.filter(user=request.user, status="active").order_by("-created_at").first()
            if not sp:
                return Response({"error": "No active study plan found."}, status=404)

        # Auto-detect weak topics from attached notes if none provided
        if not norm_topics and sp.plan_type == "note_quiz":
            norm_topics = list(
                TopicSummary.objects.filter(note__in=sp.notes.all())
                .values_list("topic", flat=True)[:8]
            )

        # For career plans with no topics, use plan weeks as topics
        if not norm_topics and sp.plan_type == "career_quiz":
            norm_topics = [
                t.get("topic") or t.get("title")
                for w in sp.plan_data.get("weeks", [])
                for t in w.get("tasks", [])
                if not t.get("done") and (t.get("topic") or t.get("title"))
            ][:6]

        if not norm_topics:
            return Response({"error": "No topics found to adapt. Pass weak_topics in request body."}, status=400)

        pd = sp.plan_data or {}
        pd.setdefault("extra", [])

        # ✅ Generate resources for each topic — check GeminiError properly
        for topic in norm_topics:
            resources = [
                # Fallback YouTube link always included
                {"title": f"{topic} — YouTube", "url": f"https://www.youtube.com/results?search_query={topic.replace(' ', '+')}+tutorial", "type": "video", "visited": False},
                {"title": f"{topic} — Coursera", "url": f"https://www.coursera.org/search?query={topic.replace(' ', '+')}", "type": "course", "visited": False},
            ]
            try:
                prompt = (
                    f"For the topic '{topic}', suggest 3 high-quality learning resources. "
                    f"Return ONLY a JSON array: "
                    f'[{{"title":"...","url":"...","type":"video|article|course"}}]'
                )
                gem_result = call_gemini(prompt, max_retries=2, timeout=20)

                # ✅ KEY FIX: check for GeminiError before calling parse_first_candidate_text
                if gem_result and not isinstance(gem_result, GeminiError):
                    text = parse_first_candidate_text(gem_result)
                    parsed = _extract_json_block(text)
                    if parsed and isinstance(parsed, list):
                        gemini_resources = _ensure_list_resources(parsed)
                        if gemini_resources:
                            resources = gemini_resources
            except Exception as e:
                print(f"[Adapt] Gemini failed for topic '{topic}': {e}")

            pd["extra"].append({
                "topics": [topic],
                "resources": resources,
            })

        pd = update_plan_status(pd)
        sp.plan_data = pd
        sp.save(update_fields=["plan_data"])

        return Response({
            "message": f"Plan adapted with resources for: {', '.join(norm_topics)}",
            "updated_plan": StudyPlanSerializer(sp).data,
        }, status=200)


class ResourceVisitLogAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        week_index = request.data.get("week_index")
        task_index = request.data.get("task_index")
        resource_url = request.data.get("resource_url")
        if plan_id is None or week_index is None or task_index is None or not resource_url:
            return Response({"error": "plan_id, week_index, task_index, resource_url required."}, status=400)
        sp = get_object_or_404(StudyPlan, id=plan_id, user=request.user)
        weeks = sp.plan_data.get("weeks", [])
        if week_index < 0 or week_index >= len(weeks):
            return Response({"error": "Invalid week_index."}, status=400)
        tasks = weeks[week_index].get("tasks", [])
        if task_index < 0 or task_index >= len(tasks):
            return Response({"error": "Invalid task_index."}, status=400)
        task = tasks[task_index]
        changed = False
        for r in task.get("resources", []):
            if r.get("url") == resource_url:
                r["visited"] = True
                changed = True
                break
        if changed:
            sp.plan_data["weeks"][week_index]["tasks"][task_index] = task
            sp.plan_data = update_plan_status(sp.plan_data)
            sp.save(update_fields=["plan_data"])
        ResourceVisitLog.objects.create(
            user=request.user, study_plan=sp,
            week_index=week_index, task_index=task_index, resource_url=resource_url
        )
        return Response({"message": "Visit logged.", "plan": StudyPlanSerializer(sp).data})


# ─────────────────────────────────────────
# STUDY PLAN — TOPIC QUIZ (Gemini-powered)
# ─────────────────────────────────────────
PASSING_SCORE = 60  # percent

class StudyPlanTopicQuizGenerateAPI(APIView):
    """Generate 5 MCQ questions for a specific study plan topic using Gemini."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        topic = (request.data.get("topic") or "").strip()
        plan_id = request.data.get("plan_id")
        wi = request.data.get("week_index")
        ti = request.data.get("task_index")

        if not topic:
            return Response({"error": "topic is required."}, status=400)

        # Validate plan exists and task is quiz type
        if plan_id and wi is not None and ti is not None:
            try:
                sp = StudyPlan.objects.get(id=plan_id, user=request.user)
                weeks = sp.plan_data.get("weeks", [])
                if int(wi) < len(weeks):
                    tasks = weeks[int(wi)].get("tasks", [])
                    if int(ti) < len(tasks):
                        task = tasks[int(ti)]
                        # Use the task's topic if available
                        topic = task.get("topic") or topic
            except StudyPlan.DoesNotExist:
                pass

        # Also try to pull note content for context
        note_context = ""
        note_id = request.data.get("note_id")
        if note_id:
            try:
                note = NoteUpload.objects.get(id=note_id, user=request.user)
                # Find matching topic summary
                ts = TopicSummary.objects.filter(note=note, topic__icontains=topic).first()
                if ts:
                    note_context = f"\n\nContext from study notes on '{topic}':\n{ts.summary}"
                else:
                    note_context = f"\n\nGeneral notes context:\n{note.content[:1500]}"
            except NoteUpload.DoesNotExist:
                pass

        prompt = f"""You are an educational quiz generator. Generate exactly 5 multiple-choice questions about the topic: "{topic}".{note_context}

Each question must test understanding of this specific topic.
Return ONLY a valid JSON array with this exact format — no extra text, no markdown fences:
[
  {{
    "id": 1,
    "question": "Clear question text here?",
    "options": {{
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    }},
    "correct": "A",
    "explanation": "Brief 1-2 sentence explanation of why this is correct."
  }}
]

Rules:
- Generate exactly 5 questions
- Each question has exactly 4 options (A, B, C, D)
- "correct" is exactly one of A, B, C, or D
- Questions should be of medium difficulty
- Make questions specific to "{topic}", not generic
- Return ONLY the JSON array, nothing else
"""

        questions = None
        for attempt in range(1, 4):
            result = call_gemini(prompt, max_retries=2, timeout=45)

            if isinstance(result, GeminiError):
                if result.error_type == "quota_exceeded":
                    return Response({
                        "error": "Gemini API quota exhausted. Please try again later."
                    }, status=503)
                if attempt < 3:
                    time.sleep(5)
                    continue
                return Response({
                    "error": f"Quiz generation temporarily unavailable: {result.message}"
                }, status=503)

            if not result:
                if attempt < 3:
                    time.sleep(3)
                    continue
                return Response({
                    "error": "Could not generate quiz. Please try again."
                }, status=503)

            try:
                raw_text = parse_first_candidate_text(result)
                parsed = _extract_json_block(raw_text)
                if parsed and isinstance(parsed, list) and len(parsed) > 0:
                    # Validate and normalize questions
                    valid_qs = []
                    for i, q in enumerate(parsed):
                        if not isinstance(q, dict):
                            continue
                        if not q.get("question") or not q.get("options") or not q.get("correct"):
                            continue
                        opts = q["options"]
                        if isinstance(opts, list):
                            opts = {chr(65 + j): o for j, o in enumerate(opts[:4])}
                        correct = q["correct"].upper()
                        if correct not in opts:
                            correct = "A"
                        valid_qs.append({
                            "id": i + 1,
                            "question": str(q["question"]),
                            "options": opts,
                            "correct": correct,
                            "explanation": str(q.get("explanation", "")),
                        })
                    if valid_qs:
                        questions = valid_qs
                        break
            except Exception as e:
                print(f"[TopicQuiz] Parse error attempt {attempt}: {e}")
                if attempt < 3:
                    time.sleep(3)
                    continue

        if not questions:
            return Response({
                "error": "Failed to generate quiz questions. Please try again."
            }, status=503)

        return Response({
            "topic": topic,
            "passing_score": PASSING_SCORE,
            "questions": questions,
        })


class StudyPlanTopicQuizSubmitAPI(APIView):
    """Submit answers for a study-plan topic quiz; auto-complete task on pass."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get("plan_id")
        wi = request.data.get("week_index")
        ti = request.data.get("task_index")
        answers = request.data.get("answers", {})  # {question_id: "A"/"B"/...}
        questions = request.data.get("questions", [])  # original questions with correct answers
        topic = request.data.get("topic", "")

        if not plan_id or wi is None or ti is None:
            return Response({"error": "plan_id, week_index, task_index required."}, status=400)

        if not questions or not isinstance(questions, list):
            return Response({"error": "questions list required."}, status=400)

        # Score the quiz
        total = len(questions)
        correct_count = 0
        results = []
        for q in questions:
            qid = str(q.get("id", ""))
            user_answer = answers.get(qid, "")
            correct_answer = q.get("correct", "")
            is_correct = user_answer.upper() == correct_answer.upper()
            if is_correct:
                correct_count += 1

            user_text = ""
            correct_text = ""
            opts = q.get("options", {})
            if isinstance(opts, dict):
                user_text = opts.get(user_answer.upper(), "Not answered")
                correct_text = opts.get(correct_answer.upper(), "")

            results.append({
                "id": q.get("id"),
                "question": q.get("question", ""),
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "user_answer_text": user_text,
                "correct_answer_text": correct_text,
                "is_correct": is_correct,
                "explanation": q.get("explanation", ""),
            })

        score = round((correct_count / total) * 100, 1) if total > 0 else 0
        passed = score >= PASSING_SCORE

        # Update the study plan task
        try:
            sp = StudyPlan.objects.get(id=plan_id, user=request.user)
            weeks = sp.plan_data.get("weeks", [])
            wi_int = int(wi)
            ti_int = int(ti)

            if wi_int < len(weeks):
                tasks = weeks[wi_int].get("tasks", [])
                if ti_int < len(tasks):
                    task = tasks[ti_int]
                    if passed:
                        task["done"] = True
                        task["quiz_score"] = score
                        task["quiz_passed"] = True
                    else:
                        task["done"] = False
                        task["quiz_score"] = score
                        task["quiz_passed"] = False
                        task["quiz_attempts"] = task.get("quiz_attempts", 0) + 1

                    sp.plan_data["weeks"][wi_int]["tasks"][ti_int] = task
                    sp.plan_data = update_plan_status(sp.plan_data)
                    sp.save(update_fields=["plan_data"])
        except StudyPlan.DoesNotExist:
            pass
        except Exception as e:
            print(f"[TopicQuizSubmit] Error updating plan: {e}")

        return Response({
            "score": score,
            "total": total,
            "correct": correct_count,
            "passed": passed,
            "passing_score": PASSING_SCORE,
            "topic": topic,
            "results": results,
        })