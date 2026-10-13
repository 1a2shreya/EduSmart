import uuid
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


# ─────────────────────────────────────────
# Profile
# ─────────────────────────────────────────
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"

    def __str__(self):
        return f"{self.user.username} Profile"


# ─────────────────────────────────────────
# Career Quiz Response
# ─────────────────────────────────────────
class QuizResponse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    response_data = models.JSONField()
    predicted_career = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Quiz Response"
        verbose_name_plural = "Quiz Responses"

    def __str__(self):
        return f"{self.user.username} - {self.predicted_career}"


# ─────────────────────────────────────────
# Notes
# ─────────────────────────────────────────
class NoteUpload(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Uploaded Note"
        verbose_name_plural = "Uploaded Notes"

    def __str__(self):
        return self.title


class TopicSummary(models.Model):
    note = models.ForeignKey(NoteUpload, on_delete=models.CASCADE, related_name='topics')
    topic = models.CharField(max_length=255)
    summary = models.TextField()

    class Meta:
        verbose_name = "Topic Summary"
        verbose_name_plural = "Topic Summaries"

    def __str__(self):
        return f"{self.topic} - {self.note.title}"


# ─────────────────────────────────────────
# Quiz
# ─────────────────────────────────────────
class QuizQuestion(models.Model):
    note = models.ForeignKey(NoteUpload, on_delete=models.CASCADE, related_name='quiz_questions')
    question = models.TextField()
    options = models.JSONField()
    answer = models.CharField(max_length=1)   # 'A', 'B', 'C', 'D'
    difficulty = models.CharField(
        max_length=10,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='medium'
    )

    class Meta:
        verbose_name = "Quiz Question"
        verbose_name_plural = "Quiz Questions"

    def __str__(self):
        return f"Q: {self.question[:50]}..."


class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.ForeignKey(NoteUpload, on_delete=models.CASCADE)
    score = models.FloatField()
    per_topic_score = models.JSONField(default=dict)
    attempt_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempt_date']
        verbose_name = "Quiz Attempt"
        verbose_name_plural = "Quiz Attempts"

    def __str__(self):
        return f"{self.user.username} - {self.score}% - {self.note.title}"


# ─────────────────────────────────────────
# Flashcards (Spaced Repetition — SM-2)
# ─────────────────────────────────────────
class Flashcard(models.Model):
    note = models.ForeignKey(NoteUpload, on_delete=models.CASCADE, related_name='flashcards')
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    term = models.CharField(max_length=255)
    definition = models.TextField()
    example = models.TextField(blank=True, null=True)
    related_terms = models.TextField(blank=True, null=True)
    next_review = models.DateTimeField(default=timezone.now)
    ease_factor = models.FloatField(default=2.5)
    interval = models.IntegerField(default=0)
    repetition = models.IntegerField(default=0)
    last_reviewed = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Flashcard"
        verbose_name_plural = "Flashcards"

    def __str__(self):
        return f"{self.term} ({self.note.title})"


class FlashcardReviewLog(models.Model):
    flashcard = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reviewed_at = models.DateTimeField(auto_now_add=True)
    correct = models.BooleanField()

    class Meta:
        ordering = ['-reviewed_at']
        verbose_name = "Flashcard Review Log"
        verbose_name_plural = "Flashcard Review Logs"

    def __str__(self):
        return f"{self.user.username} reviewed {self.flashcard.term} - {'Correct' if self.correct else 'Incorrect'}"


# ─────────────────────────────────────────
# Adaptive Quiz
# ─────────────────────────────────────────
class AdaptiveQuizSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    note = models.ForeignKey(NoteUpload, on_delete=models.CASCADE)
    current_difficulty = models.CharField(
        max_length=10,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='medium'
    )
    questions_answered = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-last_activity']
        verbose_name = "Adaptive Quiz Session"
        verbose_name_plural = "Adaptive Quiz Sessions"

    def __str__(self):
        return f"AdaptiveQuiz for {self.user.username} on {self.note.title}"


class AdaptiveQuizAnswer(models.Model):
    session = models.ForeignKey(AdaptiveQuizSession, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE)
    user_answer = models.CharField(max_length=1)
    is_correct = models.BooleanField()
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.session.user.username} - {self.question.question[:30]}..."


# ─────────────────────────────────────────
# Study Plan
# ─────────────────────────────────────────
class StudyPlan(models.Model):
    PLAN_TYPE_CHOICES = [
        ('career_quiz', 'Career Quiz'),
        ('note_quiz', 'Notes Quiz'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_plans')
    plan_type = models.CharField(max_length=20, choices=PLAN_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    plan_data = models.JSONField(default=dict, blank=True)
    completion_percentage = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.ManyToManyField(NoteUpload, related_name='study_plans', blank=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = "Study Plan"
        verbose_name_plural = "Study Plans"
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'plan_type', 'status'],
                condition=models.Q(status='active'),
                name='unique_active_plan_per_type',
            )
        ]

    def calculate_progress(self):
        weeks = (self.plan_data or {}).get('weeks', [])
        total = sum(len(w.get('tasks', [])) for w in weeks)
        done = sum(1 for w in weeks for t in w.get('tasks', []) if t.get('done'))
        return round((done / total) * 100, 2) if total > 0 else 0.0

    def save(self, *args, **kwargs):
        # Enforce only one active plan per type per user
        if self.status == 'active':
            StudyPlan.objects.filter(
                user=self.user, plan_type=self.plan_type, status='active'
            ).exclude(pk=self.pk).update(status='archived')
        # Auto-update completion percentage
        self.completion_percentage = self.calculate_progress()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.get_plan_type_display()} ({self.status})"


# ─────────────────────────────────────────
# Resource Visit Tracking
# ─────────────────────────────────────────
class ResourceVisitLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    study_plan = models.ForeignKey(StudyPlan, on_delete=models.CASCADE, related_name='resource_visits')
    week_index = models.IntegerField()
    task_index = models.IntegerField()
    resource_url = models.URLField()
    visited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Resource Visit Log"
        verbose_name_plural = "Resource Visit Logs"

    def __str__(self):
        return f"{self.user.username} visited {self.resource_url[:40]}..."