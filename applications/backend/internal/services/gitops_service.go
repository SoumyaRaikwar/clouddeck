package services

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"gorm.io/gorm"
)

type GitOpsService struct {
	db *gorm.DB
}

func NewGitOpsService(db *gorm.DB) *GitOpsService {
	return &GitOpsService{db: db}
}

// CreateApp creates a new GitOps application
func (s *GitOpsService) CreateApp(app *models.GitOpsApp) error {
	return s.db.Create(app).Error
}

// GetAllApps retrieves all GitOps applications
func (s *GitOpsService) GetAllApps() ([]models.GitOpsApp, error) {
	var apps []models.GitOpsApp
	err := s.db.Find(&apps).Error
	return apps, err
}

// GetAppByID retrieves a GitOps app by ID
func (s *GitOpsService) GetAppByID(id uint) (*models.GitOpsApp, error) {
	var app models.GitOpsApp
	err := s.db.First(&app, id).Error
	return &app, err
}

// SyncApp synchronizes the app with Git repository
func (s *GitOpsService) SyncApp(appID uint) error {
	app, err := s.GetAppByID(appID)
	if err != nil {
		return err
	}

	// Clone and apply manifests
	err = s.applyManifests(app)
	if err != nil {
		app.SyncStatus = "OutOfSync"
		s.db.Save(app)
		return err
	}

	// Update sync status
	now := time.Now()
	app.LastSynced = &now
	app.SyncStatus = "Synced"
	s.db.Save(app)

	return nil
}

// applyManifests clones repo and applies K8s manifests
func (s *GitOpsService) applyManifests(app *models.GitOpsApp) error {
	// Create temp directory
	tmpDir, err := os.MkdirTemp("", "gitops-*")
	if err != nil {
		return fmt.Errorf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tmpDir)

	// Clone repository
	cmd := exec.Command("git", "clone", "--branch", app.Branch, "--depth", "1", app.RepoURL, tmpDir)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("git clone failed: %v, output: %s", err, output)
	}

	// Path to manifests
	manifestPath := filepath.Join(tmpDir, app.Path)

	// Apply manifests using kubectl
	cmd = exec.Command("kubectl", "apply", "-f", manifestPath, "-n", app.Namespace)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("kubectl apply failed: %v, output: %s", err, output)
	}

	return nil
}

// DeleteApp deletes a GitOps app
func (s *GitOpsService) DeleteApp(id uint) error {
	return s.db.Delete(&models.GitOpsApp{}, id).Error
}
