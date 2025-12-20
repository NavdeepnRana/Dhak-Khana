import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const processAuth = async () => {
      const token = searchParams.get('token');
      const userParam = searchParams.get('user');
      const error = searchParams.get('error');

      if (error) {
        setStatus('Authentication failed');
        alert('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
        return;
      }

      if (token && userParam) {
        try {
          // Decode the token and user data
          const decodedToken = decodeURIComponent(token);
          const decodedUser = decodeURIComponent(userParam);
          const user = JSON.parse(decodedUser);
          
          // Validate user data
          if (!user || !user.id || !user.email) {
            throw new Error('Invalid user data');
          }
          
          setStatus('Logging you in...');
          
          // Login the user - this is synchronous and updates state immediately
          login(decodedToken, user);
          
          // Navigate immediately - the login function updates localStorage synchronously
          // and the AuthContext will update, triggering re-render
          navigate('/dashboard/customer', { replace: true });
        } catch (err) {
          console.error('Error parsing user data:', err);
          setStatus('Authentication error');
          alert('Authentication error. Please try again.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 1500);
        }
      } else {
        setStatus('Missing authentication data');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      }
    };

    processAuth();
  }, [searchParams, login, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">{status}</p>
      </div>
    </div>
  );
}

