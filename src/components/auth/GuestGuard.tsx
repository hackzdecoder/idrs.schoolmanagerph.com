import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

interface GuestGuardProps {
  children: ReactNode;
}

const GuestGuard = ({ children }: GuestGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    console.log('GuestGuard - Checking:', {
      token: !!token,
      user: !!userStr,
      path: location.pathname,
    });

    if (token && userStr) {
      console.log('GuestGuard - Already authenticated, redirecting to dashboard');
      navigate(paths.root, { replace: true });
      return;
    }

    setChecking(false);
  }, [navigate, location.pathname]);

  if (checking) return <PageLoader />;

  return <>{children}</>;
};

export default GuestGuard;
