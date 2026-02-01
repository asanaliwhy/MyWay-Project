package handlers

import (
	"encoding/json"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FlashcardHandler struct{}

func NewFlashcardHandler() *FlashcardHandler {
	return &FlashcardHandler{}
}

func (h *FlashcardHandler) GetFlashcardsByStudyPack(c *gin.Context) {
	studyPackID, err := uuid.Parse(c.Param("studyPackId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid study pack ID"})
		return
	}

	var flashcards []models.Flashcard
	if err := database.GetDB().
		Where("study_pack_id = ?", studyPackID).
		Find(&flashcards).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch flashcards"})
		return
	}

	c.JSON(http.StatusOK, flashcards)
}

type FlashcardSessionRequest struct {
	StudyPackID uuid.UUID                    `json:"studyPackId" binding:"required"`
	Responses   map[uuid.UUID]string `json:"responses" binding:"required"` // flashcardID -> "known" or "unknown"
	DurationSec int                          `json:"durationSec" binding:"required"`
}

func (h *FlashcardHandler) RecordSession(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req FlashcardSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Count known/unknown
	knownCount := 0
	unknownCount := 0
	for _, response := range req.Responses {
		if response == "known" {
			knownCount++
		} else {
			unknownCount++
		}
	}

	// Create session
	session := models.FlashcardSession{
		StudyPackID:  req.StudyPackID,
		UserID:       userID,
		KnownCount:   knownCount,
		UnknownCount: unknownCount,
		DurationSec:  req.DurationSec,
	}

	if err := database.GetDB().Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record session"})
		return
	}

	// Record progress event
	responsesJSON, _ := json.Marshal(req.Responses)
	progressEvent := models.ProgressEvent{
		UserID:    userID,
		CourseID:  "", // Will be set from study pack material
		EventType: "FLASHCARD_SESSION",
		Payload:   string(responsesJSON),
	}

	// Get study pack to find course
	var studyPack models.StudyPack
	if err := database.GetDB().Preload("Material.Module.Course").First(&studyPack, req.StudyPackID).Error; err == nil {
		if studyPack.Material.Module.Course.ID != uuid.Nil {
			progressEvent.CourseID = studyPack.Material.Module.Course.ID.String()
		}
	}

	database.GetDB().Create(&progressEvent)

	c.JSON(http.StatusOK, session)
}

func (h *FlashcardHandler) GetSessionsByUser(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)

	var sessions []models.FlashcardSession
	if err := database.GetDB().
		Preload("StudyPack.Material").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(20).
		Find(&sessions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch sessions"})
		return
	}

	c.JSON(http.StatusOK, sessions)
}
