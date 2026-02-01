package handlers

import (
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OrganizationHandler struct{}

func NewOrganizationHandler() *OrganizationHandler {
	return &OrganizationHandler{}
}

type CreateOrganizationRequest struct {
	Name string `json:"name" binding:"required"`
}

func (h *OrganizationHandler) CreateOrganization(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req CreateOrganizationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	org := models.Organization{
		Name: req.Name,
		Plan: "Free",
	}

	if err := database.GetDB().Create(&org).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
		return
	}

	// Add creator as ORGANIZER member
	membership := models.OrgMembership{
		OrgID:  org.ID,
		UserID: userID,
		Role:   "ORGANIZER",
		Status: "Active",
	}

	if err := database.GetDB().Create(&membership).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create membership"})
		return
	}

	c.JSON(http.StatusCreated, org)
}

func (h *OrganizationHandler) GetOrganizations(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)

	// Get user's organizations through memberships
	var memberships []models.OrgMembership
	if err := database.GetDB().
		Preload("Organization").
		Where("user_id = ?", userID).
		Find(&memberships).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch organizations"})
		return
	}

	orgs := make([]gin.H, len(memberships))
	for i, m := range memberships {
		orgs[i] = gin.H{
			"id":   m.Organization.ID,
			"name": m.Organization.Name,
			"plan": m.Organization.Plan,
			"role": m.Role,
		}
	}

	c.JSON(http.StatusOK, orgs)
}

func (h *OrganizationHandler) SwitchOrganization(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	orgID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	// Verify membership
	var membership models.OrgMembership
	if err := database.GetDB().
		Preload("Organization").
		Where("user_id = ? AND org_id = ? AND status = ?", userID, orgID, "Active").
		First(&membership).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a member of this organization"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"organization": gin.H{
			"id":   membership.Organization.ID,
			"name": membership.Organization.Name,
			"plan": membership.Organization.Plan,
		},
		"role": membership.Role,
	})
}
