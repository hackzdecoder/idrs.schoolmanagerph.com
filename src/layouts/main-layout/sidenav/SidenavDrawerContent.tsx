import { useEffect, useMemo, useState } from 'react';
import { Alert, Divider, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Toolbar from '@mui/material/Toolbar';
import { UserRole } from 'data/roles';
import { useSettingsContext } from 'providers/SettingsProvider';
import paths from 'routes/paths';
import sitemap from 'routes/sitemap';
import IconifyIcon from 'components/base/IconifyIcon';
import Logo from 'components/common/Logo';
import NavItem from './NavItem';
import SidenavSimpleBar from './SidenavSimpleBar';

interface SidenavDrawerContentProps {
  variant?: 'permanent' | 'temporary';
}

interface UserData {
  username: string;
  email: string;
  role: UserRole;
  user_id?: string;
}

// Filter function with error handling
const filterMenuItemsByRole = (items: any[], role: UserRole | null) => {
  if (!role || !items) return [];

  return items.filter((item) => {
    try {
      if (!item) return false;
      if (!item.roles) return true;
      return item.roles.includes(role);
    } catch {
      return false;
    }
  });
};

const SidenavDrawerContent = ({ variant = 'permanent' }: SidenavDrawerContentProps) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    config: { sidenavCollapsed, openNavbarDrawer },
    setConfig,
  } = useSettingsContext();

  // Get user data from localStorage with error handling
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');

      if (!userStr) {
        setError('No user data found. Please log in again.');
        return;
      }

      const user: UserData = JSON.parse(userStr);

      if (!user.role) {
        setError('User role not found. Please log in again.');
        return;
      }

      setUserRole(user.role);
      setError(null);
    } catch {
      setError('Invalid user data. Please log in again.');
      localStorage.removeItem('user');
      localStorage.removeItem('access_token');
    }
  }, []);

  // Filter sitemap with error handling
  const filteredSitemap = useMemo(() => {
    try {
      if (!userRole) return [];
      if (!sitemap) return [];

      return sitemap
        .map((section) => {
          try {
            return {
              ...section,
              items: filterMenuItemsByRole(section?.items || [], userRole),
            };
          } catch {
            return null;
          }
        })
        .filter(
          (section): section is NonNullable<typeof section> =>
            section !== null && section.items?.length > 0,
        );
    } catch {
      return [];
    }
  }, [userRole]);

  const expanded = useMemo(
    () => variant === 'temporary' || (variant === 'permanent' && !sidenavCollapsed),
    [sidenavCollapsed, variant],
  );

  const toggleNavbarDrawer = () => {
    setConfig({
      openNavbarDrawer: !openNavbarDrawer,
    });
  };

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => (window.location.href = paths.login)}
            >
              <IconifyIcon icon="material-symbols:login" />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Don't render if no user role
  if (!userRole) return null;

  // Show empty state if no menu items
  if (filteredSitemap.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No menu items available for your role ({userRole}).</Alert>
      </Box>
    );
  }

  return (
    <>
      <Toolbar variant="appbar" sx={{ display: 'block', px: { xs: 0 } }}>
        <Box
          sx={[
            {
              height: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            },
            !expanded && {
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            },
            expanded && {
              pl: { xs: 4, md: 6 },
              pr: { xs: 2, md: 3 },
            },
          ]}
        >
          <Logo showName={expanded} />
          <IconButton sx={{ mt: 1, display: { md: 'none' } }} onClick={toggleNavbarDrawer}>
            <IconifyIcon icon="material-symbols:left-panel-close-outline" fontSize={20} />
          </IconButton>
        </Box>
      </Toolbar>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <SidenavSimpleBar>
          <Box
            sx={[
              {
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              },
              !expanded && {
                px: 2,
              },
              expanded && {
                px: { xs: 2, md: 4 },
              },
            ]}
          >
            <div>
              {filteredSitemap.map((menu) => (
                <Box key={menu?.id || Math.random()}>
                  {menu?.subheader === 'Docs' && !sidenavCollapsed && (
                    <>
                      <Divider sx={{ mb: 4 }} />
                    </>
                  )}
                  <List
                    dense
                    key={menu?.id || Math.random()}
                    sx={{
                      mb: 3,
                      pb: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {menu?.items?.map((item) => (
                      <NavItem key={item?.pathName || Math.random()} item={item} level={0} />
                    ))}
                  </List>
                </Box>
              ))}
            </div>
          </Box>
        </SidenavSimpleBar>
      </Box>
    </>
  );
};

export default SidenavDrawerContent;
