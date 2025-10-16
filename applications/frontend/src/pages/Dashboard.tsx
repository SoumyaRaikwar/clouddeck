import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Folder as FolderIcon,
  Assignment as TaskIcon,
  TrendingUp as TrendingIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { 
  healthCheck, 
  getItems, 
  createItem, 
  updateItem, 
  deleteItem,
  getProjects, 
  getTasks,
} from '../services/api';
import { Item, CreateItemRequest } from '../types/item';
import { useNavigate } from 'react-router-dom';
import ItemCard from '../components/ItemCard';
import ItemForm from '../components/ItemForm';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [items, setItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [health, itemsData, projectsData, tasksData] = await Promise.all([
        healthCheck(),
        getItems(),
        getProjects(),
        getTasks(),
      ]);

      setHealthStatus(health.status);
      setItems(itemsData);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateItemRequest) => {
    try {
      await createItem(data);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create item');
    }
  };

  const handleUpdate = async (data: CreateItemRequest) => {
    if (!editingItem) return;
    try {
      await updateItem(editingItem.id, data);
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        fetchData();
      } catch (err: any) {
        setError(err.message || 'Failed to delete item');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          🚢 CloudOps Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Kubernetes Project & Task Management Platform
        </Typography>
        {healthStatus && (
          <Chip
            icon={<CheckIcon />}
            label={`Backend: ${healthStatus}`}
            color="success"
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stats Overview - Using Box Flexbox */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/projects')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <FolderIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {projects.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Projects
              </Typography>
              <Typography variant="caption" color="success.main">
                {activeProjects} active
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
          <Card sx={{ cursor: 'pointer', height: '100%' }} onClick={() => navigate('/tasks')}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TaskIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {tasks.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Tasks
              </Typography>
              <Typography variant="caption" color="warning.main">
                {inProgressTasks} in progress
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {completedTasks}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {completionRate.toFixed(0)}% done
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {todoTasks}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Todo
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Upcoming
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 180px', minWidth: '180px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <StorageIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {items.length}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Items
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Stored
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Task Progress Bars - Using Box Flexbox */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Task Progress Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">
              📋 Todo
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={tasks.length > 0 ? (todoTasks / tasks.length) * 100 : 0}
                sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" fontWeight={600}>
                {todoTasks}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">
              🚧 In Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={tasks.length > 0 ? (inProgressTasks / tasks.length) * 100 : 0}
                sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                color="warning"
              />
              <Typography variant="body2" fontWeight={600}>
                {inProgressTasks}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">
              👀 Review
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={tasks.length > 0 ? (reviewTasks / tasks.length) * 100 : 0}
                sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                color="secondary"
              />
              <Typography variant="body2" fontWeight={600}>
                {reviewTasks}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Typography variant="caption" color="text.secondary">
              ✅ Done
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{ flex: 1, mr: 1, height: 8, borderRadius: 4 }}
                color="success"
              />
              <Typography variant="body2" fontWeight={600}>
                {completedTasks}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Items Section */}
      <Box>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          Items Management
        </Typography>
        
        <ItemForm
          onSubmit={editingItem ? handleUpdate : handleCreate}
          onCancel={() => setEditingItem(null)}
          initialData={editingItem}
          isEdit={!!editingItem}
        />

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Items ({items.length})
          </Typography>
          {items.length === 0 ? (
            <Alert severity="info">
              No items found. Create your first item using the form above!
            </Alert>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={handleDelete}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Getting Started */}
      {projects.length === 0 && tasks.length === 0 && (
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            🚀 Get Started with CloudOps Hub
          </Typography>
          <Typography variant="body2">
            1. Navigate to <strong>Projects</strong> and create your first project<br />
            2. Go to <strong>Tasks</strong> and add tasks to track your work<br />
            3. Use the Kanban board to manage task progress
          </Typography>
        </Alert>
      )}
    </Container>
  );
};

export default Dashboard;
