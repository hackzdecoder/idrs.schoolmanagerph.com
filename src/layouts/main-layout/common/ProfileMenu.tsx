import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Link,
  ListItemIcon,
  MenuItem,
  SnackbarCloseReason,
  Stack,
  Typography,
  listClasses,
  listItemIconClasses,
  paperClasses,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';
import { OnLoader } from 'components/dialogs/Dialog';
import ProSnackbar from './ProSnackbar';

const ProfileMenu = () => {
  const navigate = useNavigate();
  const { get, post } = useRouteApiSetup();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userData, setUserData] = useState<any>(null);
  const [studentId, setStudentId] = useState('');
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);
  const profileFetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadUserData = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        setLoading(false);
        return;
      }

      try {
        const parsed = JSON.parse(userStr);
        setUserData(parsed);
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (!userData || profileFetchedRef.current) return;

    const fetchProfile = async () => {
      if (userData.role === 'Student') {
        try {
          const profileResponse = await get<{
            success: boolean;
            data: { student_id: string };
          }>('/student/profile');

          if (profileResponse.success && profileResponse.data) {
            setStudentId(profileResponse.data.student_id || '');
          }
        } catch (error) {
          console.error('Failed to fetch student profile:', error);
        } finally {
          profileFetchedRef.current = true;
        }
      }
    };

    fetchProfile();
  }, [userData, get]);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogoutClick = () => {
    handleClose();
    setLogoutModalOpen(true);
    performLogout();
  };

  const performLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const userRole = userData?.role || '';

    try {
      await post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('access_expires_at');
      localStorage.removeItem('student_info');
      localStorage.removeItem('existing_student_data');
      localStorage.removeItem('existing_student_school_code');

      setLogoutModalOpen(false);
      navigate(getLoginPageByRole(userRole), { replace: true });

      if (!userRole) {
        setSnackbarMessage('Logged out successfully.');
        setSnackbarOpen(true);
      }

      setIsLoggingOut(false);
    }
  };

  const handleSnackbarClose = (
    _event: Event | SyntheticEvent<Element, Event>,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  const getLoginPageByRole = (role: string): string => {
    switch (role) {
      case 'Super Admin':
      case 'Admin':
        return paths.admin_login;
      case 'Student':
        return paths.authenticate_login;
      default:
        return paths.login;
    }
  };

  const getDisplayName = (userData: any): string => {
    if (!userData) return 'User';
    return userData.account_name || userData.username || 'User';
  };

  if (loading) {
    return (
      <Button color="neutral" variant="text" shape="circle" sx={{ height: 40, width: 40 }}>
        <CircularProgress size={24} thickness={4} />
      </Button>
    );
  }

  const displayName = getDisplayName(userData);
  const firstLetter = displayName.charAt(0).toUpperCase();

  const menuButton = (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={{ height: 40, width: 40 }}
    >
      <StatusAvatar status="online" alt={displayName} sx={{ width: 40, height: 40 }}>
        {firstLetter}
      </StatusAvatar>
    </Button>
  );

  return (
    <>
      {menuButton}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack sx={{ alignItems: 'center', gap: 2, px: 3, py: 2 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: '1rem' }}>
            {firstLetter}
          </Avatar>
          <Box sx={{ textAlign: 'left' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {displayName}
              </Typography>
              {userData?.role && (
                <Typography variant="subtitle2" sx={{ color: 'warning.main' }}>
                  ({userData.role})
                </Typography>
              )}
            </Stack>
            {studentId && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
              >
                Student ID: {studentId}
              </Typography>
            )}
          </Box>
        </Stack>

        <Divider />

        <Box sx={{ py: 1 }}>
          {/* ✅ Dynamic menu item based on user role */}
          {userData?.role === 'Admin' && (
            <MenuItem
              onClick={handleClose}
              component={Link}
              href={paths.management}
              underline="none"
              sx={{ gap: 1 }}
            >
              <ListItemIcon
                sx={{ [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' } }}
              >
                <IconifyIcon
                  icon="material-symbols:manage-accounts-outline-rounded"
                  sx={{ color: 'text.secondary' }}
                />
              </ListItemIcon>
              Enrollment Approval
            </MenuItem>
          )}

          {userData?.role === 'Super Admin' && (
            <MenuItem
              onClick={handleClose}
              component={Link}
              href={paths.profile}
              underline="none"
              sx={{ gap: 1 }}
            >
              <ListItemIcon
                sx={{ [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' } }}
              >
                <IconifyIcon
                  icon="material-symbols:account-circle-outline"
                  sx={{ color: 'text.secondary' }}
                />
              </ListItemIcon>
              Profile
            </MenuItem>
          )}

          {userData?.role === 'Student' && (
            <MenuItem
              onClick={handleClose}
              component={Link}
              href={paths.student_profile}
              underline="none"
              sx={{ gap: 1 }}
            >
              <ListItemIcon
                sx={{ [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' } }}
              >
                <IconifyIcon
                  icon="material-symbols:person-outline"
                  sx={{ color: 'text.secondary' }}
                />
              </ListItemIcon>
              Enrollment Approval
            </MenuItem>
          )}

          {/* Help Center - common for all roles */}
          <MenuItem
            onClick={handleClose}
            component={Link}
            href="#!"
            underline="none"
            sx={{ gap: 1 }}
          >
            <ListItemIcon
              sx={{ [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' } }}
            >
              <IconifyIcon
                icon="material-symbols:question-mark-rounded"
                sx={{ color: 'text.secondary' }}
              />
            </ListItemIcon>
            Help Center
          </MenuItem>
        </Box>

        <Divider />

        <Box sx={{ py: 1 }}>
          <MenuItem onClick={handleLogoutClick} sx={{ gap: 1 }}>
            <ListItemIcon
              sx={{ [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' } }}
            >
              <IconifyIcon
                icon="material-symbols:logout-rounded"
                sx={{ color: 'text.secondary' }}
              />
            </ListItemIcon>
            Log Out
          </MenuItem>
        </Box>
      </Menu>

      <OnLoader open={logoutModalOpen} title="Logging Out..." size={40} thickness={4} />
      <ProSnackbar open={snackbarOpen} onClose={handleSnackbarClose} message={snackbarMessage} />
    </>
  );
};

export default ProfileMenu;
