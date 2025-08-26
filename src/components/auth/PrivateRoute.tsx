import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

const PrivateRoute: React.FC = () => {
  const { user, loading } = useSupabaseAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
