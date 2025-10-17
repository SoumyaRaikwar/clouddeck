package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type KubernetesHandler struct {
	service *services.KubernetesService
}

func NewKubernetesHandler(service *services.KubernetesService) *KubernetesHandler {
	return &KubernetesHandler{
		service: service,
	}
}

func (h *KubernetesHandler) GetPods(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "all")
	
	pods, err := h.service.GetPods(namespace)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch pods", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Pods fetched successfully", pods)
}

func (h *KubernetesHandler) GetDeployments(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "all")
	
	deployments, err := h.service.GetDeployments(namespace)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch deployments", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Deployments fetched successfully", deployments)
}

func (h *KubernetesHandler) GetServices(c *gin.Context) {
	namespace := c.DefaultQuery("namespace", "all")
	
	services, err := h.service.GetServices(namespace)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch services", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Services fetched successfully", services)
}

func (h *KubernetesHandler) GetNamespaces(c *gin.Context) {
	namespaces, err := h.service.GetNamespaces()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch namespaces", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Namespaces fetched successfully", namespaces)
}

func (h *KubernetesHandler) GetPodLogs(c *gin.Context) {
	namespace := c.Param("namespace")
	podName := c.Param("pod")
	lines := c.DefaultQuery("lines", "100")
	
	linesInt, _ := strconv.ParseInt(lines, 10, 64)
	
	logs, err := h.service.GetPodLogs(namespace, podName, linesInt)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch pod logs", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Logs fetched successfully", gin.H{"logs": logs})
}
