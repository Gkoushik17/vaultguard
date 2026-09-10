package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"
	"vaultguard/core-go/internal/handlers"
	"vaultguard/core-go/internal/ledger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	redisHost := os.Getenv("REDIS_HOST")
	if redisHost == "" {
		redisHost = "localhost"
	}
	redisPort := os.Getenv("REDIS_PORT")
	if redisPort == "" {
		redisPort = "6379"
	}

	// Connect Redis client
	rdb := redis.NewClient(&redis.Options{
		Addr:        fmt.Sprintf("%s:%s", redisHost, redisPort),
		DialTimeout: 2 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("[WARN] Redis not reachable on %s:%s: %v (running in standalone fallback)", redisHost, redisPort, err)
		rdb = nil
	} else {
		log.Printf("[INFO] Connected to Redis on %s:%s", redisHost, redisPort)
	}

	// Initialize Ledger and Handlers
	store := ledger.NewLedgerStore()
	paymentHandler := handlers.NewPaymentHandler(store, rdb)

	router := gin.Default()

	// CORS config for React Web and React Native
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Idempotency-Key", "Authorization"}
	router.Use(cors.New(config))

	// Health endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "healthy",
			"service":   "core-go",
			"redis":     rdb != nil,
			"timestamp": time.Now().UTC(),
		})
	})

	// Core API routes
	api := router.Group("/api/v1")
	{
		api.POST("/payments/process", paymentHandler.ProcessPayment)
		api.GET("/accounts", paymentHandler.GetAccounts)
		api.GET("/accounts/:id", paymentHandler.GetAccount)
		api.GET("/transactions", paymentHandler.GetRecentTransactions)
	}

	log.Printf("[INFO] VaultGuard Go Payment Core listening on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
