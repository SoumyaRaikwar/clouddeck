package models

import (
	"time"

	"gorm.io/gorm"
)

type Project struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null;unique" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	RepoURL     string         `gorm:"type:varchar(500)" json:"repoUrl"`
	Status      string         `gorm:"type:varchar(50);default:'active'" json:"status"`
	Color       string         `gorm:"type:varchar(7);default:'#1976d2'" json:"color"`
	Tasks       []Task         `gorm:"foreignKey:ProjectID" json:"tasks,omitempty"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Project) TableName() string {
	return "projects"
}

type ProjectCreateInput struct {
	Name        string `json:"name" binding:"required,min=3,max=255"`
	Description string `json:"description" binding:"required,min=10"`
	RepoURL     string `json:"repoUrl" binding:"omitempty,url"`
	Status      string `json:"status" binding:"omitempty,oneof=active completed archived"`
	Color       string `json:"color" binding:"omitempty"`
}

type ProjectUpdateInput struct {
	Name        string `json:"name" binding:"omitempty,min=3,max=255"`
	Description string `json:"description" binding:"omitempty,min=10"`
	RepoURL     string `json:"repoUrl" binding:"omitempty,url"`
	Status      string `json:"status" binding:"omitempty,oneof=active completed archived"`
	Color       string `json:"color" binding:"omitempty"`
}
