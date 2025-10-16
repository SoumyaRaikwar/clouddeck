package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/go-github/v56/github"
	"golang.org/x/oauth2"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
	"github.com/SoumyaRaikwar/clouddeck-backend/internal/repositories"
)

type GitHubService struct {
	taskRepo    *repositories.TaskRepository
	projectRepo *repositories.ProjectRepository
}

func NewGitHubService(taskRepo *repositories.TaskRepository, projectRepo *repositories.ProjectRepository) *GitHubService {
	return &GitHubService{
		taskRepo:    taskRepo,
		projectRepo: projectRepo,
	}
}

func (s *GitHubService) createClient(token string) *github.Client {
	ctx := context.Background()
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	tc := oauth2.NewClient(ctx, ts)
	return github.NewClient(tc)
}

// GetUserPRs fetches all PRs for a user across repos
func (s *GitHubService) GetUserPRs(token string, username string) ([]map[string]interface{}, error) {
	client := s.createClient(token)
	ctx := context.Background()

	// Search for user's PRs
	query := fmt.Sprintf("author:%s is:pr", username)
	opts := &github.SearchOptions{
		ListOptions: github.ListOptions{PerPage: 50},
	}

	result, _, err := client.Search.Issues(ctx, query, opts)
	if err != nil {
		return nil, err
	}

	var prs []map[string]interface{}
	for _, issue := range result.Issues {
		if issue.PullRequestLinks == nil {
			continue
		}

		pr := map[string]interface{}{
			"id":         issue.GetNumber(),
			"title":      issue.GetTitle(),
			"url":        issue.GetHTMLURL(),
			"state":      issue.GetState(),
			"created_at": issue.GetCreatedAt(),
			"updated_at": issue.GetUpdatedAt(),
			"repo":       extractRepo(issue.GetHTMLURL()),
			"labels":     extractLabels(issue.Labels),
		}
		prs = append(prs, pr)
	}

	return prs, nil
}

// GetRepoIssues fetches issues from a specific repo
func (s *GitHubService) GetRepoIssues(token string, owner string, repo string) ([]map[string]interface{}, error) {
	client := s.createClient(token)
	ctx := context.Background()

	opts := &github.IssueListByRepoOptions{
		State: "open",
		ListOptions: github.ListOptions{PerPage: 50},
	}

	issues, _, err := client.Issues.ListByRepo(ctx, owner, repo, opts)
	if err != nil {
		return nil, err
	}

	var result []map[string]interface{}
	for _, issue := range issues {
		if issue.PullRequestLinks != nil {
			continue // Skip PRs
		}

		issueData := map[string]interface{}{
			"id":         issue.GetNumber(),
			"title":      issue.GetTitle(),
			"body":       issue.GetBody(),
			"url":        issue.GetHTMLURL(),
			"state":      issue.GetState(),
			"created_at": issue.GetCreatedAt(),
			"labels":     extractLabels(issue.Labels),
			"assignee":   getAssignee(issue.Assignee),
		}
		result = append(result, issueData)
	}

	return result, nil
}

// SyncPRsToTasks creates tasks from user's PRs
func (s *GitHubService) SyncPRsToTasks(token string, username string, projectID uint) error {
	prs, err := s.GetUserPRs(token, username)
	if err != nil {
		return err
	}

	for _, pr := range prs {
		// Check if task already exists
		title := pr["title"].(string)
		existingTasks, _ := s.taskRepo.FindByProjectID(projectID)
		
		exists := false
		for _, task := range existingTasks {
			if strings.Contains(task.Title, title) {
				exists = true
				break
			}
		}

		if !exists {
			// Create new task from PR
			task := &models.Task{
				ProjectID:   projectID,
				Title:       fmt.Sprintf("[PR] %s", title),
				Description: fmt.Sprintf("GitHub PR: %s\nRepo: %s", pr["url"], pr["repo"]),
				Status:      mapPRStatus(pr["state"].(string)),
				Priority:    "medium",
				Labels:      pr["labels"].(string),
			}

			if err := s.taskRepo.Create(task); err != nil {
				continue
			}
		}
	}

	return nil
}

// SyncIssuesToTasks creates tasks from repo issues
func (s *GitHubService) SyncIssuesToTasks(token string, owner string, repo string, projectID uint) error {
	issues, err := s.GetRepoIssues(token, owner, repo)
	if err != nil {
		return err
	}

	for _, issue := range issues {
		title := issue["title"].(string)
		existingTasks, _ := s.taskRepo.FindByProjectID(projectID)
		
		exists := false
		for _, task := range existingTasks {
			if strings.Contains(task.Title, title) {
				exists = true
				break
			}
		}

		if !exists {
			task := &models.Task{
				ProjectID:   projectID,
				Title:       fmt.Sprintf("[Issue] %s", title),
				Description: fmt.Sprintf("%s\n\nGitHub: %s", issue["body"], issue["url"]),
				Status:      "todo",
				Priority:    "medium",
				Labels:      issue["labels"].(string),
			}

			if assignee, ok := issue["assignee"].(string); ok && assignee != "" {
				task.Assignee = assignee
			}

			if err := s.taskRepo.Create(task); err != nil {
				continue
			}
		}
	}

	return nil
}

// Helper functions
func extractRepo(url string) string {
	parts := strings.Split(url, "/")
	if len(parts) >= 5 {
		return fmt.Sprintf("%s/%s", parts[3], parts[4])
	}
	return ""
}

func extractLabels(labels []*github.Label) string {
	var labelNames []string
	for _, label := range labels {
		labelNames = append(labelNames, label.GetName())
	}
	return strings.Join(labelNames, ", ")
}

func getAssignee(assignee *github.User) string {
	if assignee != nil {
		return assignee.GetLogin()
	}
	return ""
}

func mapPRStatus(state string) string {
	switch state {
	case "open":
		return "in_progress"
	case "closed":
		return "done"
	default:
		return "todo"
	}
}
