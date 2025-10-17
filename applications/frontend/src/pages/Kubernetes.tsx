import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Description as LogsIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CloudQueue as K8sIcon,
} from '@mui/icons-material';
import {
  getK8sPods,
  getK8sDeployments,
  getK8sServices,
  getK8sNamespaces,
  getK8sPodLogs,
} from '../services/api';
import { Pod, Deployment, Service, Namespace } from '../types/kubernetes';

const Kubernetes: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [namespace, setNamespace] = useState('all');
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logsDialog, setLogsDialog] = useState(false);
  const [selectedPod, setSelectedPod] = useState<Pod | null>(null);
  const [logs, setLogs] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    fetchNamespaces();
    fetchData();
  }, []);

  useEffect(() => {
    if (namespace) {
      fetchData();
    }
  }, [namespace, tab]);

  const fetchNamespaces = async () => {
    try {
      const data = await getK8sNamespaces();
      setNamespaces(data);
    } catch (err: any) {
      console.error('Failed to fetch namespaces:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 0) {
        const data = await getK8sPods(namespace);
        setPods(data);
      } else if (tab === 1) {
        const data = await getK8sDeployments(namespace);
        setDeployments(data);
      } else if (tab === 2) {
        const data = await getK8sServices(namespace);
        setServices(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch Kubernetes resources');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async (pod: Pod) => {
    setSelectedPod(pod);
    setLogsDialog(true);
    setLoadingLogs(true);

    try {
      const logsData = await getK8sPodLogs(pod.namespace, pod.name);
      setLogs(logsData);
    } catch (err: any) {
      setLogs(`Error fetching logs: ${err.message}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return <CheckIcon color="success" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      case 'failed':
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatAge = (age: string) => {
    try {
      const date = new Date(age);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      return '< 1h';
    } catch {
      return 'N/A';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            <K8sIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Kubernetes Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and manage your Kubernetes cluster
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Namespace</InputLabel>
            <Select value={namespace} onChange={(e) => setNamespace(e.target.value)} label="Namespace">
              <MenuItem value="all">All Namespaces</MenuItem>
              {namespaces.map((ns) => (
                <MenuItem key={ns.name} value={ns.name}>
                  {ns.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton onClick={fetchData} color="primary" disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
          <Tab label={`Pods (${pods.length})`} />
          <Tab label={`Deployments (${deployments.length})`} />
          <Tab label={`Services (${services.length})`} />
        </Tabs>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Pods Table */}
          {tab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Namespace</TableCell>
                    <TableCell>Node</TableCell>
                    <TableCell>Restarts</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>IP</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pods.map((pod) => (
                    <TableRow key={`${pod.namespace}-${pod.name}`}>
                      <TableCell>
                        <Tooltip title={pod.status}>
                          {getStatusIcon(pod.status)}
                        </Tooltip>
                      </TableCell>
                      <TableCell>{pod.name}</TableCell>
                      <TableCell>
                        <Chip label={pod.namespace} size="small" />
                      </TableCell>
                      <TableCell>{pod.node || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={pod.restarts}
                          size="small"
                          color={pod.restarts > 0 ? 'warning' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{formatAge(pod.age)}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {pod.ip || 'N/A'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={pod.image}>
                          <span>{pod.image}</span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleViewLogs(pod)}>
                          <LogsIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Deployments Table */}
          {tab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Namespace</TableCell>
                    <TableCell>Replicas</TableCell>
                    <TableCell>Ready</TableCell>
                    <TableCell>Up-to-date</TableCell>
                    <TableCell>Available</TableCell>
                    <TableCell>Age</TableCell>
                    <TableCell>Image</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deployments.map((deploy) => (
                    <TableRow key={`${deploy.namespace}-${deploy.name}`}>
                      <TableCell>{deploy.name}</TableCell>
                      <TableCell>
                        <Chip label={deploy.namespace} size="small" />
                      </TableCell>
                      <TableCell>{deploy.replicas}</TableCell>
                      <TableCell>
                        <Chip
                          label={`${deploy.ready_replicas}/${deploy.replicas}`}
                          size="small"
                          color={deploy.ready_replicas === deploy.replicas ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{deploy.updated_replicas}</TableCell>
                      <TableCell>{deploy.available_replicas}</TableCell>
                      <TableCell>{formatAge(deploy.age)}</TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <Tooltip title={deploy.image}>
                          <span>{deploy.image}</span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Services Table */}
          {tab === 2 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Namespace</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Cluster IP</TableCell>
                    <TableCell>Ports</TableCell>
                    <TableCell>Age</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {services.map((svc) => (
                    <TableRow key={`${svc.namespace}-${svc.name}`}>
                      <TableCell>{svc.name}</TableCell>
                      <TableCell>
                        <Chip label={svc.namespace} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={svc.type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {svc.cluster_ip}
                      </TableCell>
                      <TableCell>
                        {svc.ports.map((port, idx) => (
                          <Chip key={idx} label={port} size="small" sx={{ mr: 0.5 }} />
                        ))}
                      </TableCell>
                      <TableCell>{formatAge(svc.age)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Logs Dialog */}
      <Dialog open={logsDialog} onClose={() => setLogsDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Pod Logs: {selectedPod?.name}
          <Typography variant="caption" display="block" color="text.secondary">
            Namespace: {selectedPod?.namespace}
          </Typography>
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
                maxHeight: '500px',
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

export default Kubernetes;
