package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type GitOpsHandler struct {
	service *services.GitOpsService
}

func NewGitOpsHandler(service *services.GitOpsService) *GitOpsHandler {
	return &GitOpsHandler{service: service}
}

func (h *GitOpsHandler) CreateApp(c *gin.Context) {
	var app models.GitOpsApp
	if err := c.ShouldBindJSON(&app); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	if err := h.service.CreateApp(&app); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create GitOps app", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "GitOps app created successfully", app)
}

func (h *GitOpsHandler) GetAllApps(c *gin.Context) {
	apps, err := h.service.GetAllApps()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch apps", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Apps fetched successfully", apps)
}

func (h *GitOpsHandler) GetApp(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	app, err := h.service.GetAppByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "App not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "App fetched successfully", app)
}

func (h *GitOpsHandler) SyncApp(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.service.SyncApp(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Sync failed", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "App synced successfully", nil)
}

func (h *GitOpsHandler) DeleteApp(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	if err := h.service.DeleteApp(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Delete failed", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "App deleted successfully", nil)
}
