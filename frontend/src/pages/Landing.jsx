import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LandingHero from '../components/landing/LandingHero';
import WorkflowSteps from '../components/landing/WorkflowSteps';
import RoleCards from '../components/landing/RoleCards';

export const Landing = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (!loading && isAuthenticated && user) {
    const target =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'staff'
        ? '/staff/dashboard'
        : '/student/dashboard';
    return <Navigate to={target} replace />;
  }

  const getStartedLink = () => {
    if (!isAuthenticated) return '/login';
    return user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'staff'
      ? '/staff/dashboard'
      : '/student/raise-complaint';
  };

  return (
    <div className="space-y-12 pb-16">
      <LandingHero getStartedLink={getStartedLink} isAuthenticated={isAuthenticated} />
      <WorkflowSteps />
      <RoleCards />
    </div>
  );
};

export default Landing;
