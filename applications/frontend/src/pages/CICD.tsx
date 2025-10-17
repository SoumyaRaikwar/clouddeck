import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Cancel as FailedIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { getWorkflowRuns, getPipelineStats } from '../services/api';
import { WorkflowRun, PipelineStats } from '../types/cicd';

const CICD: React.FC = () => {
  const [token, setToken] = useState(localStorage.getItem('github_token') || '');
  const [owner, setOwner] = useState(localStorage.getItem('cicd_owner') || 'jaegertracing');
  const [repo, setRepo] = useState(localStorage.getItem('cicd_repo') || 'jaeger');
  
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token && owner && repo) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    if (!token || !owner || !repo) {
      setError('Please enter GitHub token, owner, and repository');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Save to localStorage
      localStorage.setItem('github_token', token);
      localStorage.setItem('cicd_owner', owner);
      localStorage.setItem('cicd_repo', repo);

      // Fetch workflow runs and stats
      const [runsData, statsData] = await Promise.all([
        getWorkflowRuns(token, owner, repo, 20),
        getPipelineStats(token, owner, repo),
      ]);

      setRuns(runsData);
      setStats(statsData);
      setSuccess(`Loaded ${runsData.length} workflow runs from ${owner}/${repo}`);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CI/CD data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, conclusion: string) => {
    if (status === 'completed') {
      if (conclusion === 'success') {
        return <SuccessIcon color="success" />;
      } else if (conclusion === 'failure') {
        return <FailedIcon color="error" />;
      }
    }
    return <PendingIcon color="warning" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          CI/CD Pipeline Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor GitHub Actions workflows and build pipelines
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

      {/* Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Repository Configuration
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
              label="Owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              placeholder="jaegertracing"
              sx={{ flex: 1, minWidth: '150px' }}
              size="small"
            />
            <TextField
              label="Repository"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="jaeger"
              sx={{ flex: 1, minWidth: '150px' }}
              size="small"
            />
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Load Pipelines
            </Button>
          </Box>
          <Alert severity="info" icon={<TrendingIcon />}>
            Examples: <strong>jaegertracing/jaeger</strong>, <strong>goharbor/harbor</strong>,{' '}
            <strong>kubernetes/kube-state-metrics</strong>
          </Alert>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {stats && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Runs
              </Typography>
              <Typography variant="h4">{stats.total_runs}</Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Successful
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.successful_runs}
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.failed_runs}
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4">{stats.success_rate.toFixed(1)}%</Typography>
              <LinearProgress
                variant="determinate"
                value={stats.success_rate}
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Workflow Runs Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        runs.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Workflow Runs ({runs.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Workflow</TableCell>
                      <TableCell>Run #</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Commit</TableCell>
                      <TableCell>Event</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {runs.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell>
                          <Tooltip title={`${run.status} - ${run.conclusion || 'pending'}`}>
                            <Box>{getStatusIcon(run.status, run.conclusion)}</Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {run.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`#${run.run_number}`} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={run.branch} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={run.head_commit}>
                            <Typography
                              variant="body2"
                              sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                            >
                              {run.head_sha}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Chip label={run.event} size="small" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(run.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            href={run.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )
      )}
    </Container>
  );
};

export default CICD;
