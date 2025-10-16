import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { getTasks, createTask, updateTask, deleteTask, getProjects } from '../services/api';
import { Task, CreateTaskRequest } from '../types/task';
import { Project } from '../types/project';

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskRequest>({
    projectId: 0,
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    labels: '',
    assignee: '',
    estimatedHours: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([getTasks(), getProjects()]);
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        projectId: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        labels: task.labels,
        assignee: task.assignee,
        estimatedHours: task.estimatedHours,
      });
    } else {
      setEditingTask(null);
      setFormData({
        projectId: projects.length > 0 ? projects[0].id : 0,
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        labels: '',
        assignee: '',
        estimatedHours: 0,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
      } else {
        await createTask(formData);
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        fetchData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus as any });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const groupedTasks = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    review: tasks.filter((t) => t.status === 'review'),
    done: tasks.filter((t) => t.status === 'done'),
  };

  const priorityColors: Record<string, any> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    urgent: 'error',
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage tasks across all projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={projects.length === 0}
        >
          New Task
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Alert severity="warning">
          Create a project first before adding tasks!
        </Alert>
      ) : tasks.length === 0 ? (
        <Alert severity="info">
          No tasks yet. Create your first task to get started!
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {/* Todo Column */}
          <Box>
            <Box sx={{ bgcolor: '#e3f2fd', p: 1.5, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                📋 Todo ({groupedTasks.todo.length})
              </Typography>
            </Box>
            {groupedTasks.todo.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                priorityColors={priorityColors}
              />
            ))}
          </Box>

          {/* In Progress Column */}
          <Box>
            <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                🚧 In Progress ({groupedTasks.in_progress.length})
              </Typography>
            </Box>
            {groupedTasks.in_progress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                priorityColors={priorityColors}
              />
            ))}
          </Box>

          {/* Review Column */}
          <Box>
            <Box sx={{ bgcolor: '#f3e5f5', p: 1.5, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                👀 Review ({groupedTasks.review.length})
              </Typography>
            </Box>
            {groupedTasks.review.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                priorityColors={priorityColors}
              />
            ))}
          </Box>

          {/* Done Column */}
          <Box>
            <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                ✅ Done ({groupedTasks.done.length})
              </Typography>
            </Box>
            {groupedTasks.done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                priorityColors={priorityColors}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Project</InputLabel>
            <Select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: Number(e.target.value) })}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="review">Review</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </TextField>

            <TextField
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </TextField>
          </Box>

          <TextField
            margin="dense"
            label="Labels (comma-separated)"
            fullWidth
            value={formData.labels}
            onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
            placeholder="bug, feature, kubernetes"
          />

          <TextField
            margin="dense"
            label="Assignee"
            fullWidth
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
          />

          <TextField
            margin="dense"
            label="Estimated Hours"
            type="number"
            fullWidth
            value={formData.estimatedHours}
            onChange={(e) => setFormData({ ...formData, estimatedHours: Number(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// TaskCard Component
const TaskCard: React.FC<{
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  priorityColors: Record<string, any>;
}> = ({ task, onEdit, onDelete, onStatusChange, priorityColors }) => {
  return (
    <Card sx={{ mb: 2, cursor: 'pointer' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {task.title}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => onEdit(task)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(task.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {task.description.substring(0, 80)}...
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
          <Chip label={task.priority} size="small" color={priorityColors[task.priority]} />
          {task.labels && task.labels.split(',').slice(0, 2).map((label, idx) => (
            <Chip key={idx} label={label.trim()} size="small" variant="outlined" />
          ))}
        </Box>

        {task.assignee && (
          <Typography variant="caption" color="text.secondary">
            👤 {task.assignee}
          </Typography>
        )}

        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <Select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value)}
            size="small"
          >
            <MenuItem value="todo">Todo</MenuItem>
            <MenuItem value="in_progress">In Progress</MenuItem>
            <MenuItem value="review">Review</MenuItem>
            <MenuItem value="done">Done</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
};

export default Tasks;
