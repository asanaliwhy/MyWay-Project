package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL  string
	JWTSecret    string
	Port         string
	GeminiAPIKey string
	GinMode      string
}

func LoadConfig() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://postgres:password@localhost:5432/myway?sslmode=disable"),
		JWTSecret:    getEnv("JWT_SECRET", "default-secret-change-in-production"),
		Port:         getEnv("PORT", "3000"),
		GeminiAPIKey: getEnv("GEMINI_API_KEY", ""),
		GinMode:      getEnv("GIN_MODE", "debug"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
