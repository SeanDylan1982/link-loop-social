import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <AuthForm onSuccess={() => navigate('/')} />
    </div>
  );
};

export default LoginPage;
