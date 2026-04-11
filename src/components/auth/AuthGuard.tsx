import { ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import paths from 'routes/paths';
import MainLoader from 'components/loading/MainLoader';

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      console.log('AuthGuard - Authenticated, showing content');
      setIsLoading(false);
    } else {
      console.log('AuthGuard - Not authenticated, redirecting to student login');
      navigate(paths.authenticate_login, { replace: true });
    }
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <MainLoader />;
  }

  return <>{children}</>;
};

export default AuthGuard;
