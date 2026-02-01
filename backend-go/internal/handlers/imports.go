package handlers

import (
	"encoding/json"
	"encoding/xml"
	"io"
	"log"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/kkdai/youtube/v2"
)

type ImportsHandler struct{}

func NewImportsHandler() *ImportsHandler {
	return &ImportsHandler{}
}

type ImportYouTubeRequest struct {
	CourseID   string  `json:"courseId" binding:"required"`
	ModuleID   *string `json:"moduleId"`
	YouTubeURL string  `json:"youtubeUrl" binding:"required"`
	Transcript *string `json:"transcript"`
}

func (h *ImportsHandler) ImportYouTube(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req ImportYouTubeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID, err := uuid.Parse(req.CourseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	// Resolve module ID
	var moduleID uuid.UUID
	if req.ModuleID != nil {
		moduleID, err = uuid.Parse(*req.ModuleID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid module ID"})
			return
		}
	} else {
		// Find or create Resources module
		var module models.Module
		result := database.GetDB().Where("course_id = ? AND title = ?", courseID, "Resources").First(&module)
		if result.Error != nil {
			// Create Resources module
			module = models.Module{
				CourseID: courseID,
				Title:    "Resources",
				Order:    999,
			}
			database.GetDB().Create(&module)
		}
		moduleID = module.ID
	}

	// Validate YouTube URL
	if !isValidYouTubeURL(req.YouTubeURL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid YouTube URL"})
		return
	}

	// Create material with QUEUED status
	material := models.Material{
		ModuleID:       moduleID,
		Type:           "VIDEO",
		Title:          "YouTube Import",
		SourceURL:      &req.YouTubeURL,
		TranscriptText: req.Transcript,
	}

	if err := database.GetDB().Create(&material).Error; err != nil {
		log.Printf("Error creating material: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create material"})
		return
	}

	// Create study pack with initial status
	status := "QUEUED"
	if req.Transcript != nil && *req.Transcript != "" {
		status = "PROCESSING"
	}

	studyPack := models.StudyPack{
		MaterialID:       material.ID,
		CreatedBy:        userID.String(),
		Status:           status,
		RequiresApproval: false,
	}

	if err := database.GetDB().Create(&studyPack).Error; err != nil {
		log.Printf("Error creating study pack: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create study pack"})
		return
	}

	log.Printf("Created material %s with study pack %s, status: %s", material.ID, studyPack.ID, status)

	// If transcript provided, process immediately
	if req.Transcript != nil && *req.Transcript != "" {
		go h.processStudyPack(studyPack.ID, *req.Transcript)
	} else {
		// In a real implementation, this would queue a job to fetch transcript
		log.Printf("Material %s queued for transcript extraction", material.ID)
	}

	c.JSON(http.StatusCreated, gin.H{
		"material": material,
		"studyPack": gin.H{
			"id":     studyPack.ID,
			"status": studyPack.Status,
		},
	})
}

func isValidYouTubeURL(url string) bool {
	return len(url) > 0 && (url[:16] == "https://youtu.be" || url[:23] == "https://www.youtube.com" || url[:17] == "https://youtube.com")
}

func (h *ImportsHandler) GetImportStatus(c *gin.Context) {
	materialID, err := uuid.Parse(c.Param("materialId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid material ID"})
		return
	}

	var studyPack models.StudyPack
	if err := database.GetDB().
		Where("material_id = ?", materialID).
		Order("created_at DESC").
		First(&studyPack).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Study pack not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":      studyPack.Status,
		"studyPackId": studyPack.ID,
		"createdAt":   studyPack.CreatedAt,
		"publishedAt": studyPack.PublishedAt,
	})
}

type ImportDocumentRequest struct {
	CourseID string  `json:"courseId" binding:"required"`
	ModuleID *string `json:"moduleId"`
	FileURL  string  `json:"fileUrl" binding:"required"`
	Title    string  `json:"title" binding:"required"`
}

func (h *ImportsHandler) ImportDocument(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req ImportDocumentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	courseID, err := uuid.Parse(req.CourseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	// Resolve module ID
	var moduleID uuid.UUID
	if req.ModuleID != nil {
		moduleID, err = uuid.Parse(*req.ModuleID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid module ID"})
			return
		}
	} else {
		// Find or create Resources module
		var module models.Module
		result := database.GetDB().Where("course_id = ? AND title = ?", courseID, "Resources").First(&module)
		if result.Error != nil {
			module = models.Module{
				CourseID: courseID,
				Title:    "Resources",
				Order:    999,
			}
			database.GetDB().Create(&module)
		}
		moduleID = module.ID
	}

	// Determine file type
	fileType := "DOC"
	if len(req.FileURL) > 4 {
		ext := req.FileURL[len(req.FileURL)-4:]
		if ext == ".pdf" || ext == ".PDF" {
			fileType = "PDF"
		}
	}

	// Create material
	material := models.Material{
		ModuleID: moduleID,
		Type:     fileType,
		Title:    req.Title,
		FileURL:  &req.FileURL,
	}

	if err := database.GetDB().Create(&material).Error; err != nil {
		log.Printf("Error creating material: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create material"})
		return
	}

	// Create study pack with PROCESSING status
	studyPack := models.StudyPack{
		MaterialID:       material.ID,
		CreatedBy:        userID.String(),
		Status:           "PROCESSING",
		RequiresApproval: false,
	}

	if err := database.GetDB().Create(&studyPack).Error; err != nil {
		log.Printf("Error creating study pack: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create study pack"})
		return
	}

	log.Printf("Created document material %s with study pack %s", material.ID, studyPack.ID)

	// Process document (in real implementation, this would extract text from PDF/DOCX)
	go h.processDocumentStudyPack(studyPack.ID, req.FileURL)

	c.JSON(http.StatusCreated, gin.H{
		"material": material,
		"studyPack": gin.H{
			"id":     studyPack.ID,
			"status": studyPack.Status,
		},
	})
}

func (h *ImportsHandler) processStudyPack(studyPackID uuid.UUID, transcript string) {
	log.Printf("Processing study pack %s", studyPackID)

	// Update status to PROCESSING
	database.GetDB().Model(&models.StudyPack{}).Where("id = ?", studyPackID).Update("status", "PROCESSING")

	// Simulate processing delay
	time.Sleep(2 * time.Second)

	// Generate study content
	h.generateMockStudyContent(studyPackID)

	log.Printf("Study pack %s processed successfully", studyPackID)
}

func (h *ImportsHandler) processDocumentStudyPack(studyPackID uuid.UUID, fileURL string) {
	log.Printf("Processing document study pack %s from %s", studyPackID, fileURL)

	// In a real implementation, this would:
	// 1. Download the file
	// 2. Extract text (using a library like go-pdf, docx, etc.)
	// 3. Generate study content from extracted text

	// For MVP, simulate with mock content
	time.Sleep(2 * time.Second)
	h.generateMockStudyContent(studyPackID)

	log.Printf("Document study pack %s processed successfully", studyPackID)
}

func (h *ImportsHandler) generateMockStudyContent(studyPackID uuid.UUID) {
	// Create mock summary
	summaryContent := map[string]interface{}{
		"summary": "This is a generated summary of the material.",
		"bullets": []string{
			"Key Concept 1: Foundation",
			"Key Concept 2: Implementation",
			"Key Concept 3: Verification",
		},
	}
	summaryJSON, _ := json.Marshal(summaryContent)

	summary := models.Summary{
		StudyPackID: studyPackID,
		Content:     string(summaryJSON),
	}
	database.GetDB().Create(&summary)

	// Create mock quiz
	quiz := models.Quiz{
		StudyPackID: studyPackID,
		Version:     1,
		Metadata:    `{"difficulty":"Adaptive"}`,
	}
	database.GetDB().Create(&quiz)

	// Add quiz questions
	question := models.QuizQuestion{
		QuizID:      quiz.ID,
		Type:        "MCQ",
		Prompt:      "What is the primary purpose of this topic?",
		Options:     `["To confuse students","To solve a specific problem","To waste time","None of the above"]`,
		AnswerKey:   `"To solve a specific problem"`,
		Explanation: strPtr("Every educational topic aims to solve problems."),
	}
	database.GetDB().Create(&question)

	// Create flashcards
	flashcard1 := models.Flashcard{
		StudyPackID: studyPackID,
		Front:       "Define 'Abstraction'",
		Back:        "Hiding complex reality while exposing only necessary parts.",
	}
	database.GetDB().Create(&flashcard1)

	// Update study pack status to READY
	now := time.Now()
	database.GetDB().Model(&models.StudyPack{}).Where("id = ?", studyPackID).Updates(map[string]interface{}{
		"status":       "READY",
		"published_at": &now,
	})

	log.Printf("Study pack %s marked as READY", studyPackID)
}

func strPtr(s string) *string {
	return &s
}

// GetYouTubeTranscript fetches the transcript/captions from a YouTube video
func (h *ImportsHandler) GetYouTubeTranscript(c *gin.Context) {
	videoURL := c.Query("url")
	if videoURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing 'url' query parameter"})
		return
	}

	log.Printf("Fetching YouTube transcript for: %s", videoURL)

	// Extract video ID from URL
	videoID := extractVideoID(videoURL)
	if videoID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid YouTube URL - could not extract video ID"})
		return
	}

	log.Printf("Extracted video ID: %s", videoID)

	// Create YouTube client
	client := youtube.Client{}

	// Get video details
	video, err := client.GetVideo(videoID)
	if err != nil {
		log.Printf("Error fetching video: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to fetch video details",
			"details": err.Error(),
		})
		return
	}

	log.Printf("Video title: %s", video.Title)

	// Get captions/transcripts
	if len(video.CaptionTracks) == 0 {
		log.Printf("No captions available for video %s", videoID)
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "No captions available for this video",
			"message": "This video does not have captions/subtitles enabled. Please provide the transcript manually or choose a different video.",
		})
		return
	}

	// Get the first available caption track (prefer English)
	var selectedTrack *youtube.CaptionTrack
	for i := range video.CaptionTracks {
		track := &video.CaptionTracks[i]
		if track.LanguageCode == "en" || track.LanguageCode == "en-US" {
			selectedTrack = track
			break
		}
	}

	// If no English track, use the first available
	if selectedTrack == nil {
		selectedTrack = &video.CaptionTracks[0]
	}

	log.Printf("Using caption track: %s (%s)", selectedTrack.LanguageCode, selectedTrack.Name)

	// Fetch the transcript
	var transcriptText string

	// Try using the library first
	transcript, err := client.GetTranscript(video, selectedTrack.LanguageCode)
	if err == nil {
		// Combine all transcript segments into a single text
		for _, segment := range transcript {
			transcriptText += segment.Text + " "
		}
	} else {
		log.Printf("Library fetch failed: %v. Trying manual fetch...", err)
		log.Printf("Selected track: %s, BaseURL: %s", selectedTrack.LanguageCode, selectedTrack.BaseURL)

		// Fallback: Manually fetch the transcript URL
		if selectedTrack.BaseURL == "" {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to fetch transcript and no BaseURL available",
				"details": err.Error(),
			})
			return
		}

		resp, err := http.Get(selectedTrack.BaseURL)
		if err != nil {
			log.Printf("Manual fetch failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to manually fetch transcript",
				"details": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			log.Printf("Manual fetch returned status %d: %s", resp.StatusCode, string(body))
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":  "Manual fetch returned error status",
				"status": resp.StatusCode,
			})
			return
		}

		// Parse XML - Generic Token Parser
		// This handles any XML structure (transcript/text, timedtext/body/p, etc)
		// It simply extracts all character data from the XML
		
		// Create a decoder for the response body
		decoder := xml.NewDecoder(resp.Body)
		for {
			t, err := decoder.Token()
			if err == io.EOF {
				break
			}
			if err != nil {
				log.Printf("XML decode error: %v", err)
				break 
			}
			
			// For every CharData token (text content), append it
			switch se := t.(type) {
			case xml.CharData:
				text := string(se)
				// Clean parsing artifacts
				text = strings.TrimSpace(text)
				if len(text) > 0 {
					transcriptText += text + " "
				}
			}
		}
		
		log.Printf("Manual fetch successful! Extracted chars: %d", len(transcriptText))
	}

	log.Printf("✅ Successfully fetched transcript (%d characters)", len(transcriptText))

	c.JSON(http.StatusOK, gin.H{
		"videoId":    videoID,
		"title":      video.Title,
		"transcript": transcriptText,
		"language":   selectedTrack.LanguageCode,
		"duration":   video.Duration.Seconds(),
	})
}

// extractVideoID extracts the video ID from various YouTube URL formats
func extractVideoID(url string) string {
	// Match patterns:
	// - https://www.youtube.com/watch?v=VIDEO_ID
	// - https://youtu.be/VIDEO_ID
	// - https://youtube.com/watch?v=VIDEO_ID

	patterns := []string{
		`(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})`,
		`youtube\.com/embed/([a-zA-Z0-9_-]{11})`,
	}

	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(url)
		if len(matches) > 1 {
			return matches[1]
		}
	}

	// If no pattern matched, check if the input is already a video ID
	if len(url) == 11 && regexp.MustCompile(`^[a-zA-Z0-9_-]{11}$`).MatchString(url) {
		return url
	}

	return ""
}
