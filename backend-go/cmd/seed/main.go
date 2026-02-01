package main

import (
	"log"
	"myway-backend/internal/config"
	"myway-backend/internal/database"
	"myway-backend/internal/models"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to database
	if err := database.Connect(cfg.DatabaseURL); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations
	if err := database.AutoMigrate(); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	log.Println("Starting seed data generation...")

	// Create users
	studentPassword, _ := bcrypt.GenerateFromPassword([]byte("student123"), bcrypt.DefaultCost)
	teacherPassword, _ := bcrypt.GenerateFromPassword([]byte("teacher123"), bcrypt.DefaultCost)
	organizerPassword, _ := bcrypt.GenerateFromPassword([]byte("organizer123"), bcrypt.DefaultCost)

	student := models.User{
		Email:        "student@example.com",
		PasswordHash: string(studentPassword),
		Name:         "John Student",
	}
	database.GetDB().FirstOrCreate(&student, models.User{Email: "student@example.com"})

	teacher := models.User{
		Email:        "teacher@example.com",
		PasswordHash: string(teacherPassword),
		Name:         "Jane Teacher",
	}
	database.GetDB().FirstOrCreate(&teacher, models.User{Email: "teacher@example.com"})

	organizer := models.User{
		Email:        "organizer@example.com",
		PasswordHash: string(organizerPassword),
		Name:         "Admin Organizer",
	}
	database.GetDB().FirstOrCreate(&organizer, models.User{Email: "organizer@example.com"})

	log.Printf("Created users: student, teacher, organizer")

	// Create organization
	org := models.Organization{
		Name: "Demo University",
		Plan: "Free",
	}
	database.GetDB().FirstOrCreate(&org, models.Organization{Name: "Demo University"})

	log.Printf("Created organization: %s", org.Name)

	// Create memberships
	memberships := []models.OrgMembership{
		{OrgID: org.ID, UserID: student.ID, Role: "STUDENT", Status: "Active"},
		{OrgID: org.ID, UserID: teacher.ID, Role: "TEACHER", Status: "Active"},
		{OrgID: org.ID, UserID: organizer.ID, Role: "ORGANIZER", Status: "Active"},
	}

	for _, membership := range memberships {
		var existing models.OrgMembership
		if err := database.GetDB().Where("org_id = ? AND user_id = ?", membership.OrgID, membership.UserID).First(&existing).Error; err != nil {
			database.GetDB().Create(&membership)
		}
	}

	log.Printf("Created organization memberships")

	// Create course
	course := models.Course{
		OrgID:       org.ID,
		Code:        "CS101",
		Title:       "Introduction to Computer Science",
		Description: "A comprehensive introduction to computer science fundamentals",
		CreatedBy:   teacher.ID,
	}
	database.GetDB().FirstOrCreate(&course, models.Course{Code: "CS101", OrgID: org.ID})

	log.Printf("Created course: %s", course.Title)

	// Create enrollment
	enrollment := models.Enrollment{
		CourseID: course.ID,
		UserID:   student.ID,
		Role:     "STUDENT",
	}
	var existingEnrollment models.Enrollment
	if err := database.GetDB().Where("course_id = ? AND user_id = ?", course.ID, student.ID).First(&existingEnrollment).Error; err != nil {
		database.GetDB().Create(&enrollment)
	}

	log.Printf("Created enrollment")

	// Create modules
	modules := []models.Module{
		{CourseID: course.ID, Title: "Module 1: Basics", Order: 1},
		{CourseID: course.ID, Title: "Module 2: Advanced", Order: 2},
		{CourseID: course.ID, Title: "Resources", Order: 999},
	}

	for _, module := range modules {
		var existing models.Module
		if err := database.GetDB().Where("course_id = ? AND title = ?", course.ID, module.Title).First(&existing).Error; err != nil {
			database.GetDB().Create(&module)
			log.Printf("Created module: %s", module.Title)
		}
	}

	// Create material
	var resourcesModule models.Module
	database.GetDB().Where("course_id = ? AND title = ?", course.ID, "Resources").First(&resourcesModule)

	material := models.Material{
		ModuleID:  resourcesModule.ID,
		Type:      "VIDEO",
		Title:     "Sample Video Material",
		SourceURL: strPtr("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
	}
	var existingMaterial models.Material
	if err := database.GetDB().Where("module_id = ? AND title = ?", resourcesModule.ID, material.Title).First(&existingMaterial).Error; err != nil {
		database.GetDB().Create(&material)
		log.Printf("Created material: %s", material.Title)
	} else {
		material = existingMaterial
	}

	// Create study pack
	studyPack := models.StudyPack{
		MaterialID:       material.ID,
		CreatedBy:        teacher.ID.String(),
		Status:           "READY",
		RequiresApproval: false,
		PublishedAt:     timePtr(time.Now()),
	}
	var existingStudyPack models.StudyPack
	if err := database.GetDB().Where("material_id = ?", material.ID).First(&existingStudyPack).Error; err != nil {
		database.GetDB().Create(&studyPack)
		log.Printf("Created study pack")

		// Create summary
		summaryContent := `{"summary":"This is a sample summary of the material.","bullets":["Key Concept 1","Key Concept 2","Key Concept 3"]}`
		summary := models.Summary{
			StudyPackID: studyPack.ID,
			Content:     summaryContent,
		}
		database.GetDB().Create(&summary)

		// Create quiz
		quiz := models.Quiz{
			StudyPackID: studyPack.ID,
			Version:     1,
			Metadata:    `{"difficulty":"Beginner"}`,
		}
		database.GetDB().Create(&quiz)

		// Create quiz questions
		questions := []models.QuizQuestion{
			{
				QuizID:      quiz.ID,
				Type:        "MCQ",
				Prompt:      "What is the primary purpose of this course?",
				Options:     `["To confuse students","To teach computer science","To waste time","None of the above"]`,
				AnswerKey:   `"To teach computer science"`,
				Explanation: strPtr("The course aims to provide a solid foundation in computer science."),
			},
			{
				QuizID:      quiz.ID,
				Type:        "MCQ",
				Prompt:      "Which of the following is a programming language?",
				Options:     `["HTML","CSS","Python","All of the above"]`,
				AnswerKey:   `"Python"`,
				Explanation: strPtr("Python is a programming language, while HTML and CSS are markup and styling languages."),
			},
		}

		for _, q := range questions {
			database.GetDB().Create(&q)
		}

		// Create flashcards
		flashcards := []models.Flashcard{
			{
				StudyPackID: studyPack.ID,
				Front:       "What is an algorithm?",
				Back:        "A step-by-step procedure for solving a problem.",
			},
			{
				StudyPackID: studyPack.ID,
				Front:       "What is a variable?",
				Back:        "A storage location with a name that holds a value.",
			},
		}

		for _, fc := range flashcards {
			database.GetDB().Create(&fc)
		}

		log.Printf("Created study pack content (summary, quiz, flashcards)")
	}

	// Create assignment
	assignment := models.Assignment{
		CourseID:     course.ID,
		Title:        "First Assignment",
		DueAt:        time.Now().AddDate(0, 0, 7),
		Points:       100,
		Instructions: "Complete the following tasks and submit your work.",
		Status:       "ACTIVE",
	}
	var existingAssignment models.Assignment
	if err := database.GetDB().Where("course_id = ? AND title = ?", course.ID, assignment.Title).First(&existingAssignment).Error; err != nil {
		database.GetDB().Create(&assignment)
		log.Printf("Created assignment: %s", assignment.Title)
	}

	log.Println("Seed data generation completed successfully!")
	log.Println("\nDemo credentials:")
	log.Println("Student: student@example.com / student123")
	log.Println("Teacher: teacher@example.com / teacher123")
	log.Println("Organizer: organizer@example.com / organizer123")
}

func strPtr(s string) *string {
	return &s
}

func timePtr(t time.Time) *time.Time {
	return &t
}
