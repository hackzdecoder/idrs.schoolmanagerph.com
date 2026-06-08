// app/src/components/auth/GuestGuard.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

interface GuestGuardProps {
  children: ReactNode;
}

const GuestGuard = ({ children }: GuestGuardProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      setIsAuthenticated(true);
    }
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={paths.root} replace />;
  }

  return <>{children}</>;
};

export default GuestGuard;
