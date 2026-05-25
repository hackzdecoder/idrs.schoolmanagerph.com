// app/src/components/auth/RoleGuard.tsx
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    try {
      const user = JSON.parse(userStr);
      const userRole = user?.role;

      if (userRole && allowedRoles.includes(userRole)) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch {
      setHasAccess(false);
    } finally {
      setIsChecking(false);
    }
  }, [allowedRoles]);

  if (isChecking) {
    return <PageLoader />;
  }

  if (!hasAccess) {
    return <Navigate to={paths.root} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
