package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type ProjectHandler struct {
	service *services.ProjectService
}

func NewProjectHandler(service *services.ProjectService) *ProjectHandler {
	return &ProjectHandler{
		service: service,
	}
}

func (h *ProjectHandler) CreateProject(c *gin.Context) {
	var req models.ProjectCreateInput
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	project, err := h.service.CreateProject(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create project", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Project created successfully", project)
}

func (h *ProjectHandler) GetAllProjects(c *gin.Context) {
	projects, err := h.service.GetAllProjects()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch projects", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Projects fetched successfully", projects)
}

func (h *ProjectHandler) GetProject(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
		return
	}

	project, err := h.service.GetProjectByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Project not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Project fetched successfully", project)
}

func (h *ProjectHandler) UpdateProject(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
		return
	}

	var req models.ProjectUpdateInput
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	project, err := h.service.UpdateProject(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update project", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Project updated successfully", project)
}

func (h *ProjectHandler) DeleteProject(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
		return
	}

	if err := h.service.DeleteProject(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete project", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Project deleted successfully", nil)
}

func (h *ProjectHandler) GetProjectStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch stats", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Stats fetched successfully", stats)
}
