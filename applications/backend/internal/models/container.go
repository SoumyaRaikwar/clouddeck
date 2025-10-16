package models

import (
	"time"

	"gorm.io/gorm"
)

type Container struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	ContainerID string         `gorm:"type:varchar(255);uniqueIndex" json:"containerId"`
	Name        string         `gorm:"type:varchar(255)" json:"name"`
	Image       string         `gorm:"type:varchar(255)" json:"image"`
	Status      string         `gorm:"type:varchar(50)" json:"status"`
	State       string         `gorm:"type:varchar(50)" json:"state"`
	CPUPercent  float64        `json:"cpuPercent"`
	MemoryUsage int64          `json:"memoryUsage"`
	MemoryLimit int64          `json:"memoryLimit"`
	NetworkRx   int64          `json:"networkRx"`
	NetworkTx   int64          `json:"networkTx"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Container) TableName() string {
	return "containers"
}

type ContainerStats struct {
	ContainerID string  `json:"containerId"`
	Name        string  `json:"name"`
	Status       string  `json:"status"`
	Image        string  `json:"image"`
	CPUPercent  float64 `json:"cpuPercent"`
	MemoryUsage int64   `json:"memoryUsage"`
	MemoryLimit int64   `json:"memoryLimit"`
}
