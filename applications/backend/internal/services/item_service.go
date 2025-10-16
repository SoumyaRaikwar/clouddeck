// internal/services/item_service.go
package services

import (
	"errors"
	"strings"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/repositories"
)

// ItemService handles business logic for items
type ItemService struct {
	repo *repositories.ItemRepository
}

// NewItemService creates a new item service
func NewItemService(repo *repositories.ItemRepository) *ItemService {
	return &ItemService{
		repo: repo,
	}
}

// CreateItem creates a new item with business validation
func (s *ItemService) CreateItem(req *models.CreateItemRequest) (*models.Item, error) {
	// Business validation
	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("name cannot be empty")
	}

	if strings.TrimSpace(req.Description) == "" {
		return nil, errors.New("description cannot be empty")
	}

	// Check if item with same name already exists
	exists, err := s.repo.ExistsByName(req.Name)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("item with this name already exists")
	}

	// Create item
	item := &models.Item{
		Name:        strings.TrimSpace(req.Name),
		Description: strings.TrimSpace(req.Description),
	}

	if err := s.repo.Create(item); err != nil {
		return nil, err
	}

	return item, nil
}

// GetAllItems retrieves all items
func (s *ItemService) GetAllItems() ([]models.Item, error) {
	return s.repo.FindAll()
}

// GetItemByID retrieves an item by ID
func (s *ItemService) GetItemByID(id uint) (*models.Item, error) {
	return s.repo.FindByID(id)
}

// UpdateItem updates an item
func (s *ItemService) UpdateItem(id uint, req *models.UpdateItemRequest) (*models.Item, error) {
	// Get existing item
	item, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.Name != "" {
		item.Name = strings.TrimSpace(req.Name)
	}
	if req.Description != "" {
		item.Description = strings.TrimSpace(req.Description)
	}

	if err := s.repo.Update(item); err != nil {
		return nil, err
	}

	return item, nil
}

// DeleteItem deletes an item
func (s *ItemService) DeleteItem(id uint) error {
	return s.repo.Delete(id)
}
