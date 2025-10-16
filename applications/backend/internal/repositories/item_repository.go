// internal/repositories/item_repository.go
package repositories

import (
	"errors"

	"gorm.io/gorm"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/database"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
)

// ItemRepository handles database operations for items
type ItemRepository struct {
	db *gorm.DB
}

// NewItemRepository creates a new item repository
func NewItemRepository() *ItemRepository {
	return &ItemRepository{
		db: database.PostgresDB,
	}
}

// Create creates a new item
func (r *ItemRepository) Create(item *models.Item) error {
	return r.db.Create(item).Error
}

// FindAll retrieves all items
func (r *ItemRepository) FindAll() ([]models.Item, error) {
	var items []models.Item
	err := r.db.Order("created_at DESC").Find(&items).Error
	return items, err
}

// FindByID retrieves an item by ID
func (r *ItemRepository) FindByID(id uint) (*models.Item, error) {
	var item models.Item
	err := r.db.First(&item, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("item not found")
		}
		return nil, err
	}
	return &item, nil
}

// Update updates an item
func (r *ItemRepository) Update(item *models.Item) error {
	return r.db.Save(item).Error
}

// Delete soft deletes an item
func (r *ItemRepository) Delete(id uint) error {
	result := r.db.Delete(&models.Item{}, id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("item not found")
	}
	return nil
}

// ExistsByName checks if an item with the given name exists
func (r *ItemRepository) ExistsByName(name string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Item{}).Where("name = ?", name).Count(&count).Error
	return count > 0, err
}
