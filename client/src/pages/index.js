import React from 'react';
import { Navigate } from 'react-router-dom';

// This component simply redirects to the dashboard as the root path is handled by App.jsx
function IndexPage() {
  return <Navigate to="/dashboard" replace />;
}

export default IndexPage;

