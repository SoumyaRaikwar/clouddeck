import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Containers from './pages/Containers'; 
import GitHub from './pages/GitHub';
import Kubernetes from './pages/Kubernetes';
import CICD from './pages/CICD';
import GitOps from './pages/GitOps'; 

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/containers" element={<Containers />} />
          <Route path="/github" element={<GitHub />} />
          <Route path="/kubernetes" element={<Kubernetes />} />
          <Route path="/cicd" element={<CICD />} />
          <Route path="/gitops" element={<GitOps />} /> 
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
