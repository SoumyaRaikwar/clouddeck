package services

import (
	"errors"
	"strings"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/repositories"
)

type ProjectService struct {
	repo *repositories.ProjectRepository
}

func NewProjectService(repo *repositories.ProjectRepository) *ProjectService {
	return &ProjectService{repo: repo}
}

func (s *ProjectService) CreateProject(req *models.ProjectCreateInput) (*models.Project, error) {
	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("name cannot be empty")
	}

	exists, err := s.repo.ExistsByName(req.Name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("project with this name already exists")
	}

	project := &models.Project{
		Name:        strings.TrimSpace(req.Name),
		Description: strings.TrimSpace(req.Description),
		RepoURL:     strings.TrimSpace(req.RepoURL),
		Status:      req.Status,
		Color:       req.Color,
	}

	if project.Status == "" {
		project.Status = "active"
	}
	if project.Color == "" {
		project.Color = "#1976d2"
	}

	if err := s.repo.Create(project); err != nil {
		return nil, err
	}

	return project, nil
}

func (s *ProjectService) GetAllProjects() ([]models.Project, error) {
	return s.repo.FindAll()
}

func (s *ProjectService) GetProjectByID(id uint) (*models.Project, error) {
	return s.repo.FindByID(id)
}

func (s *ProjectService) UpdateProject(id uint, req *models.ProjectUpdateInput) (*models.Project, error) {
	project, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if req.Name != "" {
		project.Name = strings.TrimSpace(req.Name)
	}
	if req.Description != "" {
		project.Description = strings.TrimSpace(req.Description)
	}
	if req.RepoURL != "" {
		project.RepoURL = strings.TrimSpace(req.RepoURL)
	}
	if req.Status != "" {
		project.Status = req.Status
	}
	if req.Color != "" {
		project.Color = req.Color
	}

	if err := s.repo.Update(project); err != nil {
		return nil, err
	}

	return project, nil
}

func (s *ProjectService) DeleteProject(id uint) error {
	return s.repo.Delete(id)
}

func (s *ProjectService) GetStats() (map[string]interface{}, error) {
	return s.repo.GetStats()
}
