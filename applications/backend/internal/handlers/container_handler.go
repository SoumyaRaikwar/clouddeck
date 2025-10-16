package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type ContainerHandler struct {
	service *services.ContainerService
}

func NewContainerHandler(service *services.ContainerService) *ContainerHandler {
	return &ContainerHandler{
		service: service,
	}
}

func (h *ContainerHandler) GetContainers(c *gin.Context) {
	containers, err := h.service.GetAllContainers()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch containers", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Containers fetched successfully", containers)
}

func (h *ContainerHandler) GetContainerLogs(c *gin.Context) {
	containerID := c.Param("id")
	tail := c.DefaultQuery("tail", "100")

	logs, err := h.service.GetContainerLogs(containerID, tail)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch logs", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Logs fetched successfully", gin.H{"logs": logs})
}
