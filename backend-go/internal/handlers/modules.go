package handlers

import (
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ModuleHandler struct{}

func NewModuleHandler() *ModuleHandler {
	return &ModuleHandler{}
}

type CreateModuleRequest struct {
	CourseID   string  `json:"courseId" binding:"required"`
	Title      string  `json:"title" binding:"required"`
	Order      int     `json:"order"`
	LockedRule *string `json:"lockedRule"`
}

func (h *ModuleHandler) CreateModule(c *gin.Context) {
	var req CreateModuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID, err := uuid.Parse(req.CourseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	module := models.Module{
		CourseID:   courseID,
		Title:      req.Title,
		Order:      req.Order,
		LockedRule: req.LockedRule,
	}

	if err := database.GetDB().Create(&module).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create module"})
		return
	}

	c.JSON(http.StatusCreated, module)
}

func (h *ModuleHandler) GetModulesByCourse(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("courseId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	var modules []models.Module
	if err := database.GetDB().
		Preload("Materials").
		Where("course_id = ?", courseID).
		Order("`order` ASC").
		Find(&modules).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch modules"})
		return
	}

	c.JSON(http.StatusOK, modules)
}

func (h *ModuleHandler) GetModule(c *gin.Context) {
	moduleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid module ID"})
		return
	}

	var module models.Module
	if err := database.GetDB().
		Preload("Materials.StudyPacks").
		Preload("Course").
		First(&module, moduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Module not found"})
		return
	}

	c.JSON(http.StatusOK, module)
}

func (h *ModuleHandler) UpdateModule(c *gin.Context) {
	moduleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid module ID"})
		return
	}

	var req struct {
		Title      *string `json:"title"`
		Order      *int    `json:"order"`
		LockedRule *string `json:"lockedRule"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var module models.Module
	if err := database.GetDB().First(&module, moduleID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Module not found"})
		return
	}

	updates := make(map[string]interface{})
	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Order != nil {
		updates["order"] = *req.Order
	}
	if req.LockedRule != nil {
		updates["locked_rule"] = *req.LockedRule
	}

	if err := database.GetDB().Model(&module).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update module"})
		return
	}

	c.JSON(http.StatusOK, module)
}

func (h *ModuleHandler) DeleteModule(c *gin.Context) {
	moduleID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid module ID"})
		return
	}

	if err := database.GetDB().Delete(&models.Module{}, moduleID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete module"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Module deleted successfully"})
}
