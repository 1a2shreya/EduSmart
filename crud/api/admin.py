# # from django.contrib import admin
# # from .models import Student
# # # Register your models here.
# # @admin.register(Student)
# # class StudentAdmin(admin.ModelAdmin):
# #     list_display=["id", "name", "email"]
# # from django.contrib import admin
# from django.contrib.auth.models import User
# # from .models import Profile

# # # Extend the built-in User admin
# # class ProfileInline(admin.StackedInline):
# #     model = Profile
# #     can_delete = False
# #     verbose_name_plural = 'Profile'

# # class UserAdmin(admin.ModelAdmin):
# #     inlines = (ProfileInline,)
# #     list_display = ('username', 'email', 'is_staff', 'is_active')
# #     search_fields = ('username', 'email')

# # # Unregister the original User admin and register the new one
# # admin.site.unregister(User)
# # admin.site.register(User, UserAdmin)

# # # Optional: Register Profile separately if needed
# # # admin.site.register(Profile)
# from django.contrib import admin
# from .models import Profile, QuizResponse, NoteUpload, TopicSummary, QuizQuestion, Flashcard, QuizAttempt

# # Already have this for User:
# from django.contrib.auth.models import User

# class ProfileInline(admin.StackedInline):
#     model = Profile
#     can_delete = False
#     verbose_name_plural = 'Profile'

# class UserAdmin(admin.ModelAdmin):
#     inlines = (ProfileInline,)
#     list_display = ('username', 'email', 'is_staff', 'is_active')
#     search_fields = ('username', 'email')

# admin.site.unregister(User)
# admin.site.register(User, UserAdmin)

# # Register other models
# admin.site.register(QuizResponse)
# admin.site.register(NoteUpload)
# admin.site.register(TopicSummary)
# admin.site.register(QuizQuestion)
# admin.site.register(Flashcard)
# admin.site.register(QuizAttempt)
# from django.contrib import admin
# from .models import  FlashcardReviewLog, StudyPlan

# # @admin.register(Flashcard)
# class FlashcardAdmin(admin.ModelAdmin):
#     list_display = ('term', 'note', 'next_review', 'owner')
#     list_filter = ('next_review',)
#     search_fields = ('term', 'definition')

# @admin.register(FlashcardReviewLog)
# class FlashcardReviewLogAdmin(admin.ModelAdmin):
#     list_display = ('flashcard', 'user', 'reviewed_at', 'correct')
#     list_filter = ('correct', 'reviewed_at')
#     search_fields = ('flashcard__term', 'user__username')

# @admin.register(StudyPlan)
# class StudyPlanAdmin(admin.ModelAdmin):
#     list_display = ('id', 'user', 'created_at')
#     list_filter = ('created_at',)
#     search_fields = ('user__username',)
from django.contrib import admin
from django.contrib.auth.models import User
from .models import (
    Profile, QuizResponse, NoteUpload, TopicSummary,
    QuizQuestion, Flashcard, QuizAttempt,
    FlashcardReviewLog, StudyPlan, ResourceVisitLog
)

# ----------------------------
# Extend the built-in User admin with Profile
# ----------------------------
class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


class CustomUserAdmin(admin.ModelAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'is_staff', 'is_active', 'last_login')
    search_fields = ('username', 'email')
    list_filter = ('is_staff', 'is_active')


# Unregister the original User admin and register new one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# ----------------------------
# Other Models
# ----------------------------
@admin.register(QuizResponse)
class QuizResponseAdmin(admin.ModelAdmin):
    list_display = ('user', 'predicted_career', 'created_at')
    list_filter = ('predicted_career', 'created_at')
    search_fields = ('user__username', 'predicted_career')


@admin.register(NoteUpload)
class NoteUploadAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('title', 'user__username')


@admin.register(TopicSummary)
class TopicSummaryAdmin(admin.ModelAdmin):
    list_display = ('topic', 'note')
    search_fields = ('topic', 'note__title')


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('question', 'note', 'difficulty')
    list_filter = ('difficulty',)
    search_fields = ('question', 'note__title')


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ('term', 'note', 'next_review', 'owner')
    list_filter = ('next_review',)
    search_fields = ('term', 'definition')


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'note', 'score', 'attempt_date')
    list_filter = ('attempt_date',)
    search_fields = ('user__username', 'note__title')


@admin.register(FlashcardReviewLog)
class FlashcardReviewLogAdmin(admin.ModelAdmin):
    list_display = ('flashcard', 'user', 'reviewed_at', 'correct')
    list_filter = ('correct', 'reviewed_at')
    search_fields = ('flashcard__term', 'user__username')


# ----------------------------
# StudyPlan with extra visibility
# ----------------------------
@admin.register(StudyPlan)
class StudyPlanAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'plan_type', 'status', 'completion_percentage_display', 'created_at', 'updated_at')
    list_filter = ('plan_type', 'status', 'created_at', 'updated_at')
    search_fields = ('user__username',)
    readonly_fields = ('created_at', 'updated_at')

    def completion_percentage_display(self, obj):
        """Show % completed tasks from plan_data JSON instead of raw float."""
        if obj.plan_data and "weeks" in obj.plan_data:
            total = sum(len(w.get("tasks", [])) for w in obj.plan_data["weeks"])
            done = sum(
                1
                for w in obj.plan_data["weeks"]
                for t in w.get("tasks", [])
                if t.get("done")
            )
            return f"{(done / total * 100):.0f}%" if total > 0 else "0%"
        return "0%"

    completion_percentage_display.short_description = "Completion %"



@admin.register(ResourceVisitLog)
class ResourceVisitLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'study_plan', 'week_index', 'task_index', 'resource_url', 'visited_at')
    list_filter = ('visited_at',)
    search_fields = ('user__username', 'resource_url')
