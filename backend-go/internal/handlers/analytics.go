package handlers

import (
	"encoding/json"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AnalyticsHandler struct{}

func NewAnalyticsHandler() *AnalyticsHandler {
	return &AnalyticsHandler{}
}

func (h *AnalyticsHandler) GetStudentDashboard(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)

	// Get enrollments with progress
	var enrollments []models.Enrollment
	database.GetDB().
		Preload("Course").
		Where("user_id = ?", userID).
		Find(&enrollments)

	// Get recent quiz attempts with trend
	var quizAttempts []models.QuizAttempt
	database.GetDB().
		Preload("Quiz.StudyPack.Material").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(20).
		Find(&quizAttempts)

	// Calculate average score and trend
	var avgScore float64
	var lastScore int
	var scoreTrend []int
	if len(quizAttempts) > 0 {
		total := 0
		for i, attempt := range quizAttempts {
			total += attempt.Score
			if i < 5 { // Last 5 scores for trend
				scoreTrend = append(scoreTrend, attempt.Score)
			}
		}
		avgScore = float64(total) / float64(len(quizAttempts))
		lastScore = quizAttempts[0].Score
	}

	// Get weak topics (materials with low scores)
	weakTopics := make(map[string]int)
	for _, attempt := range quizAttempts {
		if attempt.Score < 70 {
			if attempt.Quiz.StudyPack.MaterialID != uuid.Nil {
				var material models.Material
				if err := database.GetDB().First(&material, attempt.Quiz.StudyPack.MaterialID).Error; err == nil {
					weakTopics[material.Title] = attempt.Score
				}
			}
		}
	}

	// Calculate overall progress
	var progressEvents []models.ProgressEvent
	database.GetDB().
		Where("user_id = ?", userID).
		Find(&progressEvents)

	// Get next step recommendation
	nextStep := "Continue with your current course"
	if len(enrollments) > 0 {
		nextStep = "Complete assignments in " + enrollments[0].Course.Title
	}

	c.JSON(http.StatusOK, gin.H{
		"enrolledCourses": enrollments,
		"recentActivity":  quizAttempts[:min(10, len(quizAttempts))],
		"totalAttempts":   len(quizAttempts),
		"avgScore":        avgScore,
		"lastScore":       lastScore,
		"scoreTrend":      scoreTrend,
		"weakTopics":      weakTopics,
		"nextStep":        nextStep,
		"totalProgressEvents": len(progressEvents),
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func (h *AnalyticsHandler) GetTeacherDashboard(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)

	// Get created courses
	var courses []models.Course
	database.GetDB().
		Preload("Enrollments.User").
		Preload("Modules").
		Where("created_by = ?", userID).
		Find(&courses)

	// Build cohort list with progress and scores
	cohorts := make([]gin.H, 0)
	totalStudents := 0
	atRiskCount := 0

	for _, course := range courses {
		for _, enrollment := range course.Enrollments {
			if enrollment.Role == "STUDENT" {
				totalStudents++

				// Calculate student progress
				var progressEvents []models.ProgressEvent
				database.GetDB().
					Where("user_id = ? AND course_id = ?", enrollment.UserID, course.ID.String()).
					Find(&progressEvents)

				// Get quiz scores
				var quizAttempts []models.QuizAttempt
				database.GetDB().
					Joins("JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id").
					Joins("JOIN study_packs ON quizzes.study_pack_id = study_packs.id").
					Joins("JOIN materials ON study_packs.material_id = materials.id").
					Joins("JOIN modules ON materials.module_id = modules.id").
					Where("modules.course_id = ? AND quiz_attempts.user_id = ?", course.ID, enrollment.UserID).
					Find(&quizAttempts)

				var avgScore float64
				if len(quizAttempts) > 0 {
					total := 0
					for _, attempt := range quizAttempts {
						total += attempt.Score
					}
					avgScore = float64(total) / float64(len(quizAttempts))
				}

				progressPercentage := float64(len(progressEvents)) * 5.0 // Simplified
				if progressPercentage > 100 {
					progressPercentage = 100
				}

				atRisk := avgScore < 60 || progressPercentage < 30
				if atRisk {
					atRiskCount++
				}

				cohorts = append(cohorts, gin.H{
					"studentId":        enrollment.UserID,
					"studentName":      enrollment.User.Name,
					"courseId":         course.ID,
					"courseTitle":      course.Title,
					"progress":         progressPercentage,
					"avgScore":         avgScore,
					"atRisk":           atRisk,
					"quizAttempts":     len(quizAttempts),
				})
			}
		}
	}

	// Get weakest topics across all courses
	weakTopics := make(map[string]int)
	for _, course := range courses {
		var quizAttempts []models.QuizAttempt
		database.GetDB().
			Joins("JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id").
			Joins("JOIN study_packs ON quizzes.study_pack_id = study_packs.id").
			Joins("JOIN materials ON study_packs.material_id = materials.id").
			Joins("JOIN modules ON materials.module_id = modules.id").
			Where("modules.course_id = ?", course.ID).
			Find(&quizAttempts)

		for _, attempt := range quizAttempts {
			if attempt.Score < 70 {
				var material models.Material
				if err := database.GetDB().First(&material, attempt.Quiz.StudyPack.MaterialID).Error; err == nil {
					weakTopics[material.Title]++
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"cohorts":       cohorts,
		"totalStudents": totalStudents,
		"atRiskCount":   atRiskCount,
		"weakTopics":    weakTopics,
		"totalCourses":  len(courses),
	})
}

func (h *AnalyticsHandler) GetOrganizerDashboard(c *gin.Context) {
	orgID := c.MustGet("orgID").(uuid.UUID)

	// Get active users (users with activity in last 7 days)
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)
	var activeUsers []models.User
	database.GetDB().
		Joins("JOIN org_memberships ON users.id = org_memberships.user_id").
		Joins("LEFT JOIN progress_events ON users.id = progress_events.user_id").
		Where("org_memberships.org_id = ? AND (progress_events.created_at > ? OR users.last_login > ?)", orgID, sevenDaysAgo, sevenDaysAgo).
		Group("users.id").
		Find(&activeUsers)

	// Count study packs generated
	var studyPacksCount int64
	database.GetDB().
		Model(&models.StudyPack{}).
		Joins("JOIN materials ON study_packs.material_id = materials.id").
		Joins("JOIN modules ON materials.module_id = modules.id").
		Joins("JOIN courses ON modules.course_id = courses.id").
		Where("courses.org_id = ? AND study_packs.status = ?", orgID, "READY").
		Count(&studyPacksCount)

	// Count quizzes taken
	var quizzesTakenCount int64
	database.GetDB().
		Model(&models.QuizAttempt{}).
		Joins("JOIN quizzes ON quiz_attempts.quiz_id = quizzes.id").
		Joins("JOIN study_packs ON quizzes.study_pack_id = study_packs.id").
		Joins("JOIN materials ON study_packs.material_id = materials.id").
		Joins("JOIN modules ON materials.module_id = modules.id").
		Joins("JOIN courses ON modules.course_id = courses.id").
		Where("courses.org_id = ?", orgID).
		Count(&quizzesTakenCount)

	// Calculate retention (users active in last 7 days / total users)
	var totalUsers int64
	database.GetDB().
		Model(&models.OrgMembership{}).
		Where("org_id = ? AND status = ?", orgID, "Active").
		Count(&totalUsers)

	retentionRate := 0.0
	if totalUsers > 0 {
		retentionRate = float64(len(activeUsers)) / float64(totalUsers) * 100
	}

	// Get daily metrics
	var dailyMetrics []models.DailyOrgMetric
	database.GetDB().
		Where("org_id = ?", orgID).
		Order("date DESC").
		Limit(30).
		Find(&dailyMetrics)

	c.JSON(http.StatusOK, gin.H{
		"activeUsers":      len(activeUsers),
		"totalUsers":       totalUsers,
		"studyPacksGenerated": studyPacksCount,
		"quizzesTaken":     quizzesTakenCount,
		"retentionRate":    retentionRate,
		"dailyMetrics":     dailyMetrics,
	})
}

type RecordQuizAttemptRequest struct {
	QuizID  string            `json:"quizId" binding:"required"`
	Answers map[string]string `json:"answers" binding:"required"`
}

func (h *AnalyticsHandler) RecordQuizAttempt(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req RecordQuizAttemptRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	quizID, err := uuid.Parse(req.QuizID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid quiz ID"})
		return
	}

	// Get quiz with questions
	var quiz models.Quiz
	if err := database.GetDB().Preload("Questions").First(&quiz, quizID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz not found"})
		return
	}

	// Calculate score (proper JSON comparison)
	score := 0
	answersMap := make(map[string]interface{})
	
	for _, question := range quiz.Questions {
		questionIDStr := question.ID.String()
		if userAnswer, ok := req.Answers[questionIDStr]; ok {
			answersMap[questionIDStr] = userAnswer
			
			// Parse answer key (could be string or array for MCQ)
			var answerKey interface{}
			json.Unmarshal([]byte(question.AnswerKey), &answerKey)
			
			// Compare answers
			if compareAnswers(userAnswer, answerKey) {
				score++
			}
		}
	}

	percentage := 0
	if len(quiz.Questions) > 0 {
		percentage = int(float64(score) / float64(len(quiz.Questions)) * 100)
	}

	// Marshal answers to JSON
	answersJSON, _ := json.Marshal(answersMap)

	// Create quiz attempt
	attempt := models.QuizAttempt{
		QuizID:  quizID,
		UserID:  userID,
		Score:   percentage,
		Answers: string(answersJSON),
	}

	// Record progress event
	progressEvent := models.ProgressEvent{
		UserID:    userID,
		CourseID:  "", // Will be set from quiz
		EventType: "QUIZ_ATTEMPT",
		Payload:   string(answersJSON),
	}

	// Get course from quiz
	var studyPack models.StudyPack
	if err := database.GetDB().Preload("Material.Module.Course").First(&studyPack, quiz.StudyPackID).Error; err == nil {
		if studyPack.Material.Module.Course.ID != uuid.Nil {
			progressEvent.CourseID = studyPack.Material.Module.Course.ID.String()
		}
	}
	database.GetDB().Create(&progressEvent)

	if err := database.GetDB().Create(&attempt).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record attempt"})
		return
	}

	c.JSON(http.StatusOK, attempt)
}

func compareAnswers(userAnswer interface{}, correctAnswer interface{}) bool {
	// Simple string comparison for MVP
	userStr := ""
	correctStr := ""
	
	if str, ok := userAnswer.(string); ok {
		userStr = str
	}
	if str, ok := correctAnswer.(string); ok {
		correctStr = str
	}
	
	// Remove quotes if present
	if len(correctStr) > 0 && correctStr[0] == '"' {
		correctStr = correctStr[1 : len(correctStr)-1]
	}
	
	return userStr == correctStr
}
