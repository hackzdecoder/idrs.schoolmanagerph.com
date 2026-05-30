// app/src/components/auth/AuthGuard.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

interface AuthGuardProps {
  children: ReactNode;
}

// Role-based dashboard paths
const getDashboardPathByRole = (role: string): string => {
  switch (role) {
    case 'Super Admin':
      return '/';
    case 'Admin':
      return '/';
    case 'Student':
      return '/';
    default:
      return paths.root;
  }
};

const AuthGuard = ({ children }: AuthGuardProps) => {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUserRole(user?.role || null);

        // Store the current page as last visited when authenticated
        if (location.pathname !== '/') {
          sessionStorage.setItem('lastVisitedPage', location.pathname);
        }
      } catch (error) {
        console.error('AuthGuard - Error parsing user:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setIsChecking(false);
  }, [location.pathname]);

  if (isChecking) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.authenticate_login} replace />;
  }

  // If user is on root path, redirect to role-specific dashboard
  if (location.pathname === '/' && userRole) {
    const dashboardPath = getDashboardPathByRole(userRole);
    if (dashboardPath !== '/') {
      return <Navigate to={dashboardPath} replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
