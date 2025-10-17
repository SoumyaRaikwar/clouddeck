package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type CICDHandler struct {
	service *services.CICDService
}

func NewCICDHandler(service *services.CICDService) *CICDHandler {
	return &CICDHandler{
		service: service,
	}
}

func (h *CICDHandler) GetWorkflowRuns(c *gin.Context) {
	token := c.Query("token")
	owner := c.Query("owner")
	repo := c.Query("repo")
	limitStr := c.DefaultQuery("limit", "20")

	if token == "" || owner == "" || repo == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token, owner, and repo are required", "")
		return
	}

	limit, _ := strconv.Atoi(limitStr)
	
	// Create new service with provided token
	service := services.NewCICDService(token)
	
	runs, err := service.GetWorkflowRuns(owner, repo, limit)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch workflow runs", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Workflow runs fetched successfully", runs)
}

func (h *CICDHandler) GetPipelineStats(c *gin.Context) {
	token := c.Query("token")
	owner := c.Query("owner")
	repo := c.Query("repo")

	if token == "" || owner == "" || repo == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token, owner, and repo are required", "")
		return
	}

	// Create new service with provided token
	service := services.NewCICDService(token)
	
	stats, err := service.GetPipelineStats(owner, repo)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch pipeline stats", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Pipeline stats fetched successfully", stats)
}

func (h *CICDHandler) GetWorkflows(c *gin.Context) {
	token := c.Query("token")
	owner := c.Query("owner")
	repo := c.Query("repo")

	if token == "" || owner == "" || repo == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token, owner, and repo are required", "")
		return
	}

	// Create new service with provided token
	service := services.NewCICDService(token)
	
	workflows, err := service.GetWorkflows(owner, repo)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch workflows", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Workflows fetched successfully", workflows)
}
