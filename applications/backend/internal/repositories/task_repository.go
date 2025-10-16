package repositories

import (
	"errors"

	"gorm.io/gorm"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/database"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
)

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository() *TaskRepository {
	return &TaskRepository{
		db: database.PostgresDB,
	}
}

func (r *TaskRepository) Create(task *models.Task) error {
	return r.db.Create(task).Error
}

func (r *TaskRepository) FindAll() ([]models.Task, error) {
	var tasks []models.Task
	err := r.db.Preload("Project").Order("created_at DESC").Find(&tasks).Error
	return tasks, err
}

func (r *TaskRepository) FindByProjectID(projectID uint) ([]models.Task, error) {
	var tasks []models.Task
	err := r.db.Where("project_id = ?", projectID).Order("created_at DESC").Find(&tasks).Error
	return tasks, err
}

func (r *TaskRepository) FindByID(id uint) (*models.Task, error) {
	var task models.Task
	err := r.db.Preload("Project").First(&task, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("task not found")
		}
		return nil, err
	}
	return &task, nil
}

func (r *TaskRepository) Update(task *models.Task) error {
	return r.db.Save(task).Error
}

func (r *TaskRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Task{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("task not found")
	}
	return nil
}

func (r *TaskRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	var totalTasks int64
	r.db.Model(&models.Task{}).Count(&totalTasks)
	stats["totalTasks"] = totalTasks

	statusCounts := make(map[string]int64)
	statuses := []string{"todo", "in_progress", "review", "done"}
	for _, status := range statuses {
		var count int64
		r.db.Model(&models.Task{}).Where("status = ?", status).Count(&count)
		statusCounts[status] = count
	}
	stats["byStatus"] = statusCounts

	return stats, nil
}
