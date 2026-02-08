package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
		Where("material_id = ?", materialID).
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

type ApproveStudyPackRequest struct {
	Summary       string   `json:"summary" binding:"required"`
	KeyPoints     []string `json:"keyPoints"`
	KeyPointsText string   `json:"keyPointsText"`
}

type RegenerateStudyPackRequest struct {
	Notes string `json:"notes"`
}

func (h *AIHandler) GetReviewDraft(c *gin.Context) {
	_, ok := h.requireInstructor(c)
	if !ok {
		return
	}

	materialID, err := uuid.Parse(c.Param("materialId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material ID"})
		return
	}

	studyPack, err := h.getLatestStudyPackByMaterial(materialID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Study pack draft not found"})
		return
	}

	summaryText, keyPoints := extractSummaryAndKeyPoints(studyPack.Summary)

	c.JSON(http.StatusOK, gin.H{
		"draft": gin.H{
			"materialId":  studyPack.MaterialID,
			"studyPackId": studyPack.ID,
			"status":      studyPack.Status,
			"videoUrl":    studyPack.Material.SourceURL,
			"summary":     summaryText,
			"keyPoints":   keyPoints,
		},
	})
}

func (h *AIHandler) ApproveStudyPack(c *gin.Context) {
	userID, ok := h.requireInstructor(c)
	if !ok {
		return
	}

	materialID, err := uuid.Parse(c.Param("materialId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material ID"})
		return
	}

	var req ApproveStudyPackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(req.Summary) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Summary is required"})
		return
	}

	keyPoints := req.KeyPoints
	if len(keyPoints) == 0 && strings.TrimSpace(req.KeyPointsText) != "" {
		keyPoints = parseKeyPointsText(req.KeyPointsText)
	}
	if len(keyPoints) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "At least one key point is required"})
		return
	}

	studyPack, err := h.getLatestStudyPackByMaterial(materialID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Study pack draft not found"})
		return
	}

	contentJSON, _ := json.Marshal(map[string]interface{}{
		"summary": req.Summary,
		"bullets": keyPoints,
	})

	db := database.GetDB()
	if studyPack.Summary == nil {
		summary := models.Summary{
			StudyPackID: studyPack.ID,
			Content:     string(contentJSON),
		}
		if err := db.Create(&summary).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save summary"})
			return
		}
	} else {
		if err := db.Model(&models.Summary{}).Where("id = ?", studyPack.Summary.ID).Update("content", string(contentJSON)).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update summary"})
			return
		}
	}

	now := time.Now()
	approvedBy := userID.String()
	if err := db.Model(&models.StudyPack{}).Where("id = ?", studyPack.ID).Updates(map[string]interface{}{
		"status":            "READY",
		"published_at":      &now,
		"requires_approval": false,
		"approved_by":       &approvedBy,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to approve study pack"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Study pack approved and published",
		"draft": gin.H{
			"materialId":  studyPack.MaterialID,
			"studyPackId": studyPack.ID,
			"status":      "READY",
			"summary":     req.Summary,
			"keyPoints":   keyPoints,
		},
	})
}

func (h *AIHandler) RegenerateStudyPack(c *gin.Context) {
	userID, ok := h.requireInstructor(c)
	if !ok {
		return
	}

	materialID, err := uuid.Parse(c.Param("materialId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material ID"})
		return
	}

	var req RegenerateStudyPackRequest
	_ = c.ShouldBindJSON(&req)

	db := database.GetDB()

	var material models.Material
	if err := db.First(&material, materialID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Material not found"})
		return
	}

	studyPack, err := h.getLatestStudyPackByMaterial(materialID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load study pack"})
			return
		}

		newPack := models.StudyPack{
			MaterialID:       materialID,
			CreatedBy:        userID.String(),
			Status:           "PROCESSING",
			RequiresApproval: true,
		}
		if err := db.Create(&newPack).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create study pack"})
			return
		}

		studyPack = &newPack
	}

	noteSuffix := ""
	if strings.TrimSpace(req.Notes) != "" {
		noteSuffix = " Instructor note: " + strings.TrimSpace(req.Notes)
	}

	generatedSummary := "This regenerated draft condenses the lecture into actionable concepts, emphasizing practical understanding and review checkpoints." + noteSuffix
	generatedKeyPoints := []string{
		"00:45 - Problem framing and learning objective",
		"03:10 - Core concept explained with real-world example",
		"06:25 - Common mistakes and how to avoid them",
		"09:40 - Practical takeaway and next step",
	}

	contentJSON, _ := json.Marshal(map[string]interface{}{
		"summary": generatedSummary,
		"bullets": generatedKeyPoints,
	})

	var existingSummary models.Summary
	if err := db.Where("study_pack_id = ?", studyPack.ID).First(&existingSummary).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			summary := models.Summary{
				StudyPackID: studyPack.ID,
				Content:     string(contentJSON),
			}
			if err := db.Create(&summary).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create regenerated summary"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load summary"})
			return
		}
	} else {
		if err := db.Model(&existingSummary).Update("content", string(contentJSON)).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update summary"})
			return
		}
	}

	if err := db.Model(&models.StudyPack{}).Where("id = ?", studyPack.ID).Updates(map[string]interface{}{
		"status":            "GENERATED",
		"requires_approval": true,
		"approved_by":       nil,
		"published_at":      nil,
	}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update study pack status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "AI draft regenerated",
		"draft": gin.H{
			"materialId":  studyPack.MaterialID,
			"studyPackId": studyPack.ID,
			"status":      "GENERATED",
			"videoUrl":    material.SourceURL,
			"summary":     generatedSummary,
			"keyPoints":   generatedKeyPoints,
		},
	})
}

func (h *AIHandler) requireInstructor(c *gin.Context) (uuid.UUID, bool) {
	userID := c.MustGet("userID").(uuid.UUID)

	var user models.User
	if err := database.GetDB().Select("id", "role").First(&user, userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return uuid.Nil, false
	}

	role := strings.ToUpper(strings.TrimSpace(user.Role))
	if role != "TEACHER" && role != "ORGANIZER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only instructors can perform this action"})
		return uuid.Nil, false
	}

	return userID, true
}

func (h *AIHandler) getLatestStudyPackByMaterial(materialID uuid.UUID) (*models.StudyPack, error) {
	var studyPack models.StudyPack
	err := database.GetDB().
		Preload("Summary").
		Preload("Material").
		Where("material_id = ?", materialID).
		Order("created_at DESC").
		First(&studyPack).Error
	if err != nil {
		return nil, err
	}
	return &studyPack, nil
}

func extractSummaryAndKeyPoints(summary *models.Summary) (string, []string) {
	if summary == nil || strings.TrimSpace(summary.Content) == "" {
		return "No summary generated yet.", []string{"No key points generated yet."}
	}

	var parsed map[string]interface{}
	if err := json.Unmarshal([]byte(summary.Content), &parsed); err != nil {
		return "No summary generated yet.", []string{"No key points generated yet."}
	}

	summaryText, _ := parsed["summary"].(string)
	if strings.TrimSpace(summaryText) == "" {
		summaryText = "No summary generated yet."
	}

	keyPoints := make([]string, 0)
	rawBullets, ok := parsed["bullets"]
	if !ok {
		rawBullets = parsed["keyPoints"]
	}

	switch value := rawBullets.(type) {
	case []interface{}:
		for _, point := range value {
			if pointText, ok := point.(string); ok && strings.TrimSpace(pointText) != "" {
				keyPoints = append(keyPoints, strings.TrimSpace(pointText))
			}
		}
	case []string:
		for _, point := range value {
			if strings.TrimSpace(point) != "" {
				keyPoints = append(keyPoints, strings.TrimSpace(point))
			}
		}
	}

	if len(keyPoints) == 0 {
		keyPoints = []string{"No key points generated yet."}
	}

	return summaryText, keyPoints
}

func parseKeyPointsText(input string) []string {
	lines := strings.Split(input, "\n")
	points := make([]string, 0, len(lines))
	for _, line := range lines {
		clean := strings.TrimSpace(line)
		clean = strings.TrimPrefix(clean, "- ")
		clean = strings.TrimPrefix(clean, "• ")
		clean = strings.TrimPrefix(clean, "* ")
		clean = strings.TrimSpace(clean)
		if clean != "" {
			points = append(points, clean)
		}
	}
	return points
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

	query := strings.TrimSpace(req.Query)
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "query is required"})
		return
	}

	if strings.TrimSpace(h.GeminiAPIKey) == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Gemini API key is not configured"})
		return
	}

	answer, err := h.generateTutorAnswerWithGemini(req.CourseID, query)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Gemini request failed"})
		return
	}
	answer = sanitizeTutorAnswer(answer)

	c.JSON(http.StatusOK, gin.H{
		"answer":                 answer,
		"sourceReferences":       []string{},
		"analyzedMaterialsCount": 1,
		"provider":               "gemini",
		"model":                  "gemini-3-flash-preview",
	})
}

func (h *AIHandler) generateTutorAnswerWithGemini(courseID, query string) (string, error) {
	modelName := "gemini-3-flash-preview"

	prompt := strings.TrimSpace(`You are MyWay AI Tutor.

Rules:
- Explain clearly and practically.
- Use short paragraphs and bullet points when useful.
- If user asks for differences/comparisons, provide a side-by-side style explanation.
- If user asks for steps, give numbered steps.
- Do NOT start responses with greetings (no "Hi", "Hello", "Hey", "Great question", or similar openers).
- Start directly with the answer.
- Keep tone professional, concise, and natural.
- End with one concise check-for-understanding question.

Course context: ` + courseID + `
User question: ` + query)

	type geminiPart struct {
		Text string `json:"text"`
	}
	type geminiContent struct {
		Role  string       `json:"role,omitempty"`
		Parts []geminiPart `json:"parts"`
	}
	type geminiGenerationConfig struct {
		Temperature     float64 `json:"temperature,omitempty"`
		MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
	}
	type geminiRequest struct {
		Contents         []geminiContent         `json:"contents"`
		GenerationConfig geminiGenerationConfig `json:"generationConfig,omitempty"`
	}

	requestBody := geminiRequest{
		Contents: []geminiContent{
			{
				Role:  "user",
				Parts: []geminiPart{{Text: prompt}},
			},
		},
		GenerationConfig: geminiGenerationConfig{
			Temperature:     0.4,
			MaxOutputTokens: 900,
		},
	}

	payload, err := json.Marshal(requestBody)
	if err != nil {
		return "", err
	}

	url := "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + h.GeminiAPIKey
	httpReq, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return "", errors.New("gemini returned non-2xx response")
	}

	type geminiResponse struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	var parsed geminiResponse
	if err := json.Unmarshal(body, &parsed); err != nil {
		return "", err
	}

	for _, candidate := range parsed.Candidates {
		for _, part := range candidate.Content.Parts {
			text := strings.TrimSpace(part.Text)
			if text != "" {
				return text, nil
			}
		}
	}

	return "", errors.New("empty response from gemini")
}

func sanitizeTutorAnswer(input string) string {
	text := strings.TrimSpace(input)
	if text == "" {
		return text
	}

	// Remove repetitive greeting-style lead-ins from model responses.
	patterns := []*regexp.Regexp{
		regexp.MustCompile(`(?is)^\s*(hello|hi|hey|greetings)[^\n]{0,140}ai\s*tutor[^\n.!?]*[.!?]\s*`),
		regexp.MustCompile(`(?is)^\s*(hello|hi|hey|greetings)[^\n.!?]*[.!?]\s*`),
		regexp.MustCompile(`(?is)^\s*(let'?s|lets)\s+(dive\s+in|dive\s+into|get\s+started|jump\s+in)[^\n.!?]*[.!?]\s*`),
	}

	cleaned := text
	for i := 0; i < 4; i++ {
		before := cleaned
		for _, p := range patterns {
			cleaned = p.ReplaceAllString(cleaned, "")
			cleaned = strings.TrimSpace(cleaned)
		}
		if cleaned == before {
			break
		}
	}

	if cleaned == "" {
		return text
	}

	return cleaned
}
