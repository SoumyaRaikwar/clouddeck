import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Sync as SyncIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import {
  getAllGitOpsApps,
  createGitOpsApp,
  syncGitOpsApp,
  deleteGitOpsApp,
} from '../services/api';
import { GitOpsApp, CreateGitOpsAppRequest } from '../types/gitops';

const GitOps: React.FC = () => {
  const [apps, setApps] = useState<GitOpsApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [syncing, setSyncing] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [formData, setFormData] = useState<CreateGitOpsAppRequest>({
    name: '',
    repo_url: '',
    branch: 'main',
    path: '',
    namespace: 'default',
  });

  const fetchApps = async () => {
    try {
      setLoading(true);
      const data = await getAllGitOpsApps();
      setApps(data);
      setError('');
    } catch (err: any) {
      setError('Failed to fetch GitOps apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateApp = async () => {
    try {
      await createGitOpsApp(formData);
      setSuccess('GitOps app created successfully!');
      setOpenDialog(false);
      setFormData({
        name: '',
        repo_url: '',
        branch: 'main',
        path: '',
        namespace: 'default',
      });
      fetchApps();
    } catch (err: any) {
      setError('Failed to create app');
    }
  };

  const handleSync = async (id: number) => {
    try {
      setSyncing(id);
      await syncGitOpsApp(id);
      setSuccess('Sync initiated successfully!');
      setTimeout(fetchApps, 2000);
    } catch (err: any) {
      setError('Failed to sync app');
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this app?')) return;

    try {
      await deleteGitOpsApp(id);
      setSuccess('App deleted successfully!');
      fetchApps();
    } catch (err: any) {
      setError('Failed to delete app');
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Synced':
        return { color: 'success' as const, icon: <CheckCircleIcon /> };
      case 'OutOfSync':
        return { color: 'error' as const, icon: <ErrorIcon /> };
      default:
        return { color: 'default' as const, icon: <HelpIcon /> };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          GitOps Applications
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Application
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Stats Cards - Using CSS Grid instead of MUI Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 3,
        }}
      >
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Applications
            </Typography>
            <Typography variant="h3">{apps.length}</Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Synced
            </Typography>
            <Typography variant="h3" color="success.main">
              {apps.filter((a) => a.sync_status === 'Synced').length}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Out of Sync
            </Typography>
            <Typography variant="h3" color="error.main">
              {apps.filter((a) => a.sync_status === 'OutOfSync').length}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Apps Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Repository</strong></TableCell>
              <TableCell><strong>Branch</strong></TableCell>
              <TableCell><strong>Namespace</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Last Synced</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">
                    No GitOps applications configured. Create one to get started!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              apps.map((app) => {
                const statusDisplay = getStatusDisplay(app.sync_status);
                return (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GitHubIcon color="action" />
                        <strong>{app.name}</strong>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {app.repo_url}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={app.branch} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={app.namespace} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={statusDisplay.icon}
                        label={app.sync_status}
                        color={statusDisplay.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {app.last_synced
                        ? new Date(app.last_synced).toLocaleString()
                        : 'Never'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => handleSync(app.id)}
                        disabled={syncing === app.id}
                        color="primary"
                        size="small"
                      >
                        {syncing === app.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SyncIcon />
                        )}
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(app.id)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create App Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create GitOps Application</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Application Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Repository URL"
              value={formData.repo_url}
              onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
              placeholder="https://github.com/username/repo"
              fullWidth
              required
            />
            <TextField
              label="Branch"
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Manifests Path"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="k8s/ or manifests/"
              fullWidth
              required
            />
            <TextField
              label="Namespace"
              value={formData.namespace}
              onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateApp}
            variant="contained"
            disabled={!formData.name || !formData.repo_url}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GitOps;
