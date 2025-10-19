package models

import (
	"time"

	"gorm.io/gorm"
)

type GitOpsApp struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Name        string         `gorm:"not null" json:"name"`
	RepoURL     string         `gorm:"not null" json:"repo_url"`
	Branch      string         `gorm:"default:main" json:"branch"`
	Path        string         `json:"path"` // Path to manifests in repo
	Namespace   string         `json:"namespace"`
	SyncStatus  string         `gorm:"default:Unknown" json:"sync_status"` // Synced, OutOfSync
	LastSynced  *time.Time     `json:"last_synced"`
}
