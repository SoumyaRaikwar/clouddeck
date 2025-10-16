package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type TaskHandler struct {
	service *services.TaskService
}

func NewTaskHandler(service *services.TaskService) *TaskHandler {
	return &TaskHandler{
		service: service,
	}
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	task, err := h.service.CreateTask(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create task", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Task created successfully", task)
}

func (h *TaskHandler) GetAllTasks(c *gin.Context) {
	projectIDParam := c.Query("projectId")

	if projectIDParam != "" {
		projectID, err := strconv.ParseUint(projectIDParam, 10, 32)
		if err != nil {
			utils.ErrorResponse(c, http.StatusBadRequest, "Invalid project ID", err.Error())
			return
		}

		tasks, err := h.service.GetTasksByProjectID(uint(projectID))
		if err != nil {
			utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch tasks", err.Error())
			return
		}

		utils.SuccessResponse(c, http.StatusOK, "Tasks fetched successfully", tasks)
		return
	}

	tasks, err := h.service.GetAllTasks()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch tasks", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Tasks fetched successfully", tasks)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err.Error())
		return
	}

	task, err := h.service.GetTaskByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Task not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task fetched successfully", task)
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err.Error())
		return
	}

	var req models.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	task, err := h.service.UpdateTask(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update task", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task updated successfully", task)
}

func (h *TaskHandler) DeleteTask(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid task ID", err.Error())
		return
	}

	if err := h.service.DeleteTask(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to delete task", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Task deleted successfully", nil)
}

func (h *TaskHandler) GetTaskStats(c *gin.Context) {
	stats, err := h.service.GetStats()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch stats", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Stats fetched successfully", stats)
}
