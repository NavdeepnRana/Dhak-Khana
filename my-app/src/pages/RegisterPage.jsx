import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SiteNavbar from '../components/layout/SiteNavbar';
import SiteFooter from '../components/layout/SiteFooter';
import CustomerRegisterCard from '../components/auth/CustomerRegisterCard';
import { registerCustomer } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (payload) => {
    setLoading(true);
    try {
      const data = await registerCustomer(payload);
      login(data.token, data.user);
      navigate('/dashboard/customer', { replace: true });
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <SiteNavbar />
      <main className="flex-grow-1 py-5">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <h1 className="fw-bold">Open your Dakkhana Digital ID</h1>
              <p className="text-muted">
                A single login for India Post savings, PLI/RPLI, Speed Post, and government citizen services. Works across
                mobile, web, and CSC counters.
              </p>
              <ul className="list-unstyled text-muted">
                <li>• Book pickups & download invoices</li>
                <li>• Track savings & insurance investments</li>
                <li>• Get alerts for Aadhaar & citizen schemes</li>
              </ul>
            </div>
            <div className="col-lg-7">
              <CustomerRegisterCard onSubmit={handleRegister} isLoading={loading} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

