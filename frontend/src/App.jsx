import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PlaceholderPage from './pages/Placeholder';
import Account from './pages/Account';
import Onboarding from './pages/Onboarding';
import CompanySettings from './pages/CompanySettings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<div className="auth-container"><Login /></div>} />
        <Route path="/register" element={<div className="auth-container"><Register /></div>} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="documents" element={<PlaceholderPage title="Документы" />} />
          <Route path="warehouse" element={<PlaceholderPage title="Склад" />} />
          <Route path="counterparties" element={<PlaceholderPage title="Контрагенты" />} />
          <Route path="account" element={<Account />} />
          <Route path="settings" element={<PlaceholderPage title="Настройки" />} />
          <Route path="company-settings" element={<CompanySettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
