import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and save location to return to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect legacy students with incomplete academic profile
  if (user?.role === 'student' && user?.profile_incomplete) {
    if (location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" replace />;
    }
  }

  // Check if role is authorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'staff') {
      return <Navigate to="/staff/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
