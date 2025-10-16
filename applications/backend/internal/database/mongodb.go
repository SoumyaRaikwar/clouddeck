package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client
var MongoDB *mongo.Database

// InitMongo initializes MongoDB connection
func InitMongoDB() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	mongoURI := getMongoEnv("MONGODB_URI", "mongodb://localhost:27017")

	clientOptions := options.Client().ApplyURI(mongoURI)

	clientOptions.SetMaxPoolSize(100)
	clientOptions.SetMinPoolSize(10)
	
	var err error 
	MongoClient, err = mongo.Connect(ctx, clientOptions)
	if err != nil {
		return fmt.Errorf("failed to connect to MongoDB: %w", err)
	}
	
	// Ping the database to verify connection
	if err := MongoClient.Ping(ctx, nil); err != nil {
		return fmt.Errorf("failed to ping MongoDB: %w", err)
	}
	dbName := getMongoEnv("MONGODB_DATABASE", "clouddeck")
	MongoDB = MongoClient.Database(dbName)
	
	log.Println("MongoDB connected successfully")
	return nil
}

//closeMogoDB connecrion 
func CloseMongoDB() {
	if MongoClient != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := MongoClient.Disconnect(ctx); err != nil {
			log.Printf("Error disconnecting MongoDB: %v", err)
		return
		}
		log.Println("MongoDB connection closed")
	}
}

func getMongoEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}