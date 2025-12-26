import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/Placeholder';
import Account from './pages/Account';
import Onboarding from './pages/Onboarding';
import CompanySettings from './pages/CompanySettings';
import Home from './pages/Home';
import Settings from './pages/Settings';
import SettingsLayout from './pages/SettingsLayout';
import { AppProvider } from './context/AppContext';
import { Toaster } from "@/components/ui/sonner"

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="documents" element={<PlaceholderPage title="Документы" />} />
            <Route path="warehouse" element={<PlaceholderPage title="Склад" />} />
            <Route path="counterparties" element={<PlaceholderPage title="Контрагенты" />} />
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/main" replace />} />
              <Route path="main" element={<Settings />} />
              <Route path="account" element={<Account />} />
              <Route path="company" element={<CompanySettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" richColors />
      </Router>
    </AppProvider>
  );
}

export default App;
