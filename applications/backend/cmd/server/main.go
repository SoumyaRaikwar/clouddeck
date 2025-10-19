package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/database"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/handlers"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/middleware"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models" 
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/repositories"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize databases
	if err := database.InitPostgres(); err != nil {
		log.Fatalf("❌ Failed to connect to PostgreSQL: %v", err)
	}
	defer database.ClosePostgres()

	if err := database.InitMongoDB(); err != nil {
		log.Printf("⚠️  MongoDB connection failed: %v", err)
	} else {
		defer database.CloseMongoDB()
	}
database.DB.AutoMigrate(&models.GitOpsApp{})

	// Initialize Gin router
	router := gin.Default()

	// Middleware
	router.Use(middleware.Logger())
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check
	router.GET("/health", handlers.HealthCheck)

	// API routes
	api := router.Group("/api")
	{
		// Items (original CRUD)
		itemRepo := repositories.NewItemRepository()
		itemService := services.NewItemService(itemRepo)
		itemHandler := handlers.NewItemHandler(itemService)

		items := api.Group("/items")
		{
			items.GET("", itemHandler.GetAllItems)
			items.GET("/:id", itemHandler.GetItem)
			items.POST("", itemHandler.CreateItem)
			items.PUT("/:id", itemHandler.UpdateItem)
			items.DELETE("/:id", itemHandler.DeleteItem)
		}

		// Projects (new)
		projectRepo := repositories.NewProjectRepository()
		projectService := services.NewProjectService(projectRepo)
		projectHandler := handlers.NewProjectHandler(projectService)

		projects := api.Group("/projects")
		{
			projects.GET("", projectHandler.GetAllProjects)
			projects.GET("/:id", projectHandler.GetProject)
			projects.POST("", projectHandler.CreateProject)
			projects.PUT("/:id", projectHandler.UpdateProject)
			projects.DELETE("/:id", projectHandler.DeleteProject)
			projects.GET("/stats", projectHandler.GetProjectStats)
		}

		// Tasks - No DB parameter needed
		taskRepo := repositories.NewTaskRepository()
		taskService := services.NewTaskService(taskRepo, projectRepo)
		taskHandler := handlers.NewTaskHandler(taskService)

		tasks := api.Group("/tasks")
		{
			tasks.GET("", taskHandler.GetAllTasks)  // Supports ?projectId=X
			tasks.GET("/:id", taskHandler.GetTask)
			tasks.POST("", taskHandler.CreateTask)
			tasks.PUT("/:id", taskHandler.UpdateTask)
			tasks.DELETE("/:id", taskHandler.DeleteTask)
			tasks.GET("/stats", taskHandler.GetTaskStats)
		}

		// GitHub Integration
		githubService := services.NewGitHubService(taskRepo, projectRepo)
		githubHandler := handlers.NewGitHubHandler(githubService)

		githubRoutes := api.Group("/github")
		{
			githubRoutes.GET("/prs", githubHandler.GetUserPRs)
			githubRoutes.GET("/issues", githubHandler.GetRepoIssues)
			githubRoutes.POST("/sync-prs", githubHandler.SyncPRsToTasks)
			githubRoutes.POST("/sync-issues", githubHandler.SyncIssuesToTasks)
		}

		// Containers (optional - if you added it)
		containerService, err := services.NewContainerService()
		if err == nil {
			containerHandler := handlers.NewContainerHandler(containerService)
			
			containers := api.Group("/containers")
			{
				containers.GET("", containerHandler.GetContainers)
				containers.GET("/:id/logs", containerHandler.GetContainerLogs)
			}
		}
	}

	// Kubernetes Integration
k8sService, err := services.NewKubernetesService()
if err == nil {
	k8sHandler := handlers.NewKubernetesHandler(k8sService)
	
	k8s := api.Group("/kubernetes")
	{
		k8s.GET("/pods", k8sHandler.GetPods)
		k8s.GET("/deployments", k8sHandler.GetDeployments)
		k8s.GET("/services", k8sHandler.GetServices)
		k8s.GET("/namespaces", k8sHandler.GetNamespaces)
		k8s.GET("/pods/:namespace/:pod/logs", k8sHandler.GetPodLogs)
	}
} else {
	log.Printf("⚠️  Kubernetes client not available: %v", err)
}

	gitopsService := services.NewGitOpsService(database.DB)
		gitopsHandler := handlers.NewGitOpsHandler(gitopsService)

		gitops := api.Group("/gitops")
		{
			gitops.POST("/apps", gitopsHandler.CreateApp)
			gitops.GET("/apps", gitopsHandler.GetAllApps)
			gitops.GET("/apps/:id", gitopsHandler.GetApp)
			gitops.POST("/apps/:id/sync", gitopsHandler.SyncApp)
			gitops.DELETE("/apps/:id", gitopsHandler.DeleteApp)
		}

// CI/CD Pipeline (inside api group)
cicdService := services.NewCICDService("")
cicdHandler := handlers.NewCICDHandler(cicdService)

cicd := api.Group("/cicd")
{
	cicd.GET("/runs", cicdHandler.GetWorkflowRuns)
	cicd.GET("/stats", cicdHandler.GetPipelineStats)
	cicd.GET("/workflows", cicdHandler.GetWorkflows)
}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
