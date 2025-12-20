import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import ServicesPage from './pages/ServicesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import PickupBoyLoginPage from './pages/PickupBoyLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AgentDashboard from './pages/AgentDashboard';
import OAuthCallback from './pages/OAuthCallback';
import { AuthProvider, useAuth } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/agent/login" element={<PickupBoyLoginPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route
            path="/dashboard/customer"
            element={
              <ProtectedRoute requiredRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/agent"
            element={
              <ProtectedRoute requiredRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else if (requiredRole === 'agent') {
      return <Navigate to="/agent/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    const fallback =
      user?.role === 'admin'
        ? '/dashboard/admin'
        : user?.role === 'agent'
        ? '/dashboard/agent'
        : '/dashboard/customer';
    return <Navigate to={fallback} replace />;
  }
  
  return children;
}