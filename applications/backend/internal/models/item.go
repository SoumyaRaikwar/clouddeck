// internal/models/item.go
package models

import (
	"time"

	"gorm.io/gorm"
)

// Item represents an item in the system
type Item struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name
func (Item) TableName() string {
	return "items"
}

// CreateItemRequest represents the request body for creating an item
type CreateItemRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=255"`
	Description string `json:"description" binding:"required,min=10"`
}

// UpdateItemRequest represents the request body for updating an item
type UpdateItemRequest struct {
	Name        string `json:"name" binding:"omitempty,min=3,max=255"`
	Description string `json:"description" binding:"omitempty,min=10"`
}
