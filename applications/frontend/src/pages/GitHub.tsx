import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Sync as SyncIcon,
  OpenInNew as OpenIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { getGitHubPRs, getGitHubIssues, syncPRsToTasks, syncIssuesToTasks, getProjects } from '../services/api';
import { GitHubPR, GitHubIssue } from '../types/github';
import { Project } from '../types/project';

const GitHub: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('github_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('github_username') || '');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  
  const [prs, setPRs] = useState<GitHubPR[]>([]);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number>(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncDialog, setSyncDialog] = useState(false);
  const [syncType, setSyncType] = useState<'prs' | 'issues'>('prs');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      if (data.length > 0) setSelectedProject(data[0].id);
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const handleFetchPRs = async () => {
    if (!token || !username) {
      setError('Please enter both GitHub token and username');
      return;
    }

    setLoading(true);
    setError('');
    try {
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_username', username);
      
      const data = await getGitHubPRs(token, username);
      setPRs(data);
      setSuccess(`Fetched ${data.length} PRs!`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch PRs');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchIssues = async () => {
    if (!token || !owner || !repo) {
      setError('Please enter token, owner, and repo');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getGitHubIssues(token, owner, repo);
      setIssues(data);
      setSuccess(`Fetched ${data.length} issues from ${owner}/${repo}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncPRs = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    try {
      await syncPRsToTasks({ token, username, project_id: selectedProject });
      setSuccess('PRs synced to tasks successfully!');
      setSyncDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sync PRs');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncIssues = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    try {
      await syncIssuesToTasks({ token, owner, repo, project_id: selectedProject });
      setSuccess('Issues synced to tasks successfully!');
      setSyncDialog(false);
    } catch (err: any) {
      setError(err.message || 'Failed to sync issues');
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state: string) => {
    return state === 'open' ? 'success' : 'default';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <GitHubIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          GitHub Integration
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sync your PRs and issues to tasks
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* GitHub Token Setup */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔑 GitHub Settings
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              label="GitHub Token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxx"
              sx={{ flex: 1, minWidth: '200px' }}
              size="small"
            />
            <TextField
              label="GitHub Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your-username"
              sx={{ flex: 1, minWidth: '200px' }}
              size="small"
            />
          </Box>
          <Alert severity="info" icon={<InfoIcon />}>
            Create a token at{' '}
            <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer">
              github.com/settings/tokens
            </a>{' '}
            with <strong>repo</strong> and <strong>read:user</strong> permissions
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label="My PRs" />
          <Tab label="Repo Issues" />
        </Tabs>
      </Box>

      {/* Tab 1: PRs */}
      {tab === 0 && (
        <Box>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SyncIcon />}
            onClick={handleFetchPRs}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            Fetch My PRs
          </Button>

          {prs.length > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Your Pull Requests ({prs.length})</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSyncType('prs');
                    setSyncDialog(true);
                  }}
                >
                  Sync to Tasks
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gap: 2 }}>
                {prs.map((pr) => (
                  <Card key={pr.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {pr.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                            <Chip label={pr.repo} size="small" />
                            <Chip label={pr.state} size="small" color={getStateColor(pr.state)} />
                            {pr.labels && <Chip label={pr.labels} size="small" variant="outlined" />}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            Created: {new Date(pr.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <IconButton href={pr.url} target="_blank" size="small">
                          <OpenIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Tab 2: Issues */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="jaegertracing"
              size="small"
              sx={{ flex: 1, minWidth: '150px' }}
            />
            <TextField
              label="Repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="jaeger"
              size="small"
              sx={{ flex: 1, minWidth: '150px' }}
            />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <SyncIcon />}
              onClick={handleFetchIssues}
              disabled={loading}
            >
              Fetch Issues
            </Button>
          </Box>

          {issues.length > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Issues from {owner}/{repo} ({issues.length})
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSyncType('issues');
                    setSyncDialog(true);
                  }}
                >
                  Sync to Tasks
                </Button>
              </Box>

              <Box sx={{ display: 'grid', gap: 2 }}>
                {issues.map((issue) => (
                  <Card key={issue.id}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            #{issue.id}: {issue.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {issue.body?.substring(0, 150)}...
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip label={issue.state} size="small" color={getStateColor(issue.state)} />
                            {issue.labels && <Chip label={issue.labels} size="small" variant="outlined" />}
                            {issue.assignee && <Chip label={`@${issue.assignee}`} size="small" />}
                          </Box>
                        </Box>
                        <IconButton href={issue.url} target="_blank" size="small">
                          <OpenIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Sync Dialog */}
      <Dialog open={syncDialog} onClose={() => setSyncDialog(false)}>
        <DialogTitle>Sync to Project</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Project</InputLabel>
            <Select value={selectedProject} onChange={(e) => setSelectedProject(Number(e.target.value))}>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialog(false)}>Cancel</Button>
          <Button
            onClick={syncType === 'prs' ? handleSyncPRs : handleSyncIssues}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Syncing...' : 'Sync'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GitHub;
