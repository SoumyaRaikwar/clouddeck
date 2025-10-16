export interface Project {
  id: number;
  name: string;
  description: string;
  repoUrl: string;
  status: 'active' | 'completed' | 'archived';
  color: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface CreateProjectRequest {
  name: string;
  description: string;
  repoUrl?: string;
  status?: 'active' | 'completed' | 'archived';
  color?: string;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  labels: string;
  assignee: string;
  dueDate?: string;
  estimatedHours: number;
  createdAt: string;
  updatedAt: string;
  project?: Project;
}
