package handlers

import (
	"encoding/json"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AIHandler struct {
	GeminiAPIKey string
}

func NewAIHandler(geminiAPIKey string) *AIHandler {
	return &AIHandler{GeminiAPIKey: geminiAPIKey}
}

func (h *AIHandler) GetStudyPack(c *gin.Context) {
	materialID, err := uuid.Parse(c.Param("materialId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material ID"})
		return
	}

	var studyPack models.StudyPack
	if err := database.GetDB().
		Preload("Summary").
		Preload("Quizzes.Questions").
		Preload("Flashcards").
		Preload("Material").
		Where("material_id = ? AND status = ?", materialID, "GENERATED").
		Order("created_at DESC").
		First(&studyPack).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Study pack not found or not ready"})
		return
	}

	// Parse summary content from JSON
	var summaryContent map[string]interface{}
	if studyPack.Summary != nil {
		json.Unmarshal([]byte(studyPack.Summary.Content), &summaryContent)
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         studyPack.ID,
		"materialId": studyPack.MaterialID,
		"status":     studyPack.Status,
		"summary":    gin.H{"content": summaryContent},
		"quizzes":    studyPack.Quizzes,
		"flashcards": studyPack.Flashcards,
		"material":   studyPack.Material,
	})
}

type TutorChatRequest struct {
	CourseID string `json:"courseId" binding:"required"`
	Query    string `json:"query" binding:"required"`
}

func (h *AIHandler) TutorChat(c *gin.Context) {
	var req TutorChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock response for MVP (Gemini integration would go here)
	c.JSON(http.StatusOK, gin.H{
		"answer":                 "I am a mock AI tutor. Real Gemini integration would provide intelligent responses based on your course materials.",
		"sourceReferences":       []string{"Mock Source 1", "Mock Source 2"},
		"analyzedMaterialsCount": 2,
	})
}
