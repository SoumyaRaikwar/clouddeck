package services

import (
	"context"
	"fmt"
	"time"

	"github.com/google/go-github/v57/github"
	"golang.org/x/oauth2"
)

type CICDService struct {
	githubClient *github.Client
}

type WorkflowRun struct {
	ID         int64     `json:"id"`
	Name       string    `json:"name"`
	Status     string    `json:"status"`
	Conclusion string    `json:"conclusion"`
	Branch     string    `json:"branch"`
	Event      string    `json:"event"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	URL        string    `json:"url"`
	HeadSHA    string    `json:"head_sha"`
	HeadCommit string    `json:"head_commit"`
	RunNumber  int       `json:"run_number"`
	Attempt    int       `json:"attempt"`
}

type PipelineStats struct {
	TotalRuns      int     `json:"total_runs"`
	SuccessfulRuns int     `json:"successful_runs"`
	FailedRuns     int     `json:"failed_runs"`
	SuccessRate    float64 `json:"success_rate"`
	AvgDuration    string  `json:"avg_duration"`
}

func NewCICDService(token string) *CICDService {
	client := createGitHubClient(token)
	return &CICDService{
		githubClient: client,
	}
}

// createGitHubClient creates a new GitHub client with authentication
func createGitHubClient(token string) *github.Client {
	if token == "" {
		return github.NewClient(nil)
	}

	ctx := context.Background()
	ts := oauth2.StaticTokenSource(&oauth2.Token{AccessToken: token})
	tc := oauth2.NewClient(ctx, ts)
	return github.NewClient(tc)
}

// GetWorkflowRuns fetches workflow runs for a repository
func (s *CICDService) GetWorkflowRuns(owner, repo string, limit int) ([]WorkflowRun, error) {
	ctx := context.Background()

	opts := &github.ListWorkflowRunsOptions{
		ListOptions: github.ListOptions{
			PerPage: limit,
		},
	}

	runs, _, err := s.githubClient.Actions.ListRepositoryWorkflowRuns(ctx, owner, repo, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch workflow runs: %v", err)
	}

	var workflowRuns []WorkflowRun
	for _, run := range runs.WorkflowRuns {
		conclusion := ""
		if run.Conclusion != nil {
			conclusion = *run.Conclusion
		}

		headCommit := ""
		if run.HeadCommit != nil && run.HeadCommit.Message != nil {
			headCommit = *run.HeadCommit.Message
			if len(headCommit) > 50 {
				headCommit = headCommit[:50] + "..."
			}
		}

		headSHA := ""
		if run.HeadSHA != nil {
			headSHA = *run.HeadSHA
			if len(headSHA) > 7 {
				headSHA = headSHA[:7]
			}
		}

		workflowRuns = append(workflowRuns, WorkflowRun{
			ID:         *run.ID,
			Name:       *run.Name,
			Status:     *run.Status,
			Conclusion: conclusion,
			Branch:     *run.HeadBranch,
			Event:      *run.Event,
			CreatedAt:  run.CreatedAt.Time,
			UpdatedAt:  run.UpdatedAt.Time,
			URL:        *run.HTMLURL,
			HeadSHA:    headSHA,
			HeadCommit: headCommit,
			RunNumber:  *run.RunNumber,
			Attempt:    *run.RunAttempt,
		})
	}

	return workflowRuns, nil
}

// GetPipelineStats calculates statistics for workflow runs
func (s *CICDService) GetPipelineStats(owner, repo string) (*PipelineStats, error) {
	ctx := context.Background()

	opts := &github.ListWorkflowRunsOptions{
		ListOptions: github.ListOptions{
			PerPage: 100,
		},
	}

	runs, _, err := s.githubClient.Actions.ListRepositoryWorkflowRuns(ctx, owner, repo, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch workflow runs: %v", err)
	}

	stats := &PipelineStats{
		TotalRuns: len(runs.WorkflowRuns),
	}

	var totalDuration time.Duration
	for _, run := range runs.WorkflowRuns {
		if run.Conclusion != nil {
			if *run.Conclusion == "success" {
				stats.SuccessfulRuns++
			} else if *run.Conclusion == "failure" {
				stats.FailedRuns++
			}
		}

		if run.CreatedAt != nil && run.UpdatedAt != nil {
			duration := run.UpdatedAt.Time.Sub(run.CreatedAt.Time)
			totalDuration += duration
		}
	}

	if stats.TotalRuns > 0 {
		stats.SuccessRate = (float64(stats.SuccessfulRuns) / float64(stats.TotalRuns)) * 100
		avgDuration := totalDuration / time.Duration(stats.TotalRuns)
		stats.AvgDuration = fmt.Sprintf("%dm %ds", int(avgDuration.Minutes()), int(avgDuration.Seconds())%60)
	}

	return stats, nil
}

// GetWorkflows lists all workflows in a repository
func (s *CICDService) GetWorkflows(owner, repo string) ([]*github.Workflow, error) {
	ctx := context.Background()

	workflows, _, err := s.githubClient.Actions.ListWorkflows(ctx, owner, repo, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch workflows: %v", err)
	}

	return workflows.Workflows, nil
}
