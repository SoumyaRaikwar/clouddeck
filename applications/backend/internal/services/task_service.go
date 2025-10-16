package services

import (
	"errors"
	"strings"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/repositories"
)

type TaskService struct {
	repo        *repositories.TaskRepository
	projectRepo *repositories.ProjectRepository
}

func NewTaskService(repo *repositories.TaskRepository, projectRepo *repositories.ProjectRepository) *TaskService {
	return &TaskService{
		repo:        repo,
		projectRepo: projectRepo,
	}
}

func (s *TaskService) CreateTask(req *models.CreateTaskRequest) (*models.Task, error) {
	if strings.TrimSpace(req.Title) == "" {
		return nil, errors.New("title cannot be empty")
	}

	// Verify project exists
	_, err := s.projectRepo.FindByID(req.ProjectID)
	if err != nil {
		return nil, errors.New("project not found")
	}

	task := &models.Task{
		ProjectID:      req.ProjectID,
		Title:          strings.TrimSpace(req.Title),
		Description:    strings.TrimSpace(req.Description),
		Status:         req.Status,
		Priority:       req.Priority,
		Labels:         req.Labels,
		Assignee:       strings.TrimSpace(req.Assignee),
		DueDate:        req.DueDate,
		EstimatedHours: req.EstimatedHours,
	}

	if task.Status == "" {
		task.Status = "todo"
	}
	if task.Priority == "" {
		task.Priority = "medium"
	}

	if err := s.repo.Create(task); err != nil {
		return nil, err
	}

	return task, nil
}

func (s *TaskService) GetAllTasks() ([]models.Task, error) {
	return s.repo.FindAll()
}

func (s *TaskService) GetTasksByProjectID(projectID uint) ([]models.Task, error) {
	return s.repo.FindByProjectID(projectID)
}

func (s *TaskService) GetTaskByID(id uint) (*models.Task, error) {
	return s.repo.FindByID(id)
}

func (s *TaskService) UpdateTask(id uint, req *models.UpdateTaskRequest) (*models.Task, error) {
	task, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.Title != "" {
		task.Title = strings.TrimSpace(req.Title)
	}
	if req.Description != "" {
		task.Description = strings.TrimSpace(req.Description)
	}
	if req.Status != "" {
		task.Status = req.Status
	}
	if req.Priority != "" {
		task.Priority = req.Priority
	}
	if req.Labels != "" {
		task.Labels = req.Labels
	}
	if req.Assignee != "" {
		task.Assignee = strings.TrimSpace(req.Assignee)
	}
	if req.DueDate != nil {
		task.DueDate = req.DueDate
	}
	task.EstimatedHours = req.EstimatedHours

	if err := s.repo.Update(task); err != nil {
		return nil, err
	}

	return task, nil
}

func (s *TaskService) DeleteTask(id uint) error {
	return s.repo.Delete(id)
}

func (s *TaskService) GetStats() (map[string]interface{}, error) {
	return s.repo.GetStats()
}
