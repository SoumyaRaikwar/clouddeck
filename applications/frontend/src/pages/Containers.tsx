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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Description as LogsIcon,
} from '@mui/icons-material';
import { getContainers, getContainerLogs } from '../services/api';
import { Container as ContainerType } from '../types/container';

const Containers: React.FC = () => {
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logsDialog, setLogsDialog] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<ContainerType | null>(null);
  const [logs, setLogs] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const data = await getContainers();
      setContainers(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch containers');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async (container: ContainerType) => {
    setSelectedContainer(container);
    setLogsDialog(true);
    setLoadingLogs(true);

    try {
      const logsData = await getContainerLogs(container.containerId);
      setLogs(logsData);
    } catch (err: any) {
      setLogs(`Error fetching logs: ${err.message}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'success';
      case 'exited':
        return 'error';
      case 'paused':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && containers.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            🐳 Docker Containers
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time container monitoring and logs
          </Typography>
        </Box>
        <IconButton onClick={fetchContainers} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {containers.length === 0 ? (
        <Alert severity="info">
          No Docker containers found. Make sure Docker is running and you have containers.
        </Alert>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {containers.map((container) => (
            <Card key={container.containerId} sx={{ position: 'relative' }}>
              <CardContent>
                {/* Container Name & Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {container.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                      {container.containerId}
                    </Typography>
                  </Box>
                  <Chip
                    icon={container.status === 'running' ? <CheckCircleIcon /> : <CancelIcon />}
                    label={container.status}
                    color={getStatusColor(container.status)}
                    size="small"
                  />
                </Box>

                {/* Image */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📦 {container.image}
                </Typography>

                {/* Stats - Only show if running */}
                {container.status === 'running' && (
                  <>
                    {/* CPU Usage */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">CPU Usage</Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {container.cpuPercent.toFixed(2)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(container.cpuPercent, 100)}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={container.cpuPercent > 80 ? 'error' : container.cpuPercent > 50 ? 'warning' : 'primary'}
                      />
                    </Box>

                    {/* Memory Usage */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">Memory Usage</Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {formatBytes(container.memoryUsage)} / {formatBytes(container.memoryLimit)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(container.memoryUsage / container.memoryLimit) * 100}
                        sx={{ height: 8, borderRadius: 4 }}
                        color={
                          (container.memoryUsage / container.memoryLimit) > 0.8
                            ? 'error'
                            : (container.memoryUsage / container.memoryLimit) > 0.6
                            ? 'warning'
                            : 'success'
                        }
                      />
                    </Box>
                  </>
                )}

                {/* Actions */}
                <Button
                  size="small"
                  startIcon={<LogsIcon />}
                  onClick={() => handleViewLogs(container)}
                  fullWidth
                  variant="outlined"
                >
                  View Logs
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Logs Dialog */}
      <Dialog open={logsDialog} onClose={() => setLogsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Container Logs: {selectedContainer?.name}
        </DialogTitle>
        <DialogContent>
          {loadingLogs ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: '400px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {logs || 'No logs available'}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Containers;
