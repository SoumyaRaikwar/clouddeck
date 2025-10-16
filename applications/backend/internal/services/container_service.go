package services

import (
	"encoding/json"
	"os/exec"
	"strconv"
	"strings"
	"fmt"

	"github.com/SoumyaRaikwar/clouddeck-backend/internal/models"
)

type ContainerService struct{}

func NewContainerService() (*ContainerService, error) {
	return &ContainerService{}, nil
}

type dockerContainer struct {
	ID     string `json:"ID"`
	Names  string `json:"Names"`
	Status string `json:"Status"`
	State  string `json:"State"`
	Image  string `json:"Image"`
}

func (s *ContainerService) GetAllContainers() ([]models.ContainerStats, error) {
	cmd := exec.Command("docker", "ps", "-a", "--format", "{{json .}}")
	output, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	lines := strings.Split(string(output), "\n")
	var stats []models.ContainerStats

	for _, line := range lines {
		if line == "" {
			continue
		}

		var container dockerContainer
		if err := json.Unmarshal([]byte(line), &container); err != nil {
			continue
		}

		stat := models.ContainerStats{
			ContainerID: container.ID,
			Name:        strings.TrimPrefix(container.Names, "/"),
			Status:      container.State,
			Image:       container.Image,
			CPUPercent:  0,
			MemoryUsage: 0,
			MemoryLimit: 0,
		}

		// Get stats for running containers
		if container.State == "running" {
			statsCmd := exec.Command("docker", "stats", container.ID, "--no-stream", "--format", "{{.CPUPerc}}|{{.MemUsage}}")
			if statsOutput, err := statsCmd.Output(); err == nil {
				parts := strings.Split(strings.TrimSpace(string(statsOutput)), "|")
				if len(parts) >= 2 {
					// Parse CPU percentage (e.g., "12.34%" -> 12.34)
					cpuStr := strings.TrimSuffix(strings.TrimSpace(parts[0]), "%")
					if cpu, err := strconv.ParseFloat(cpuStr, 64); err == nil {
						stat.CPUPercent = cpu
					}

					// Parse Memory (e.g., "123.4MiB / 1.5GiB" -> 123400000 bytes)
					memStr := strings.TrimSpace(parts[1])
					memParts := strings.Split(memStr, " / ")
					if len(memParts) >= 2 {
						stat.MemoryUsage = parseMemory(memParts[0])
						stat.MemoryLimit = parseMemory(memParts[1])
					}
				}
			}
		}

		stats = append(stats, stat)
	}

	return stats, nil
}

func (s *ContainerService) GetContainerLogs(containerID string, tail string) (string, error) {
	cmd := exec.Command("docker", "logs", "--tail", tail, containerID)
	output, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return string(output), nil
}

// parseMemory converts memory strings like "123.4MiB" or "1.5GiB" to bytes
func parseMemory(memStr string) int64 {
	memStr = strings.TrimSpace(memStr)
	
	// Extract number and unit
	var value float64
	var unit string
	
	if _, err := fmt.Sscanf(memStr, "%f%s", &value, &unit); err != nil {
		return 0
	}

	// Convert to bytes
	switch strings.ToUpper(unit) {
	case "B":
		return int64(value)
	case "KIB", "KB":
		return int64(value * 1024)
	case "MIB", "MB":
		return int64(value * 1024 * 1024)
	case "GIB", "GB":
		return int64(value * 1024 * 1024 * 1024)
	default:
		return 0
	}
}
