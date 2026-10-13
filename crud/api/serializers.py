# from rest_framework import serializers
# from .models import Student
# class StudentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Student
#         fields = ['id', 'name', 'email']


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email']

# class RegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password']
#         extra_kwargs = {'password': {'write_only': True}}

#     def create(self, validated_data):
#         user = User.objects.create_user(**validated_data)
#         return user
# class QuizResponseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizResponse
#         fields = '__all__'
# class TopicSummarySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TopicSummary
#         fields = '__all__'

# class QuizQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizQuestion
#         fields = '__all__'

# class FlashcardSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Flashcard
#         fields = '__all__'

# class NoteUploadSerializer(serializers.ModelSerializer):
#     summaries = TopicSummarySerializer(many=True, read_only=True)
#     quiz_questions = QuizQuestionSerializer(many=True, read_only=True)
#     flashcards = FlashcardSerializer(many=True, read_only=True)

#     class Meta:
#         model = NoteUpload
#         fields = '__all__'


# class QuizAttemptSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizAttempt
#         fields = '__all__'
        
# class QuizExplanationSerializer(serializers.Serializer):
#     question = serializers.CharField()
#     userAnswer = serializers.CharField()
#     correctAnswer = serializers.CharField()
#     isCorrect = serializers.BooleanField()
#     explanation = serializers.CharField()
#     flashcard = serializers.DictField(required=False, allow_null=True)
# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import Profile, QuizResponse, NoteUpload, TopicSummary, QuizQuestion, Flashcard, QuizAttempt, StudyPlan,FlashcardReviewLog,ResourceVisitLog
# import re
# # from .serializers_other import TopicSummarySerializer
# class TopicSummarySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TopicSummary
#         fields = ["id", "topic", "summary"]
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'date_joined', 'last_login']
#         extra_kwargs = {
#             'password': {'write_only': True},
#             'date_joined': {'read_only': True},
#             'last_login': {'read_only': True}
#         }

# class RegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password']
#         extra_kwargs = {'password': {'write_only': True}}

#     def validate_username(self, value):
#         if not re.match(r'^[\w.@+-]+\Z', value):
#             raise serializers.ValidationError("Username can only contain letters, numbers, and @/./+/-/_ characters.")
#         return value

#     def create(self, validated_data):
#         user = User.objects.create_user(**validated_data)
#         return user

# class ProfileSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)
    
#     class Meta:
#         model = Profile
#         fields = ['user', 'is_verified', 'avatar']
#         read_only_fields = ['is_verified']
# # In api/serializers.py

# class ProfileUpdateSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source='user.username', required=False)
#     email = serializers.EmailField(source='user.email', required=False)

#     class Meta:
#         model = Profile
#         fields = ['username', 'email', 'avatar']

#     def update(self, instance, validated_data):
#         # Handle User model data if it exists
#         user_data = validated_data.pop('user', {})
#         if user_data:
#             user = instance.user
#             user.username = user_data.get('username', user.username)
#             user.email = user_data.get('email', user.email)
#             user.save()

#         # Handle Profile model data (the avatar)
#         instance.avatar = validated_data.get('avatar', instance.avatar)
#         instance.save()
#         return instance

# class QuizResponseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizResponse
#         fields = '__all__'
#         read_only_fields = ['user', 'created_at']

# # class TopicSummarySerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = TopicSummary
# #         fields = ['topic', 'summary']
# # class FlashcardSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = Flashcard
# #         fields = ['id', 'term', 'definition', 'next_review', 'ease_factor', 'interval', 'repetition']
# class FlashcardSerializer(serializers.ModelSerializer):
#     owner = serializers.CharField(source='owner.username', read_only=True)  # ✅ Add this

#     class Meta:
#         model = Flashcard
#         fields = [
#             'id', 'term', 'definition', 'example', 'related_terms',
#             'next_review', 'ease_factor', 'interval', 'repetition',
#             'owner'
#         ]

# class FlashcardReviewLogSerializer(serializers.ModelSerializer):
#     flashcard = FlashcardSerializer(read_only=True)

#     class Meta:
#         model = FlashcardReviewLog
#         fields = ['id', 'flashcard', 'reviewed_at', 'correct']


# class QuizQuestionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizQuestion
#         fields = ['id', 'question', 'options', 'difficulty']
#         read_only_fields = ['id', 'question', 'options', 'difficulty']

# class NoteUploadSerializer(serializers.ModelSerializer):
#     topics = TopicSummarySerializer(many=True, read_only=True)
#     flashcards = FlashcardSerializer(many=True, read_only=True)
#     quiz_questions = QuizQuestionSerializer(many=True, read_only=True)

#     class Meta:
#         model = NoteUpload
#         fields = ['id', 'title', 'created_at', 'topics', 'flashcards', 'quiz_questions']
#         read_only_fields = ['id', 'created_at', 'topics', 'flashcards', 'quiz_questions']

# class QuizAttemptSerializer(serializers.ModelSerializer):
#     note_title = serializers.CharField(source='note.title', read_only=True)
#     username = serializers.CharField(source='user.username', read_only=True)

#     class Meta:
#         model = QuizAttempt
#         fields = ['id', 'username', 'note_title', 'score', 'attempt_date']
#         read_only_fields = fields

# class QuizExplanationSerializer(serializers.Serializer):
#     question = serializers.CharField()
#     userAnswer = serializers.CharField()
#     correctAnswer = serializers.CharField()
#     isCorrect = serializers.BooleanField()
#     explanation = serializers.CharField()
#     flashcard = serializers.DictField(required=False, allow_null=True)
    
# # class StudyPlanSerializer(serializers.ModelSerializer):
# #     total_tasks = serializers.SerializerMethodField()
# #     completed_tasks = serializers.SerializerMethodField()

# #     class Meta:
# #         model = StudyPlan
# #         fields = ["id", "plan_data", "total_tasks", "completed_tasks", "created_at"]

# #     def get_total_tasks(self, obj):
# #         weeks = (obj.plan_data or {}).get("weeks", [])
# #         return sum(len(w.get("tasks", [])) for w in weeks)

# #     def get_completed_tasks(self, obj):
# #         weeks = (obj.plan_data or {}).get("weeks", [])
# #         return sum(1 for w in weeks for t in w.get("tasks", []) if t.get("done"))
# # class StudyPlanSerializer(serializers.ModelSerializer):
# #     total_tasks = serializers.SerializerMethodField()
# #     completed_tasks = serializers.SerializerMethodField()
# #     completion_percentage = serializers.FloatField(read_only=True)
# #     status = serializers.CharField(read_only=True)

# #     class Meta:
# #         model = StudyPlan
# #         fields = [
# #             "id",
# #             "plan_type",
# #             "plan_data",
# #             "progress",
# #             "total_tasks",
# #             "completed_tasks",
# #             "completion_percentage",
# #             "status",
# #             "created_at",
# #             "updated_at",
# #         ]
# #         read_only_fields = [
# #             "id",
# #             "completion_percentage",
# #             "status",
# #             "created_at",
# #             "updated_at",
# #         ]

# #     def to_representation(self, instance):
# #         data = super().to_representation(instance)

# #         # Ensure tasks are normalized
# #         weeks = data.get("plan_data", {}).get("weeks", [])
# #         progress = instance.progress or {}

# #         for w_index, week in enumerate(weeks, start=1):
# #             week_key = f"w{w_index}"
# #             for t_index, task in enumerate(week.get("tasks", []), start=1):
# #                 task_id = f"{week_key}-t{t_index}"

# #                 # Convert 'resources' from string to dict if needed
# #                 if isinstance(task.get("resources"), str):
# #                     try:
# #                         import ast
# #                         task["resources"] = ast.literal_eval(task["resources"])
# #                     except Exception:
# #                         task["resources"] = {}

# #                 # Add 'done' status from progress
# #                 task["done"] = progress.get(week_key, {}).get(task_id, False)

# #                 # If topic exists but no title, copy it
# #                 if not task.get("title") and task.get("topic"):
# #                     task["title"] = task["topic"]

# #             week["tasks"] = week.get("tasks", [])

# #         return data

# #     def get_total_tasks(self, obj):
# #         weeks = (obj.plan_data or {}).get("weeks", [])
# #         return sum(len(w.get("tasks", [])) for w in weeks)

# #     def get_completed_tasks(self, obj):
# #         weeks = (obj.plan_data or {}).get("weeks", [])
# #         count = 0
# #         for w_index, w in enumerate(weeks, start=1):
# #             week_key = f"w{w_index}"
# #             for t_index, _ in enumerate(w.get("tasks", []), start=1):
# #                 task_id = f"{week_key}-t{t_index}"
# #                 if obj.progress.get(week_key, {}).get(task_id, False):
# #                     count += 1
# #         return count
# class StudyPlanSerializer(serializers.ModelSerializer):
#     total_tasks = serializers.SerializerMethodField()
#     completed_tasks = serializers.SerializerMethodField()
#     completion_percentage = serializers.FloatField(read_only=True)
#     status = serializers.CharField(read_only=True)

#     class Meta:
#         model = StudyPlan
#         fields = [
#             "id",
#             "plan_type",
#             "plan_data",
#             "progress",
#             "total_tasks",
#             "completed_tasks",
#             "completion_percentage",
#             "status",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = [
#             "id",
#             "completion_percentage",
#             "status",
#             "created_at",
#             "updated_at",
#         ]

#     def to_representation(self, instance):
#         data = super().to_representation(instance)

#         # Ensure tasks are normalized
#         weeks = data.get("plan_data", {}).get("weeks", [])
#         progress = instance.progress or {}

#         for w_index, week in enumerate(weeks, start=1):
#             week_key = f"w{w_index}"
#             for t_index, task in enumerate(week.get("tasks", []), start=1):
#                 task_id = f"{week_key}-t{t_index}"

#                 # Convert 'resources' from string to dict if needed
#                 if isinstance(task.get("resources"), str):
#                     try:
#                         task["resources"] = ast.literal_eval(task["resources"])
#                     except Exception:
#                         task["resources"] = []

#                 # Attach task progress
#                 task_progress = progress.get(week_key, {}).get(task_id, {})
#                 task["done"] = task_progress.get("done", False)
#                 task["visited"] = task_progress.get("visited", [])

#                 # If topic exists but no title, copy it
#                 if not task.get("title") and task.get("topic"):
#                     task["title"] = task["topic"]

#             week["tasks"] = week.get("tasks", [])

#         return data

#     def get_total_tasks(self, obj):
#         weeks = (obj.plan_data or {}).get("weeks", [])
#         return sum(len(w.get("tasks", [])) for w in weeks)

#     def get_completed_tasks(self, obj):
#         weeks = (obj.plan_data or {}).get("weeks", [])
#         count = 0
#         for w_index, w in enumerate(weeks, start=1):
#             week_key = f"w{w_index}"
#             for t_index, _ in enumerate(w.get("tasks", []), start=1):
#                 task_id = f"{week_key}-t{t_index}"
#                 if obj.progress.get(week_key, {}).get(task_id, {}).get("done", False):
#                     count += 1
#         return count
# class StudyPlanResourceVisitSerializer(serializers.Serializer):
#     week = serializers.CharField()
#     task_id = serializers.CharField()
#     resource_link = serializers.URLField()
#     visited = serializers.BooleanField(default=False)
# class StudyPlanTaskCompletionSerializer(serializers.Serializer):
#     week = serializers.CharField()
#     task_id = serializers.CharField()
#     completed = serializers.BooleanField(default=False)

#     def validate(self, data):
#         plan = self.context.get("plan")
#         if not plan:
#             raise serializers.ValidationError("Study plan not found.")

#         weeks = (plan.plan_data or {}).get("weeks", [])
#         w_key, t_key = data["week"], data["task_id"]

#         # Find task
#         task = None
#         for i, w in enumerate(weeks, start=1):
#             if f"w{i}" == w_key:
#                 for j, t in enumerate(w.get("tasks", []), start=1):
#                     if f"w{i}-t{j}" == t_key:
#                         task = t
#                         break

#         if not task:
#             raise serializers.ValidationError("Invalid week/task ID.")

#         # ✅ Ensure at least one resource visited before marking complete
#         if data["completed"] and task.get("resources"):
#             progress = plan.progress or {}
#             visited = progress.get(w_key, {}).get(t_key, {}).get("visited", [])
#             if not visited:
#                 raise serializers.ValidationError(
#                     "Please visit at least one resource before marking this task complete."
#                 )

#         return data
# class ResourceVisitLogSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", read_only=True)

#     class Meta:
#         model = ResourceVisitLog
#         fields = [
#             "id",
#             "username",
#             "study_plan",
#             "week_index",
#             "task_index",
#             "resource_url",
#             "visited_at",
#         ]
#         read_only_fields = ["id", "username", "visited_at"]
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, QuizResponse, NoteUpload, TopicSummary,
    QuizQuestion, Flashcard, QuizAttempt,
    FlashcardReviewLog, StudyPlan, ResourceVisitLog
)

# ----------------------------
# User & Profile
# ----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ["user", "is_verified", "avatar"]


# class ProfileUpdateSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", required=False)
#     email = serializers.EmailField(source="user.email", required=False)

#     class Meta:
#         model = Profile
#         fields = ["username", "email", "avatar"]

# from rest_framework import serializers
# from django.contrib.auth.models import User
# from .models import Profile
# from .models import QuizResponse
# from .models import NoteUpload, TopicSummary, QuizQuestion, Flashcard, QuizAttempt, FlashcardReviewLog
# from .models import (
#     Profile, QuizResponse, NoteUpload, TopicSummary,
#     QuizQuestion, Flashcard, QuizAttempt,
#     FlashcardReviewLog, StudyPlan, ResourceVisitLog
# )

# # ----------------------------
# # User & Profile
# # ----------------------------
# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ["id", "username", "email"]


# class ProfileSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)

#     class Meta:
#         model = Profile
#         fields = ["user", "is_verified", "avatar"]

# class ProfileUpdateSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", required=False)
#     email = serializers.EmailField(source="user.email", required=False)

#     class Meta:
#         model = Profile
#         fields = ["username", "email", "avatar"]

#     def update(self, instance, validated_data):
#         # Extract nested user data
#         user_data = validated_data.pop("user", {})
#         user = instance.user

#         if "username" in user_data:
#             user.username = user_data["username"]
#         if "email" in user_data:
#             user.email = user_data["email"]
#         user.save()

#         # Update profile fields (like avatar)
#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         instance.save()

#         return instance


# # ----------------------------
# # Quiz Response
# # ----------------------------
# class QuizResponseSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuizResponse
#         fields = "__all__"
#         read_only_fields = ("user", "created_at")


# # ----------------------------
# # Notes & Summaries
# # ----------------------------
# class TopicSummarySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TopicSummary
#         fields = ["id", "note", "topic", "summary"]


# # class QuizQuestionSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = QuizQuestion
# #         fields = ["id", "note", "question", "options", "answer", "difficulty"]

# class QuizQuestionSerializer(serializers.ModelSerializer):
#     options = serializers.SerializerMethodField()

#     class Meta:
#         model = QuizQuestion
#         fields = ["id", "note", "question", "options", "answer", "difficulty"]

#     def get_options(self, obj):
#         # If already a dict in DB
#         if isinstance(obj.options, dict):
#             return obj.options

#         # If stored as a list → convert to dict
#         if isinstance(obj.options, list):
#             letters = ["A", "B", "C", "D", "E", "F"]
#             return {letters[i]: choice for i, choice in enumerate(obj.options)}

#         # Fallback if empty/invalid
#         return {}

# class FlashcardSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Flashcard
#         fields = [
#             "id", "note", "term", "definition", "example", "related_terms",
#             "next_review", "ease_factor", "interval", "repetition",
#             "last_reviewed", "owner"
#         ]


# class NoteUploadSerializer(serializers.ModelSerializer):
#     topics = TopicSummarySerializer(many=True, read_only=True, source="topicsummary_set")
#     flashcards = FlashcardSerializer(many=True, read_only=True, source="flashcard_set")
#     quiz_questions = QuizQuestionSerializer(many=True, read_only=True, source="quizquestion_set")

#     class Meta:
#         model = NoteUpload
#         fields = [
#             "id", "title", "content", "status",
#             "created_at", "topics", "flashcards", "quiz_questions"
#         ]


# # ----------------------------
# # Flashcards Review
# # ----------------------------
# class FlashcardReviewLogSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FlashcardReviewLog
#         fields = ["id", "flashcard", "user", "reviewed_at", "correct"]


# # ----------------------------
# # Quiz Attempt
# # ----------------------------
# class QuizAttemptSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", read_only=True)
#     note_title = serializers.CharField(source="note.title", read_only=True)

#     class Meta:
#         model = QuizAttempt
#         fields = ["id", "user", "username", "note", "note_title",
#                   "score", "per_topic_score", "attempt_date"]


# # ----------------------------
# # Study Plan
# # ----------------------------
# # class StudyPlanSerializer(serializers.ModelSerializer):
# #     class Meta:
# #         model = StudyPlan
# #         fields = ["id", "user", "plan_type", "status", "plan_data","notes", "created_at"]
# #         read_only_fields = ("user", "created_at")
# class StudyPlanSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = StudyPlan
#         fields = [
#             "id",
#             "user",
#             "plan_type",
#             "status",
#             "plan_data",
#             "notes",
#             "completion_percentage",  # ✅ directly from model
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ("user", "created_at", "updated_at", "completion_percentage")

# # ----------------------------
# # Resource Visit Log
# # ----------------------------
# class ResourceVisitLogSerializer(serializers.ModelSerializer):
#     username = serializers.CharField(source="user.username", read_only=True)

#     class Meta:
#         model = ResourceVisitLog
#         fields = ["id", "user", "username", "study_plan",
#                   "week_index", "task_index", "resource_url", "visited_at"]
# class RegisterSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password']
#         extra_kwargs = {
#             'password': {'write_only': True}
#         }

#     def create(self, validated_data):
#         # ✅ Always use create_user to hash password
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password']
#         )
#         return user
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Profile, QuizResponse, NoteUpload, TopicSummary,
    QuizQuestion, Flashcard, QuizAttempt,
    FlashcardReviewLog, StudyPlan, ResourceVisitLog
)


# ─────────────────────────────────────────
# Auth & Profile
# ─────────────────────────────────────────
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists. Please log in instead.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['user', 'is_verified', 'avatar']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'avatar']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


# ─────────────────────────────────────────
# Career Quiz
# ─────────────────────────────────────────
class QuizResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizResponse
        fields = '__all__'
        read_only_fields = ('user', 'created_at')


# ─────────────────────────────────────────
# Notes & Summaries
# ─────────────────────────────────────────
class TopicSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicSummary
        fields = ['id', 'note', 'topic', 'summary']


class QuizQuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = ['id', 'note', 'question', 'options', 'answer', 'difficulty']

    def get_options(self, obj):
        # Already a dict → return as-is
        if isinstance(obj.options, dict):
            return obj.options
        # Stored as list → convert to {A: ..., B: ..., C: ..., D: ...}
        if isinstance(obj.options, list):
            letters = ['A', 'B', 'C', 'D', 'E', 'F']
            return {letters[i]: choice for i, choice in enumerate(obj.options)}
        return {}


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            'id', 'note', 'term', 'definition', 'example', 'related_terms',
            'next_review', 'ease_factor', 'interval', 'repetition',
            'last_reviewed', 'owner'
        ]


class NoteUploadSerializer(serializers.ModelSerializer):
    # ✅ Fixed: use the correct related_names defined in models
    topics = TopicSummarySerializer(many=True, read_only=True)
    flashcards = FlashcardSerializer(many=True, read_only=True)
    quiz_questions = QuizQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = NoteUpload
        fields = [
            'id', 'title', 'content', 'status',
            'created_at', 'topics', 'flashcards', 'quiz_questions'
        ]


# ─────────────────────────────────────────
# Flashcard Review
# ─────────────────────────────────────────
class FlashcardReviewLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlashcardReviewLog
        fields = ['id', 'flashcard', 'user', 'reviewed_at', 'correct']


# ─────────────────────────────────────────
# Quiz Attempt
# ─────────────────────────────────────────
class QuizAttemptSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    note_title = serializers.CharField(source='note.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'user', 'username', 'note', 'note_title',
                  'score', 'per_topic_score', 'attempt_date']


# ─────────────────────────────────────────
# Study Plan
# ─────────────────────────────────────────
class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = [
            'id', 'user', 'plan_type', 'status',
            'plan_data', 'notes',
            'completion_percentage',
            'created_at', 'updated_at',
        ]
        read_only_fields = ('user', 'created_at', 'updated_at', 'completion_percentage')


# ─────────────────────────────────────────
# Resource Visit Log
# ─────────────────────────────────────────
class ResourceVisitLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ResourceVisitLog
        fields = ['id', 'user', 'username', 'study_plan',
                  'week_index', 'task_index', 'resource_url', 'visited_at']
        read_only_fields = ('id', 'username', 'visited_at')