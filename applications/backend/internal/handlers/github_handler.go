package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/services"
	"github.com/SoumyaRaikwar/clouddeck-backend/pkg/utils"
)

type GitHubHandler struct {
	service *services.GitHubService
}

func NewGitHubHandler(service *services.GitHubService) *GitHubHandler {
	return &GitHubHandler{
		service: service,
	}
}

type SyncPRsRequest struct {
	Token     string `json:"token" binding:"required"`
	Username  string `json:"username" binding:"required"`
	ProjectID uint   `json:"project_id" binding:"required"`
}

type SyncIssuesRequest struct {
	Token     string `json:"token" binding:"required"`
	Owner     string `json:"owner" binding:"required"`
	Repo      string `json:"repo" binding:"required"`
	ProjectID uint   `json:"project_id" binding:"required"`
}

func (h *GitHubHandler) GetUserPRs(c *gin.Context) {
	token := c.Query("token")
	username := c.Query("username")

	if token == "" || username == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token and username are required", "")
		return
	}

	prs, err := h.service.GetUserPRs(token, username)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch PRs", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "PRs fetched successfully", prs)
}

func (h *GitHubHandler) GetRepoIssues(c *gin.Context) {
	token := c.Query("token")
	owner := c.Query("owner")
	repo := c.Query("repo")

	if token == "" || owner == "" || repo == "" {
		utils.ErrorResponse(c, http.StatusBadRequest, "Token, owner, and repo are required", "")
		return
	}

	issues, err := h.service.GetRepoIssues(token, owner, repo)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch issues", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Issues fetched successfully", issues)
}

func (h *GitHubHandler) SyncPRsToTasks(c *gin.Context) {
	var req SyncPRsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.service.SyncPRsToTasks(req.Token, req.Username, req.ProjectID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to sync PRs", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "PRs synced to tasks successfully", nil)
}

func (h *GitHubHandler) SyncIssuesToTasks(c *gin.Context) {
	var req SyncIssuesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request", err.Error())
		return
	}

	if err := h.service.SyncIssuesToTasks(req.Token, req.Owner, req.Repo, req.ProjectID); err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to sync issues", err.Error())
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "Issues synced to tasks successfully", nil)
}