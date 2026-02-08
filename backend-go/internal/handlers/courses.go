package handlers

import (
	"errors"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CourseHandler struct{}

func NewCourseHandler() *CourseHandler {
	return &CourseHandler{}
}

type CreateCourseRequest struct {
	OrgID       string `json:"orgId" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
}

func (h *CourseHandler) CreateCourse(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// RBAC Check: Only ORGANIZER can create courses
	// Get membership for the target organization
	orgID, err := uuid.Parse(req.OrgID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var membership models.OrgMembership
	if err := database.GetDB().Where("user_id = ? AND org_id = ? AND status = ?", userID, orgID, "Active").First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have access to this organization"})
		return
	}

	if membership.Role != "ORGANIZER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only organizers can create courses"})
		return
	}

	course := models.Course{
		OrgID:       orgID,
		Code:        req.Code,
		Title:       req.Title,
		Description: req.Description,
		CreatedBy:   userID,
	}

	if err := database.GetDB().Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	c.JSON(http.StatusCreated, course)
}

func (h *CourseHandler) GetCourse(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	var course models.Course
	if err := database.GetDB().
		Preload("Modules.Materials.StudyPacks").
		Preload("Assignments").
		First(&course, courseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	c.JSON(http.StatusOK, course)
}

func (h *CourseHandler) GetCoursesByOrg(c *gin.Context) {
	orgID, err := uuid.Parse(c.Param("orgId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	var courses []models.Course

	// Check if user is a member of the organization
	userID := c.MustGet("userID").(uuid.UUID)
	var membership models.OrgMembership
	if err := database.GetDB().Where("user_id = ? AND org_id = ? AND status = ?", userID, orgID, "Active").First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have access to this organization"})
		return
	}

	if err := database.GetDB().Where("org_id = ?", orgID).Find(&courses).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch courses"})
		return
	}

	c.JSON(http.StatusOK, courses)
}

func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	var course models.Course
	if err := database.GetDB().First(&course, courseID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch course"})
		return
	}

	var membership models.OrgMembership
	if err := database.GetDB().Where("user_id = ? AND org_id = ? AND status = ?", userID, course.OrgID, "Active").First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You do not have access to this organization"})
		return
	}
	if membership.Role != "ORGANIZER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only organizers can delete courses"})
		return
	}

	tx := database.GetDB().Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}

	var assignmentIDs []uuid.UUID
	if err := tx.Model(&models.Assignment{}).Where("course_id = ?", courseID).Pluck("id", &assignmentIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare assignment cleanup"})
		return
	}

	var threadIDs []uuid.UUID
	if err := tx.Model(&models.Thread{}).Where("course_id = ?", courseID).Pluck("id", &threadIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare discussion cleanup"})
		return
	}

	var moduleIDs []uuid.UUID
	if err := tx.Model(&models.Module{}).Where("course_id = ?", courseID).Pluck("id", &moduleIDs).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare module cleanup"})
		return
	}

	var materialIDs []uuid.UUID
	if len(moduleIDs) > 0 {
		if err := tx.Model(&models.Material{}).Where("module_id IN ?", moduleIDs).Pluck("id", &materialIDs).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare material cleanup"})
			return
		}
	}

	var studyPackIDs []uuid.UUID
	if len(materialIDs) > 0 {
		if err := tx.Model(&models.StudyPack{}).Where("material_id IN ?", materialIDs).Pluck("id", &studyPackIDs).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare study pack cleanup"})
			return
		}
	}

	var quizIDs []uuid.UUID
	if len(studyPackIDs) > 0 {
		if err := tx.Model(&models.Quiz{}).Where("study_pack_id IN ?", studyPackIDs).Pluck("id", &quizIDs).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to prepare quiz cleanup"})
			return
		}
	}

	if len(quizIDs) > 0 {
		if err := tx.Where("quiz_id IN ?", quizIDs).Delete(&models.QuizAttempt{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete quiz attempts"})
			return
		}
		if err := tx.Where("quiz_id IN ?", quizIDs).Delete(&models.QuizQuestion{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete quiz questions"})
			return
		}
		if err := tx.Where("id IN ?", quizIDs).Delete(&models.Quiz{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete quizzes"})
			return
		}
	}

	if len(studyPackIDs) > 0 {
		if err := tx.Where("study_pack_id IN ?", studyPackIDs).Delete(&models.FlashcardSession{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete flashcard sessions"})
			return
		}
		if err := tx.Where("study_pack_id IN ?", studyPackIDs).Delete(&models.Flashcard{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete flashcards"})
			return
		}
		if err := tx.Where("study_pack_id IN ?", studyPackIDs).Delete(&models.Summary{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete summaries"})
			return
		}
		if err := tx.Where("id IN ?", studyPackIDs).Delete(&models.StudyPack{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete study packs"})
			return
		}
	}

	if len(materialIDs) > 0 {
		if err := tx.Where("id IN ?", materialIDs).Delete(&models.Material{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete materials"})
			return
		}
	}

	if len(moduleIDs) > 0 {
		if err := tx.Where("id IN ?", moduleIDs).Delete(&models.Module{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete modules"})
			return
		}
	}

	if len(assignmentIDs) > 0 {
		if err := tx.Where("assignment_id IN ?", assignmentIDs).Delete(&models.Submission{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete submissions"})
			return
		}
		if err := tx.Where("id IN ?", assignmentIDs).Delete(&models.Assignment{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete assignments"})
			return
		}
	}

	if len(threadIDs) > 0 {
		if err := tx.Where("thread_id IN ?", threadIDs).Delete(&models.Reply{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete replies"})
			return
		}
		if err := tx.Where("id IN ?", threadIDs).Delete(&models.Thread{}).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete threads"})
			return
		}
	}

	if err := tx.Where("course_id = ?", courseID).Delete(&models.Enrollment{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete enrollments"})
		return
	}
	if err := tx.Where("course_id = ?", courseID).Delete(&models.CourseMetric{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course metrics"})
		return
	}

	if err := tx.Delete(&course).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit course deletion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Course deleted successfully"})
}
