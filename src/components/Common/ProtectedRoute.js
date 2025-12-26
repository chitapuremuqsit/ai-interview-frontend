import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const userId = localStorage.getItem('userId');

  if (!userId) {
    return <Navigate to="/signin" />;
  }

  return children;
}

export default ProtectedRoute;