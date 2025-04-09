import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import SystemStart from './Components/SystemStart';
import MainLayout from './Components/Layout/MainLayout';
import Dashboard from './Components/Dashboard/Dashboard';
import NFFImport from './Components/Dashboard/NFFImport';
import FeeConfig from './Components/FeeConfiguration/FeeConfig';
import DepartmentAccessManagement from './Components/Dashboard/DepartmentAccessManagement';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<SystemStart />} />
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="nff-import" element={<NFFImport />} />
          <Route path="fee-config" element={<FeeConfig />} />
          <Route path="department-access" element={<DepartmentAccessManagement />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
