package handlers

import (
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AssignmentHandler struct{}

func NewAssignmentHandler() *AssignmentHandler {
	return &AssignmentHandler{}
}

type CreateAssignmentRequest struct {
	CourseID     string    `json:"courseId" binding:"required"`
	Title        string    `json:"title" binding:"required"`
	DueAt        time.Time `json:"dueAt" binding:"required"`
	Points       int       `json:"points" binding:"required"`
	Instructions string    `json:"instructions" binding:"required"`
}

func (h *AssignmentHandler) CreateAssignment(c *gin.Context) {
	var req CreateAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID, err := uuid.Parse(req.CourseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	assignment := models.Assignment{
		CourseID:     courseID,
		Title:        req.Title,
		DueAt:        req.DueAt,
		Points:       req.Points,
		Instructions: req.Instructions,
		Status:       "ACTIVE",
	}

	if err := database.GetDB().Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
		return
	}

	c.JSON(http.StatusCreated, assignment)
}

func (h *AssignmentHandler) GetAssignmentsByCourse(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	userID := c.MustGet("userID").(uuid.UUID)

	var assignments []models.Assignment
	if err := database.GetDB().
		Where("course_id = ? AND status = ?", courseID, "ACTIVE").
		Order("due_at ASC").
		Find(&assignments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}

	// Get user's submissions to determine status
	var submissions []models.Submission
	database.GetDB().Where("user_id = ?", userID).Find(&submissions)
	submissionMap := make(map[uuid.UUID]models.Submission)
	for _, sub := range submissions {
		submissionMap[sub.AssignmentID] = sub
	}

	// Build response with status
	result := make([]gin.H, len(assignments))
	for i, assignment := range assignments {
		status := "NOT_STARTED"
		if sub, exists := submissionMap[assignment.ID]; exists {
			if sub.Status == "GRADED" {
				status = "GRADED"
			} else if sub.Status == "SUBMITTED" {
				status = "SUBMITTED"
			} else {
				status = "IN_PROGRESS"
			}
		}

		result[i] = gin.H{
			"id":           assignment.ID,
			"title":        assignment.Title,
			"dueAt":        assignment.DueAt,
			"points":       assignment.Points,
			"instructions": assignment.Instructions,
			"status":       status,
			"submission":   nil,
		}

		if sub, exists := submissionMap[assignment.ID]; exists {
			result[i]["submission"] = sub
		}
	}

	c.JSON(http.StatusOK, result)
}

func (h *AssignmentHandler) GetAssignment(c *gin.Context) {
	assignmentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	var assignment models.Assignment
	if err := database.GetDB().
		Preload("Submissions").
		Preload("Course").
		First(&assignment, assignmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	c.JSON(http.StatusOK, assignment)
}

type SubmitAssignmentRequest struct {
	FileURL *string `json:"fileUrl"`
}

func (h *AssignmentHandler) SubmitAssignment(c *gin.Context) {
	assignmentID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid assignment ID"})
		return
	}

	userID := c.MustGet("userID").(uuid.UUID)

	var req SubmitAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if assignment exists
	var assignment models.Assignment
	if err := database.GetDB().First(&assignment, assignmentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found"})
		return
	}

	// Check if submission already exists
	var existingSubmission models.Submission
	if err := database.GetDB().Where("assignment_id = ? AND user_id = ?", assignmentID, userID).First(&existingSubmission).Error; err == nil {
		// Update existing submission
		existingSubmission.Status = "SUBMITTED"
		existingSubmission.SubmittedAt = time.Now()
		if req.FileURL != nil {
			existingSubmission.FileURL = req.FileURL
		}
		if err := database.GetDB().Save(&existingSubmission).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update submission"})
			return
		}
		c.JSON(http.StatusOK, existingSubmission)
		return
	}

	// Create new submission
	submission := models.Submission{
		AssignmentID: assignmentID,
		UserID:       userID,
		Status:       "SUBMITTED",
		SubmittedAt:  time.Now(),
		FileURL:      req.FileURL,
	}

	if err := database.GetDB().Create(&submission).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create submission"})
		return
	}

	c.JSON(http.StatusCreated, submission)
}
