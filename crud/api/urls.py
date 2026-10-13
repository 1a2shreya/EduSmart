from django.urls import path
from .views import (
    RegisterAPI, VerifyOTP, LoginAPI, LogoutAPI,
    ForgotPasswordAPI, ResetPasswordAPI, ResendOTPAPI,
    DashboardAPI, UserProfileAPI, ProfileUpdateAPI,

    # Notes
    UploadNoteView, NoteStatusView, GetNoteProgressView, DeleteNoteView,

    # Quizzes
    LatestQuizResponseAPI, CareerRecommendationAPI,
    SubmitQuizAttemptView, QuizLeaderboardView, RetakeQuizView,JobsRecommendedAPI,

    # Flashcards (Spaced Repetition)
    FlashcardsDueAPI, FlashcardReviewAPI,

    # Adaptive Quiz
    AdaptiveNextQuestionAPI, SubmitAdaptiveAnswerAPI,

    # Study Plans
    StudyPlanGenerateAPI, StudyPlanLatestAPI,
    StudyPlanExportAPI, AdaptStudyPlanAPI, ResetStudyPlanAPI,
    ResourceVisitLogAPI,UpdateStudyPlanAPI, StudyPlanListView, StudyPlanDetailView,StudyPlanDeleteView,
    StudyPlanTopicQuizGenerateAPI, StudyPlanTopicQuizSubmitAPI,
)
from . import views
urlpatterns = [
    # --- Auth & Profile ---
    path('register/', RegisterAPI.as_view(), name='register'),
    path('verify-otp/', VerifyOTP.as_view(), name='verify-otp'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('forgot-password/', ForgotPasswordAPI.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordAPI.as_view(), name='reset-password'),
    path('resend-otp/', ResendOTPAPI.as_view(), name='resend-otp'),
    path('profile/', UserProfileAPI.as_view(), name='user-profile'),
    path('profile/edit/', ProfileUpdateAPI.as_view(), name='profile-update'),

    # --- Dashboard ---
path("dashboard/", DashboardAPI.as_view(), name="dashboard"),
    path("jobs/", JobsRecommendedAPI.as_view(), name="jobs-recommended"),

    # --- Notes ---
    path('notes/upload/', UploadNoteView.as_view(), name='upload-note'),
    path('notes/progress/', GetNoteProgressView.as_view(), name='note-progress'),
    path('notes/<int:note_id>/status/', NoteStatusView.as_view(), name='note-status'),
    path('notes/<int:note_id>/delete/', DeleteNoteView.as_view(), name='delete-note'),

    # --- Quizzes ---
    path('quiz-response/latest/', LatestQuizResponseAPI.as_view(), name='latest-quiz-response'),
    path('career-recommendation/', CareerRecommendationAPI.as_view(), name='career-recommendation'),
    path('notes/<int:note_id>/submit-quiz/', SubmitQuizAttemptView.as_view(), name='submit-quiz'),
    path('quiz/leaderboard/', QuizLeaderboardView.as_view(), name='quiz-leaderboard'),
    path('notes/quiz/<int:note_id>/retake/', RetakeQuizView.as_view(), name='retake-quiz'),

    # --- Flashcards (Spaced Repetition) ---
    path('flashcards/due/', FlashcardsDueAPI.as_view(), name='flashcards-due'),
    path('flashcards/<int:pk>/review/', FlashcardReviewAPI.as_view(), name='flashcard-review'),

    # --- Adaptive Quizzes ---
    path('notes/<int:note_id>/quiz/next/', AdaptiveNextQuestionAPI.as_view(), name='adaptive-next-question'),
    path('quiz/question/<int:pk>/answer/', SubmitAdaptiveAnswerAPI.as_view(), name='submit-adaptive-answer'),

    # --- Study Plans ---
    path("study-plan/generate/", StudyPlanGenerateAPI.as_view(), name="study-plan-generate"),
    path("study-plan/latest/", StudyPlanLatestAPI.as_view(), name="study-plan-latest"),
    path("study-plan/all/", StudyPlanListView.as_view(), name="study-plan-list"),
    path("study-plan/<uuid:pk>/", StudyPlanDetailView.as_view(), name="study-plan-detail"),
      path("study-plan/<uuid:id>/delete/", StudyPlanDeleteView.as_view(), name="study_plan_delete"),
    # path("study-plan/<uuid:pk>/progress/", StudyPlanProgressAPI.as_view(), name="study-plan-progress"),
    path("study-plan/<uuid:pk>/export/", StudyPlanExportAPI.as_view(), name="study-plan-export"),
    path("study-plan/adapt/", AdaptStudyPlanAPI.as_view(), name="study-plan-adapt"),
    path("study-plan/reset/", ResetStudyPlanAPI.as_view(), name="study-plan-reset"),
# Resource Visit Tracking
path("study-plan/resource-visit/", ResourceVisitLogAPI.as_view(), name="resource-visit"),
path("study-plan/update/", UpdateStudyPlanAPI.as_view(), name="study-plan-update"),

# Topic Quiz (Gemini-powered)
path("study-plan/topic-quiz/generate/", StudyPlanTopicQuizGenerateAPI.as_view(), name="topic-quiz-generate"),
path("study-plan/topic-quiz/submit/", StudyPlanTopicQuizSubmitAPI.as_view(), name="topic-quiz-submit"),

]
