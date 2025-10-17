import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { Item, CreateItemRequest, UpdateItemRequest, ApiResponse } from '../types/item';
import { Project, CreateProjectRequest } from '../types/project';
import { Task, CreateTaskRequest } from '../types/task';
import { Container, ContainerLogs } from '../types/container';
import { GitHubPR, GitHubIssue, SyncPRsRequest, SyncIssuesRequest } from '../types/github';
import { Pod, Deployment, Service, Namespace } from '../types/kubernetes';
import { WorkflowRun, PipelineStats, Workflow } from '../types/cicd';


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==================== Health Check ====================
export const healthCheck = async (): Promise<any> => {
  const response = await axios.get('http://localhost:8080/health');
  return response.data;
};

// ==================== Items (Original) ====================
export const getItems = async (): Promise<Item[]> => {
  const response = await apiClient.get<ApiResponse<Item[]>>('/items');
  return response.data.data || [];
};

export const getItem = async (id: number): Promise<Item> => {
  const response = await apiClient.get<ApiResponse<Item>>(`/items/${id}`);
  return response.data.data!;
};

export const createItem = async (data: CreateItemRequest): Promise<Item> => {
  const response = await apiClient.post<ApiResponse<Item>>('/items', data);
  return response.data.data!;
};

export const updateItem = async (id: number, data: UpdateItemRequest): Promise<Item> => {
  const response = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, data);
  return response.data.data!;
};

export const deleteItem = async (id: number): Promise<void> => {
  await apiClient.delete(`/items/${id}`);
};

// ==================== Projects (NEW) ====================
export const getProjects = async (): Promise<Project[]> => {
  const response = await apiClient.get<ApiResponse<Project[]>>('/projects');
  return response.data.data || [];
};

export const getProject = async (id: number): Promise<Project> => {
  const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data.data!;
};

export const createProject = async (data: CreateProjectRequest): Promise<Project> => {
  const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
  return response.data.data!;
};

export const updateProject = async (id: number, data: Partial<CreateProjectRequest>): Promise<Project> => {
  const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
  return response.data.data!;
};

export const deleteProject = async (id: number): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

export const getProjectStats = async (): Promise<any> => {
  const response = await apiClient.get('/projects/stats');
  return response.data.data;
};

// ==================== Tasks (NEW) ====================
export const getTasks = async (projectId?: number): Promise<Task[]> => {
  const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
  const response = await apiClient.get<ApiResponse<Task[]>>(url);
  return response.data.data || [];
};

export const getTask = async (id: number): Promise<Task> => {
  const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
  return response.data.data!;
};

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
  return response.data.data!;
};

export const updateTask = async (id: number, data: Partial<CreateTaskRequest>): Promise<Task> => {
  const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
  return response.data.data!;
};

export const deleteTask = async (id: number): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

export const getTaskStats = async (): Promise<any> => {
  const response = await apiClient.get('/tasks/stats');
  return response.data.data;
};

export const getContainers = async (): Promise<Container[]> => {
  const response = await apiClient.get<ApiResponse<Container[]>>('/containers');
  return response.data.data || [];
};

export const getContainerLogs = async (containerId: string, tail: number = 100): Promise<string> => {
  const response = await apiClient.get<ApiResponse<ContainerLogs>>(`/containers/${containerId}/logs?tail=${tail}`);
  return response.data.data?.logs || '';
};

export const getGitHubPRs = async (token: string, username: string): Promise<GitHubPR[]> => {
  const response = await apiClient.get<ApiResponse<GitHubPR[]>>(
    `/github/prs?token=${token}&username=${username}`
  );
  return response.data.data || [];
};

export const getGitHubIssues = async (token: string, owner: string, repo: string): Promise<GitHubIssue[]> => {
  const response = await apiClient.get<ApiResponse<GitHubIssue[]>>(
    `/github/issues?token=${token}&owner=${owner}&repo=${repo}`
  );
  return response.data.data || [];
};

export const syncPRsToTasks = async (data: SyncPRsRequest): Promise<void> => {
  await apiClient.post('/github/sync-prs', data);
};

export const syncIssuesToTasks = async (data: SyncIssuesRequest): Promise<void> => {
  await apiClient.post('/github/sync-issues', data);
};

//  Kubernetes 
export const getK8sPods = async (namespace: string = 'all'): Promise<Pod[]> => {
  const response = await apiClient.get<ApiResponse<Pod[]>>(`/kubernetes/pods?namespace=${namespace}`);
  return response.data.data || [];
};

export const getK8sDeployments = async (namespace: string = 'all'): Promise<Deployment[]> => {
  const response = await apiClient.get<ApiResponse<Deployment[]>>(`/kubernetes/deployments?namespace=${namespace}`);
  return response.data.data || [];
};

export const getK8sServices = async (namespace: string = 'all'): Promise<Service[]> => {
  const response = await apiClient.get<ApiResponse<Service[]>>(`/kubernetes/services?namespace=${namespace}`);
  return response.data.data || [];
};

export const getK8sNamespaces = async (): Promise<Namespace[]> => {
  const response = await apiClient.get<ApiResponse<Namespace[]>>('/kubernetes/namespaces');
  return response.data.data || [];
};

export const getK8sPodLogs = async (namespace: string, podName: string, lines: number = 100): Promise<string> => {
  const response = await apiClient.get<ApiResponse<{ logs: string }>>(
    `/kubernetes/pods/${namespace}/${podName}/logs?lines=${lines}`
  );
  return response.data.data?.logs || '';
};

// ==================== CI/CD Pipeline (NEW) ====================
export const getWorkflowRuns = async (
  token: string,
  owner: string,
  repo: string,
  limit: number = 20
): Promise<WorkflowRun[]> => {
  const response = await apiClient.get<ApiResponse<WorkflowRun[]>>(
    `/cicd/runs?token=${token}&owner=${owner}&repo=${repo}&limit=${limit}`
  );
  return response.data.data || [];
};

export const getPipelineStats = async (
  token: string,
  owner: string,
  repo: string
): Promise<PipelineStats> => {
  const response = await apiClient.get<ApiResponse<PipelineStats>>(
    `/cicd/stats?token=${token}&owner=${owner}&repo=${repo}`
  );
  return response.data.data || {
    total_runs: 0,
    successful_runs: 0,
    failed_runs: 0,
    success_rate: 0,
    avg_duration: '0m 0s',
  };
};

export const getWorkflows = async (
  token: string,
  owner: string,
  repo: string
): Promise<Workflow[]> => {
  const response = await apiClient.get<ApiResponse<Workflow[]>>(
    `/cicd/workflows?token=${token}&owner=${owner}&repo=${repo}`
  );
  return response.data.data || [];
};