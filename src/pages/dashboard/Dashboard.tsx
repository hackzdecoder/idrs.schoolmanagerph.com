import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Breadcrumbs, Link as MuiLink, Paper, Stack, Typography } from '@mui/material';
import paths from 'routes/paths';
import sitemap, { SubMenuItem } from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import PageLoader from 'components/loading/PageLoader';
import AdminDashboardContent from 'components/sections/dashboards/admin-dashboard/DashboardContent';
import StudentDashboardContent from 'components/sections/dashboards/student-dashboard/DashboardContent';
import SuperAdminDashboardContent from 'components/sections/dashboards/super-admin-dashboard/DashboardContent';

interface UserData {
  role?: string;
}

interface BreadcrumbItem {
  name: string;
  path: string;
  icon: string;
  isClickable: boolean;
}

/**
 * Recursively find a menu item by path and build the breadcrumb trail
 */
const findMenuItemAndBuildBreadcrumb = (
  items: SubMenuItem[],
  path: string,
  breadcrumb: SubMenuItem[] = [],
): SubMenuItem[] | null => {
  for (const item of items) {
    const currentBreadcrumb = [...breadcrumb, item];

    // Check if current item matches
    if (item.path === path || (item.path && path.startsWith(item.path + '/'))) {
      return currentBreadcrumb;
    }

    // Check children
    if (item.items && item.items.length > 0) {
      const found = findMenuItemAndBuildBreadcrumb(item.items, path, currentBreadcrumb);
      if (found) return found;
    }
  }
  return null;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userDataString = localStorage.getItem('user');

    if (!token || !userDataString) {
      navigate(paths.authenticate_login, { replace: true });
      return;
    }

    try {
      const userData: UserData = JSON.parse(userDataString);
      const role = userData.role;

      if (role && ['Super Admin', 'Admin', 'Student'].includes(role)) {
        setUserRole(role);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        navigate(paths.authenticate_login, { replace: true });
        return;
      }
    } catch {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate(paths.authenticate_login, { replace: true });
      return;
    }

    setLoading(false);
  }, [navigate]);

  /**
   * Get breadcrumb items based on current path from sidebar sitemap
   */
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    // Start with Home
    const items: BreadcrumbItem[] = [
      {
        name: 'Home',
        path: '/',
        icon: 'mdi:home',
        isClickable: true,
      },
    ];

    // If on root dashboard, add Dashboard breadcrumb
    if (location.pathname === '/' || location.pathname === '/dashboard') {
      items.push({
        name: 'Dashboard',
        path: '/',
        icon: 'mdi:view-dashboard',
        isClickable: false,
      });
      return items;
    }

    // Search through sitemap to find matching path and build breadcrumb trail
    let breadcrumbItems: SubMenuItem[] | null = null;

    for (const menu of sitemap) {
      const found = findMenuItemAndBuildBreadcrumb(menu.items, location.pathname);
      if (found) {
        breadcrumbItems = found;
        break;
      }
    }

    // Handle profile page separately
    if (location.pathname === paths.profile) {
      items.push({
        name: 'Profile',
        path: paths.profile,
        icon: 'mdi:account',
        isClickable: false,
      });
      return items;
    }

    // Add all breadcrumb items from the hierarchy
    if (breadcrumbItems && breadcrumbItems.length > 0) {
      breadcrumbItems.forEach((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        items.push({
          name: item.name,
          path: item.path || location.pathname,
          icon: item.icon || 'mdi:file-document',
          isClickable: !isLast,
        });
      });
    }
    // Fallback for unmatched paths
    else if (location.pathname !== '/' && location.pathname !== '/dashboard') {
      const pathName = location.pathname.split('/').pop() || 'Page';
      const formattedName = pathName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        name: formattedName,
        path: location.pathname,
        icon: 'mdi:file-document',
        isClickable: false,
      });
    }

    return items;
  }, [location.pathname]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return <PageLoader />;
  }

  const renderDashboardContent = () => {
    switch (userRole) {
      case 'Super Admin':
        return <SuperAdminDashboardContent />;
      case 'Admin':
        return <AdminDashboardContent />;
      case 'Student':
        return <StudentDashboardContent />;
      default:
        return null;
    }
  };

  return (
    <Stack direction="column" height={1}>
      <Paper sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
        <Breadcrumbs
          separator={<IconifyIcon icon="mdi:chevron-right" fontSize={16} color="#64748b" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            if (isLast || !crumb.isClickable) {
              return (
                <Typography
                  key={index}
                  color={isLast ? 'text.primary' : 'text.secondary'}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: 14,
                  }}
                >
                  <IconifyIcon icon={crumb.icon} fontSize={18} />
                  {crumb.name}
                </Typography>
              );
            }

            return (
              <MuiLink
                key={index}
                underline="hover"
                color="inherit"
                onClick={() => handleNavigate(crumb.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  '&:hover': { color: '#2563eb' },
                }}
              >
                <IconifyIcon icon={crumb.icon} fontSize={18} />
                {crumb.name}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
        {renderDashboardContent()}
      </Paper>
    </Stack>
  );
};

export default Dashboard;
