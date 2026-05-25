// app/src/components/auth/AuthGuard.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      setIsAuthenticated(true);
      // Store the current page as last visited when authenticated
      if (location.pathname !== '/') {
        sessionStorage.setItem('lastVisitedPage', location.pathname);
      }
    }
    setIsChecking(false);
  }, [location.pathname]);

  if (isChecking) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.authenticate_login} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
