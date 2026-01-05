import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user is logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🌟 Smart role check logic
  const userRole = user.role;

  // This allows the combined role to access any route meant for either inward or outward execs
  const hasAccess =
    !allowedRoles || // if no restriction
    allowedRoles.includes(userRole) || // direct match
    (
      userRole === 'outward_executive_inward_executive' &&
      allowedRoles.some(role =>
        ['inward_executive', 'outward_executive'].includes(role)
      )
    );

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ User has access
  return children;
};

export default ProtectedRoute;
