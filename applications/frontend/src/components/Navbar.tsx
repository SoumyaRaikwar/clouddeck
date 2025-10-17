import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Folder as FolderIcon,
  Assignment as TaskIcon,
  ViewModule as ContainerIcon,
  GitHub as GitHubIcon,
  CloudQueue as K8sIcon,
  Timeline as CICDIcon 
} from '@mui/icons-material';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Projects', path: '/projects', icon: <FolderIcon /> },
    { label: 'Tasks', path: '/tasks', icon: <TaskIcon /> },
    { label: 'Containers', path: '/containers', icon: <ContainerIcon /> },
    { label: 'GitHub', path: '/github', icon: <GitHubIcon /> },
    { label: 'Kubernetes', path: '/kubernetes', icon: <K8sIcon /> },
    { label: 'CI/CD', path: '/cicd', icon: <CICDIcon /> },
  ];

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            component="div"
            sx={{ flexGrow: 0, fontWeight: 700, mr: 4, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            🚢 CloudOps Hub
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Kubernetes Project Management
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
