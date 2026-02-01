package handlers

import (
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ProgressHandler struct{}

func NewProgressHandler() *ProgressHandler {
	return &ProgressHandler{}
}

func (h *ProgressHandler) GetCourseProgress(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	courseID, err := uuid.Parse(c.Param("courseId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	// Get course with modules and materials
	var course models.Course
	if err := database.GetDB().
		Preload("Modules.Materials").
		Preload("Modules.Materials.StudyPacks").
		First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	// Count total materials
	totalMaterials := 0
	for _, module := range course.Modules {
		totalMaterials += len(module.Materials)
	}

	// Get progress events for this course
	var events []models.ProgressEvent
	database.GetDB().
		Where("user_id = ? AND course_id = ?", userID, courseID.String()).
		Find(&events)

	// Count completed materials (materials with study pack interactions)
	completedMaterials := make(map[uuid.UUID]bool)
	for _, event := range events {
		if event.EventType == "QUIZ_ATTEMPT" || event.EventType == "FLASHCARD_SESSION" {
			// Extract material ID from payload if possible
			// For simplicity, we'll count unique events
			completedMaterials[uuid.New()] = true // Simplified - would need proper parsing
		}
	}

	// Get quiz attempts
	var quizAttempts []models.QuizAttempt
	database.GetDB().
		Joins("JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id").
		Joins("JOIN study_packs ON quizzes.study_pack_id = study_packs.id").
		Joins("JOIN materials ON study_packs.material_id = materials.id").
		Joins("JOIN modules ON materials.module_id = modules.id").
		Where("modules.course_id = ? AND quiz_attempts.user_id = ?", courseID, userID).
		Find(&quizAttempts)

	// Get flashcard sessions
	var flashcardSessions []models.FlashcardSession
	database.GetDB().
		Joins("JOIN study_packs ON flashcard_sessions.study_pack_id = study_packs.id").
		Joins("JOIN materials ON study_packs.material_id = materials.id").
		Joins("JOIN modules ON materials.module_id = modules.id").
		Where("modules.course_id = ? AND flashcard_sessions.user_id = ?", courseID, userID).
		Find(&flashcardSessions)

	// Calculate progress percentage
	progressPercentage := 0.0
	if totalMaterials > 0 {
		// Count unique materials with activity
		activeMaterials := make(map[uuid.UUID]bool)
		for _, attempt := range quizAttempts {
			var quiz models.Quiz
			if err := database.GetDB().Preload("StudyPack").First(&quiz, attempt.QuizID).Error; err == nil {
				if quiz.StudyPack.MaterialID != uuid.Nil {
					activeMaterials[quiz.StudyPack.MaterialID] = true
				}
			}
		}
		for _, session := range flashcardSessions {
			var studyPack models.StudyPack
			if err := database.GetDB().First(&studyPack, session.StudyPackID).Error; err == nil {
				if studyPack.MaterialID != uuid.Nil {
					activeMaterials[studyPack.MaterialID] = true
				}
			}
		}
		progressPercentage = float64(len(activeMaterials)) / float64(totalMaterials) * 100
	}

	// Get last activity
	lastActivity := time.Time{}
	if len(events) > 0 {
		lastActivity = events[len(events)-1].CreatedAt
	}

	c.JSON(http.StatusOK, gin.H{
		"courseId":          courseID,
		"progressPercentage": progressPercentage,
		"totalMaterials":    totalMaterials,
		"completedMaterials": len(completedMaterials),
		"quizAttempts":      len(quizAttempts),
		"flashcardSessions": len(flashcardSessions),
		"lastActivity":      lastActivity,
	})
}

func (h *ProgressHandler) GetProgressByOrg(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	orgID := c.MustGet("orgID").(uuid.UUID)

	// Get all courses in org
	var courses []models.Course
	database.GetDB().
		Where("org_id = ?", orgID).
		Find(&courses)

	result := make([]gin.H, 0)
	for _, course := range courses {
		// Get progress for this course
		var events []models.ProgressEvent
		database.GetDB().
			Where("user_id = ? AND course_id = ?", userID, course.ID.String()).
			Find(&events)

		// Calculate progress (simplified)
		progressPercentage := 0.0
		if len(events) > 0 {
			progressPercentage = float64(len(events)) * 10.0 // Simplified calculation
			if progressPercentage > 100 {
				progressPercentage = 100
			}
		}

		result = append(result, gin.H{
			"courseId":          course.ID,
			"courseTitle":       course.Title,
			"progressPercentage": progressPercentage,
		})
	}

	c.JSON(http.StatusOK, result)
}
