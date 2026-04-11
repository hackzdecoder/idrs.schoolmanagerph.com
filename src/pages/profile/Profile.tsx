import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Breadcrumbs, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loading/PageLoader';
import AdminProfileContent from 'components/sections/profile/admin-profile/ProfileContent';
import StudentProfileContent from 'components/sections/profile/student-profile/ProfileContent';
import SuperAdminProfileContent from 'components/sections/profile/super-admin-profile/ProfileContent';

interface UserData {
  role: 'Super Admin' | 'Admin' | 'Student';
}

const Profile = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<'Super Admin' | 'Admin' | 'Student' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = () => {
      const accessToken = localStorage.getItem('access_token');
      const userDataString = localStorage.getItem('user');

      if (!accessToken) {
        navigate(paths.login, { replace: true });
        return;
      }

      if (userDataString) {
        try {
          const userData: UserData = JSON.parse(userDataString);
          setUserRole(userData.role);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          navigate(paths.login, { replace: true });
          return;
        }
      } else {
        localStorage.removeItem('access_token');
        navigate(paths.login, { replace: true });
        return;
      }

      setLoading(false);
    };

    getUserRole();
  }, [navigate]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!userRole) {
    return (
      <Stack alignItems="center" justifyContent="center" height="100%">
        <Typography variant="h6" color="text.secondary">
          Unable to determine user role
        </Typography>
      </Stack>
    );
  }

  const renderProfileContent = () => {
    switch (userRole) {
      case 'Super Admin':
        return <SuperAdminProfileContent />;
      case 'Admin':
        return <AdminProfileContent />;
      case 'Student':
        return <StudentProfileContent />;
      default:
        return (
          <Stack alignItems="center" justifyContent="center" height="100%">
            <Typography variant="h6" color="text.secondary">
              Unknown role
            </Typography>
          </Stack>
        );
    }
  };

  return (
    <Stack direction="column" height={1}>
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<IconifyIcon icon="mdi:chevron-right" fontSize={16} color="#64748b" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          {/* Home Link */}
          <MuiLink
            underline="hover"
            color="inherit"
            onClick={() => handleNavigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              '&:hover': { color: '#2563eb' },
            }}
          >
            <IconifyIcon icon="mdi:home" fontSize={18} />
            Home
          </MuiLink>

          {/* Profile (Current Page - Not Clickable) */}
          <Typography
            color="text.primary"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: 14,
            }}
          >
            <IconifyIcon icon="material-symbols:account-box-outline" fontSize={18} />
            ID Registration
          </Typography>
        </Breadcrumbs>

        {renderProfileContent()}
      </Paper>
    </Stack>
  );
};

export default Profile;
