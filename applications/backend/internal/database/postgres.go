package database

import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
)

var PostgresDB *gorm.DB

// InitPostgres initializes PostgreSQL connection
func InitPostgres() error {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Kolkata",
		getEnv("POSTGRES_HOST", "localhost"),
		getEnv("POSTGRES_USER", "postgres"),
		getEnv("POSTGRES_PASSWORD", "postgres"),
		getEnv("POSTGRES_DB", "clouddeck"),
		getEnv("POSTGRES_PORT", "5432"),
	)

	var err error
	PostgresDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})

	if err != nil {
		return fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	// Configure connection pool
	sqlDB, err := PostgresDB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Auto migrate models
	if err := PostgresDB.AutoMigrate(
	&models.Item{}, 
	&models.Project{}, 
	&models.Task{},
	&models.Container{},
); err != nil {
	return fmt.Errorf("failed to migrate database: %w", err)
}
	log.Println("✅ PostgreSQL connected successfully")
	return nil
}

// ClosePostgres closes PostgreSQL connection
func ClosePostgres() {
	sqlDB, err := PostgresDB.DB()
	if err != nil {
		log.Printf("Error getting database instance: %v", err)
		return
	}
	if err := sqlDB.Close(); err != nil {
		log.Printf("Error closing PostgreSQL connection: %v", err)
		return
	}
	log.Println("PostgreSQL connection closed")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
