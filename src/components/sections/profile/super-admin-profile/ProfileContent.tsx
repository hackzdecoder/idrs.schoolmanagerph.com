import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import Swal from 'sweetalert2';
import IconifyIcon from 'components/base/IconifyIcon';
import { OnLoader } from 'components/dialogs/Dialog';
import PageLoader from 'components/loading/PageLoader';

interface ProfileData {
  id: number;
  role: string;
  fullname: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    username: string;
    school_email: string;
    account_name: string;
    mobile_number: string;
    account_status: string;
  };
}

interface UserData {
  username: string;
  school_email: string;
  role: string;
  user_id?: string;
  account_name?: string;
  mobile_number?: string;
}

const ProfileContent = () => {
  const { get, post } = useRouteApiSetup();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeMenu, setActiveMenu] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const fetchedRef = useRef(false);

  const [editableData, setEditableData] = useState({
    fullname: '',
    mobile_number: '',
  });

  const fetchProfile = async () => {
    // Removed the ref check here to allow manual refreshes if needed,
    // but kept it in useEffect for the initial mount.
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const parsedUser = JSON.parse(userStr);
      const roleResponse = await get<{ success: boolean; role: string }>('/user-role');

      if (roleResponse.success) {
        const userInfo: UserData = {
          username: parsedUser.username || '',
          school_email: parsedUser.school_email || '',
          role: roleResponse.role,
          user_id: parsedUser.id,
          account_name: parsedUser.account_name,
          mobile_number: parsedUser.mobile_number || '',
        };
        setUserData(userInfo);

        if (roleResponse.role === 'Admin' || roleResponse.role === 'Super Admin') {
          const profileResponse = await get<{ success: boolean; data: ProfileData }>('/profile');

          if (profileResponse.success && profileResponse.data) {
            setProfileData(profileResponse.data);
            setEditableData({
              fullname: profileResponse.data.fullname || '',
              mobile_number:
                profileResponse.data.user?.mobile_number || userInfo.mobile_number || '',
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchProfile();
      fetchedRef.current = true;
    }
  }, []); // Standard mount effect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation check
    const currentFullName = profileData?.fullname || '';
    const currentMobile = profileData?.user?.mobile_number || userData?.mobile_number || '';

    if (
      editableData.fullname.trim() === currentFullName &&
      editableData.mobile_number.trim() === currentMobile
    ) {
      setEditMode(false);
      return;
    }

    const result = await Swal.fire({
      title: 'Save Changes?',
      text: 'Are you sure you want to update your profile?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'Confirm',
    });

    if (!result.isConfirmed) return;

    setUpdating(true); // Start loader
    try {
      const updateData = {
        fullname: editableData.fullname,
        mobile_number: editableData.mobile_number,
        // Using optional chaining to prevent "undefined" errors
        username: profileData?.user?.username || userData?.username,
        school_email: profileData?.user?.school_email || userData?.school_email,
      };

      const response = await post<{ success: boolean; response?: string; data?: ProfileData }>(
        '/profile/update',
        updateData,
      );

      if (response.success && response.data) {
        // 2. Immediate State Update
        setProfileData(response.data);

        // 3. Sync LocalStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const parsedUser = JSON.parse(userStr);
          localStorage.setItem(
            'user',
            JSON.stringify({
              ...parsedUser,
              account_name: editableData.fullname,
              mobile_number: editableData.mobile_number,
            }),
          );
        }

        setEditMode(false);
        setUpdating(false); // STOP LOADER BEFORE SWAL

        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: response.response || 'Your profile has been updated successfully.',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        });
      }
    } catch (error: any) {
      setUpdating(false); // Stop loader on error
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: error.message || 'An unexpected error occurred.',
        confirmButtonColor: '#2563eb',
      });
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditableData({
        fullname: profileData.fullname || '',
        mobile_number: profileData.user?.mobile_number || userData?.mobile_number || '',
      });
    }
    setEditMode(false);
  };

  const menuItems = [
    { id: 'profile', label: 'Profile Details', icon: 'mdi:account-edit', disabled: false },
    { id: 'security', label: 'Security', icon: 'mdi:security', disabled: true },
    { id: 'notifications', label: 'Notifications', icon: 'mdi:bell', disabled: true },
  ];

  if (loading) return <PageLoader />;
  if (!userData || !profileData)
    return <Typography sx={{ p: 3 }}>No profile data available</Typography>;

  const displayName = profileData.fullname;
  const firstLetter = displayName?.charAt(0).toUpperCase() || 'U';

  return (
    <>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Sidebar - Made responsive: stacks on mobile */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              height: { xs: 'auto', md: 400 },
              borderRadius: 3,
              border: '1px solid #e9edf4',
              p: { xs: 2, md: 3 },
              mb: { xs: 2, md: 0 },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Settings Menu
            </Typography>
            <List sx={{ p: 0 }}>
              {menuItems.map((item) => (
                <ListItem
                  key={item.id}
                  onClick={() => !item.disabled && setActiveMenu(item.id)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    bgcolor: activeMenu === item.id ? '#f0f4fe' : 'transparent',
                    color:
                      activeMenu === item.id ? '#2563eb' : item.disabled ? '#a0aec0' : '#334155',
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconifyIcon icon={item.icon} fontSize={20} />
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: activeMenu === item.id ? 600 : 500,
                      }}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Profile Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper
            elevation={0}
            sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 3, border: '1px solid #e9edf4' }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                    Profile Settings
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                    <Avatar
                      sx={{
                        width: { xs: 60, md: 70 },
                        height: { xs: 60, md: 70 },
                        bgcolor: '#2563eb',
                        fontSize: '1.5rem',
                      }}
                    >
                      {firstLetter}
                    </Avatar>
                    <Stack direction="column">
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.2,
                          fontSize: { xs: '1.1rem', md: '1.25rem' },
                        }}
                      >
                        {displayName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                        {profileData.role}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2563eb', mb: 2 }}>
                    Profile Information
                  </Typography>

                  {/* Container for horizontal inputs */}
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={editableData.fullname}
                        onChange={(e) =>
                          setEditableData({ ...editableData, fullname: e.target.value })
                        }
                        InputProps={{ readOnly: !editMode }}
                        disabled={!editMode}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Mobile Number"
                        value={editableData.mobile_number}
                        onChange={(e) =>
                          setEditableData({ ...editableData, mobile_number: e.target.value })
                        }
                        InputProps={{ readOnly: !editMode }}
                        disabled={!editMode}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    justifyContent={{ xs: 'center', sm: 'flex-end' }}
                    sx={{ mt: 3 }}
                  >
                    {editMode ? (
                      <>
                        <Button
                          variant="outlined"
                          onClick={handleCancel}
                          fullWidth={false}
                          sx={{ px: 4 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={updating}
                          fullWidth={false}
                          sx={{ px: 4 }}
                        >
                          {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    ) : (
                      <Button variant="outlined" onClick={() => setEditMode(true)} sx={{ px: 4 }}>
                        Edit Profile
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <OnLoader open={updating} title="Saving..." size={40} thickness={4} />
    </>
  );
};

export default ProfileContent;
