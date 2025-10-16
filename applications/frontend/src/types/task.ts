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
}

export interface CreateTaskRequest {
  projectId: number;
  title: string;
  description: string;
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  labels?: string;
  assignee?: string;
  dueDate?: string;
  estimatedHours?: number;
}
