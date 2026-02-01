package database

import (
	"fmt"
	"log"
	"myway-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(databaseURL string) error {
	var err error
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connection established")
	return nil
}

func AutoMigrate() error {
	// Enable UUID extension
	DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

	err := DB.AutoMigrate(
		&models.User{},
		&models.RefreshToken{},
		&models.Organization{},
		&models.OrgMembership{},
		&models.Course{},
		&models.Enrollment{},
		&models.Module{},
		&models.Material{},
		&models.StudyPack{},
		&models.Summary{},
		&models.Quiz{},
		&models.QuizQuestion{},
		&models.Flashcard{},
		&models.QuizAttempt{},
		&models.FlashcardSession{},
		&models.ProgressEvent{},
		&models.Assignment{},
		&models.Submission{},
		&models.Thread{},
		&models.Reply{},
		&models.DailyOrgMetric{},
		&models.CourseMetric{},
	)
	if err != nil {
		return fmt.Errorf("failed to auto-migrate: %w", err)
	}

	log.Println("Database migration completed")
	return nil
}

func GetDB() *gorm.DB {
	return DB
}
