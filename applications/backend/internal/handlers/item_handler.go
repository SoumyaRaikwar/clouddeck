package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

// ItemHandler handles HTTP requests for items
type ItemHandler struct {
	service *services.ItemService
}

// NewItemHandler creates a new item handler
func NewItemHandler(service *services.ItemService) *ItemHandler {
	return &ItemHandler{
		service: service,
	}
}

// CreateItem handles POST /api/items
func (h *ItemHandler) CreateItem(c *gin.Context) {
	var req models.CreateItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	item, err := h.service.CreateItem(&req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to create item", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, "Item created successfully", item)
}

// GetAllItems handles GET /api/items
func (h *ItemHandler) GetAllItems(c *gin.Context) {
	items, err := h.service.GetAllItems()
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch items", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Items fetched successfully", items)
}

// GetItem handles GET /api/items/:id
func (h *ItemHandler) GetItem(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid item ID", err.Error())
		return
	}

	item, err := h.service.GetItemByID(uint(id))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Item not found", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item fetched successfully", item)
}

// UpdateItem handles PUT /api/items/:id
func (h *ItemHandler) UpdateItem(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid item ID", err.Error())
		return
	}

	var req models.UpdateItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	item, err := h.service.UpdateItem(uint(id), &req)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Failed to update item", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item updated successfully", item)
}

// DeleteItem handles DELETE /api/items/:id
func (h *ItemHandler) DeleteItem(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid item ID", err.Error())
		return
	}

	if err := h.service.DeleteItem(uint(id)); err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Failed to delete item", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Item deleted successfully", nil)
}
