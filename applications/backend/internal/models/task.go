package models
import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID             uint           `gorm:"primarykey" json:"id"`
	ProjectID      uint           `gorm:"not null;index" json:"projectId"`
	Project        *Project       `gorm:"foreignKey:ProjectID" json:"project,omitempty"`
	Title          string         `gorm:"type:varchar(255);not null" json:"title"`
	Description    string         `gorm:"type:text" json:"description"`
	Status         string         `gorm:"type:varchar(50);default:'todo'" json:"status"`
	Priority       string         `gorm:"type:varchar(20);default:'medium'" json:"priority"`
	Labels         string         `gorm:"type:varchar(500)" json:"labels"`
	Assignee       string         `gorm:"type:varchar(100)" json:"assignee"`
	DueDate        *time.Time     `json:"dueDate,omitempty"`
	EstimatedHours int            `json:"estimatedHours"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Task) TableName() string {
	return "tasks"
}

type CreateTaskRequest struct {
	ProjectID      uint       `json:"projectId" binding:"required"`
	Title          string     `json:"title" binding:"required,min=3,max=255"`
	Description    string     `json:"description" binding:"required"`
	Status         string     `json:"status" binding:"omitempty,oneof=todo in_progress review done"`
	Priority       string     `json:"priority" binding:"omitempty,oneof=low medium high urgent"`
	Labels         string     `json:"labels" binding:"omitempty"`
	Assignee       string     `json:"assignee" binding:"omitempty"`
	DueDate        *time.Time `json:"dueDate"`
	EstimatedHours int        `json:"estimatedHours"`
}

type UpdateTaskRequest struct {
	Title          string     `json:"title" binding:"omitempty,min=3,max=255"`
	Description    string     `json:"description" binding:"omitempty"`
	Status         string     `json:"status" binding:"omitempty,oneof=todo in_progress review done"`
	Priority       string     `json:"priority" binding:"omitempty,oneof=low medium high urgent"`
	Labels         string     `json:"labels" binding:"omitempty"`
	Assignee       string     `json:"assignee" binding:"omitempty"`
	DueDate        *time.Time `json:"dueDate"`
	EstimatedHours int        `json:"estimatedHours"`
}