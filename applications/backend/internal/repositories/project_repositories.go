package repositories

import (
	"errors"

	"gorm.io/gorm"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/database"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
)

type ProjectRepository struct {
	db *gorm.DB
}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{
		db: database.PostgresDB,
	}
}

func (r *ProjectRepository) Create(project *models.Project) error {
	return r.db.Create(project).Error
}

func (r *ProjectRepository) FindAll() ([]models.Project, error) {
	var projects []models.Project
	err := r.db.Preload("Tasks").Order("created_at DESC").Find(&projects).Error
	return projects, err
}

func (r *ProjectRepository) FindByID(id uint) (*models.Project, error) {
	var project models.Project
	err := r.db.Preload("Tasks").First(&project, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("project not found")
		}
		return nil, err
	}
	return &project, nil
}

func (r *ProjectRepository) Update(project *models.Project) error {
	return r.db.Save(project).Error
}

func (r *ProjectRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Project{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("project not found")
	}
	return nil
}

func (r *ProjectRepository) ExistsByName(name string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Project{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}

func (r *ProjectRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	var totalProjects int64
	r.db.Model(&models.Project{}).Count(&totalProjects)
	stats["totalProjects"] = totalProjects

	var activeProjects int64
	r.db.Model(&models.Project{}).Where("status = ?", "active").Count(&activeProjects)
	stats["activeProjects"] = activeProjects

	return stats, nil
}
