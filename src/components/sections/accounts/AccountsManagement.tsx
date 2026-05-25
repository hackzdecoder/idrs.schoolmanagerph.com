// app/src/components/sections/accounts/AccountsManagement.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import Swal from 'sweetalert2';
import IconifyIcon from 'components/base/IconifyIcon';
import { Dialog } from 'components/dialogs/Dialog';
import DataGridPagination from 'components/pagination/DataGridPagination';

// ============================================================
// TYPES
// ============================================================
interface SchoolRecord {
  id: number;
  school_code: string;
  school_name: string;
  school_email: string;
  school_logo: string | null;
}

interface SchoolFormData {
  school_code: string;
  school_name: string;
  school_email: string;
  school_logo: File | string | null;
}

interface UserRecord {
  id: number;
  username: string;
  school_email: string;
  account_name: string;
  school_code: string;
  mobile_number: string | null;
  user_role: string;
  account_status: string;
  last_successful_login: string | null;
  created_at: string;
}

interface UserFormData {
  username: string;
  school_email: string;
  account_name: string;
  school_code: string;
  mobile_number: string;
  password: string;
  account_status: string;
}

interface SchoolOption {
  school_code: string;
  school_name: string;
}

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const getRandomColor = (str: string): string => {
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#10b981';
    case 'inactive':
      return '#ef4444';
    default:
      return '#64748b';
  }
};

const getStatusBgColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return '#10b98120';
    case 'inactive':
      return '#ef444420';
    default:
      return '#64748b20';
  }
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================
// SCHOOL MANAGEMENT COMPONENT
// ============================================================
const SchoolManagement = () => {
  const { get, post } = useRouteApiSetup();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolsErrorMsg, setSchoolsErrorMsg] = useState<string | null>(null);
  const [schoolsSearchQuery, setSchoolsSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState<string | null>(null);
  const [schoolsAnchorEl, setSchoolsAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSchool, setMenuSchool] = useState<SchoolRecord | null>(null);
  const [isSchoolFormModalOpen, setIsSchoolFormModalOpen] = useState(false);
  const [schoolFormMode, setSchoolFormMode] = useState<'create' | 'edit'>('create');
  const [filterSchoolCode, setFilterSchoolCode] = useState('');
  const [filterSchoolName, setFilterSchoolName] = useState('');
  const [isSchoolFilterModalOpen, setIsSchoolFilterModalOpen] = useState(false);
  const [schoolFormData, setSchoolFormData] = useState<SchoolFormData>({
    school_code: '',
    school_name: '',
    school_email: '',
    school_logo: null,
  });
  const [schoolFormErrors, setSchoolFormErrors] = useState<Partial<SchoolFormData>>({});
  const [isSchoolSubmitting, setIsSchoolSubmitting] = useState(false);

  const fetchSchools = async () => {
    setIsLoading(true);
    setSchoolsErrorMsg(null);
    try {
      const response = await get<ApiResponse>('/super-admin/schools');
      if (response && response.success === true && Array.isArray(response.data)) {
        setSchools(response.data);
      } else {
        setSchoolsErrorMsg('Failed to load schools');
        setSchools([]);
      }
    } catch {
      setSchoolsErrorMsg('Failed to fetch schools');
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredSchools = async () => {
    setSchoolsErrorMsg(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterSchoolCode) queryParams.append('school_code', filterSchoolCode);
      if (filterSchoolName) queryParams.append('school_name', filterSchoolName);
      const queryString = queryParams.toString();
      const apiUrl = queryString ? `/super-admin/schools?${queryString}` : '/super-admin/schools';
      const response = await get<ApiResponse>(apiUrl);
      if (response && response.success === true && Array.isArray(response.data)) {
        setSchools(response.data);
        setSchoolsSearchQuery('');
      } else {
        setSchoolsErrorMsg('Failed to apply filter');
      }
    } catch {
      setSchoolsErrorMsg('Failed to apply filter');
    } finally {
      setIsSchoolFilterModalOpen(false);
    }
  };

  const showErrorAlert = (message: string, errors?: Record<string, string[]>) => {
    let errorHtml = `<p style="font-size: 14px; margin-bottom: 10px;">${message}</p>`;
    if (errors) {
      errorHtml += '<ul style="text-align: left; margin: 0; padding-left: 20px;">';
      Object.values(errors).forEach((errorList) => {
        errorList.forEach((err) => {
          errorHtml += `<li style="font-size: 13px; color: #dc2626;">${err}</li>`;
        });
      });
      errorHtml += '</ul>';
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: errorHtml,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
    });
  };

  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const createSchool = async () => {
    if (!validateSchoolForm()) return;
    setIsSchoolSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('school_code', schoolFormData.school_code);
      submitData.append('school_name', schoolFormData.school_name);
      submitData.append('school_email', schoolFormData.school_email);
      if (schoolFormData.school_logo instanceof File) {
        submitData.append('school_logo', schoolFormData.school_logo);
      }
      const response = await post<ApiResponse>('/super-admin/schools', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response && response.success) {
        await fetchSchools();
        setIsSchoolFormModalOpen(false);
        resetSchoolForm();
        showSuccessAlert('Success!', 'School has been created successfully.');
      } else {
        showErrorAlert(response?.message || 'Failed to create school', response?.errors);
      }
    } catch {
      showErrorAlert('Failed to create school');
    } finally {
      setIsSchoolSubmitting(false);
    }
  };

  const updateSchool = async () => {
    if (!validateSchoolForm()) return;
    if (!selectedSchool) return;
    setIsSchoolSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append('school_code', schoolFormData.school_code);
      submitData.append('school_name', schoolFormData.school_name);
      submitData.append('school_email', schoolFormData.school_email);
      submitData.append('_method', 'PUT');
      if (schoolFormData.school_logo instanceof File) {
        submitData.append('school_logo', schoolFormData.school_logo);
      }
      const response = await post<ApiResponse>(
        `/super-admin/schools/${selectedSchool.id}`,
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      if (response && response.success) {
        await fetchSchools();
        setIsSchoolFormModalOpen(false);
        resetSchoolForm();
        showSuccessAlert('Success!', 'School has been updated successfully.');
      } else {
        showErrorAlert(response?.message || 'Failed to update school', response?.errors);
      }
    } catch {
      showErrorAlert('Failed to update school');
    } finally {
      setIsSchoolSubmitting(false);
    }
  };

  const validateSchoolForm = (): boolean => {
    const errors: Partial<SchoolFormData> = {};
    if (!schoolFormData.school_code.trim()) {
      errors.school_code = 'School code is required';
    } else if (!/^[A-Za-z0-9]+$/.test(schoolFormData.school_code)) {
      errors.school_code = 'School code must contain only letters and numbers';
    }
    if (!schoolFormData.school_name.trim()) errors.school_name = 'School name is required';
    if (!schoolFormData.school_email.trim()) {
      errors.school_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolFormData.school_email)) {
      errors.school_email = 'Invalid email format';
    }
    setSchoolFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).filter(Boolean) as string[];
      if (errorMessages.length > 0) {
        showErrorAlert('Please fix the following errors:', { validation: errorMessages });
      }
      return false;
    }
    return true;
  };

  const resetSchoolForm = () => {
    setSchoolFormData({
      school_code: '',
      school_name: '',
      school_email: '',
      school_logo: null,
    });
    setSelectedLogoPreview(null);
    setSchoolFormErrors({});
    setSelectedSchool(null);
    setSchoolsErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openCreateSchoolModal = () => {
    setSchoolFormMode('create');
    resetSchoolForm();
    setIsSchoolFormModalOpen(true);
  };

  const openEditSchoolModal = (school: SchoolRecord) => {
    setSchoolFormMode('edit');
    setSelectedSchool(school);
    setSchoolFormData({
      school_code: school.school_code,
      school_name: school.school_name,
      school_email: school.school_email,
      school_logo: school.school_logo,
    });
    setSelectedLogoPreview(school.school_logo);
    setSchoolFormErrors({});
    setIsSchoolFormModalOpen(true);
  };

  const schoolColumns: GridColDef[] = [
    {
      field: 'logo',
      headerName: 'Logo',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const school = params.row as SchoolRecord;
        const backgroundColor = getRandomColor(school.school_code);
        return (
          <Avatar
            src={school.school_logo || undefined}
            sx={{
              width: 45,
              height: 45,
              bgcolor: school.school_logo ? 'transparent' : backgroundColor,
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            {!school.school_logo && (school.school_name?.charAt(0).toUpperCase() || 'S')}
          </Avatar>
        );
      },
    },
    {
      field: 'school_code',
      headerName: 'School Code',
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.school_code.toUpperCase()}
          size="small"
          sx={{
            bgcolor: `${getRandomColor(params.row.school_code)}20`,
            color: getRandomColor(params.row.school_code),
            fontWeight: 600,
            fontFamily: 'monospace',
          }}
        />
      ),
    },
    {
      field: 'school_name',
      headerName: 'School Name',
      width: 280,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {capitalizeWords(params.row.school_name)}
        </Typography>
      ),
    },
    {
      field: 'school_email',
      headerName: 'Email Address',
      width: 260,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconifyIcon icon="mdi:email-outline" fontSize={18} color="#64748b" />
          <Typography variant="body2">{params.row.school_email}</Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Settings">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setSchoolsAnchorEl(e.currentTarget);
              setMenuSchool(params.row as SchoolRecord);
            }}
            sx={{ color: '#64748b' }}
          >
            <IconifyIcon icon="mdi:settings" fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const filteredSchools = useMemo(() => {
    if (!schoolsSearchQuery.trim()) return schools;
    const searchLower = schoolsSearchQuery.toLowerCase();
    return schools.filter(
      (school) =>
        school.school_code?.toLowerCase().includes(searchLower) ||
        school.school_name?.toLowerCase().includes(searchLower) ||
        school.school_email?.toLowerCase().includes(searchLower),
    );
  }, [schools, schoolsSearchQuery]);

  useEffect(() => {
    fetchSchools();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <Typography>Loading schools...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            School Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage all registered schools in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="mdi:plus" />}
          onClick={openCreateSchoolModal}
          sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}
        >
          Add New School
        </Button>
      </Stack>

      {schoolsErrorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSchoolsErrorMsg(null)}>
          {schoolsErrorMsg}
        </Alert>
      )}

      <Menu
        anchorEl={schoolsAnchorEl}
        open={Boolean(schoolsAnchorEl)}
        onClose={() => setSchoolsAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            if (menuSchool) openEditSchoolModal(menuSchool);
            setSchoolsAnchorEl(null);
          }}
          sx={{ gap: 1 }}
        >
          <IconifyIcon icon="mdi:pencil-outline" fontSize={18} color="#f59e0b" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit
          </Typography>
        </MenuItem>
      </Menu>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: 3 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <TextField
            placeholder="Search by school code, name, or email..."
            value={schoolsSearchQuery}
            onChange={(e) => setSchoolsSearchQuery(e.target.value)}
            size="small"
            variant="outlined"
            fullWidth={isMobileDevice}
            sx={{ width: { xs: '100%', sm: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="mdi:magnify" fontSize={20} color="#64748b" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="mdi:filter" />}
            onClick={() => setIsSchoolFilterModalOpen(true)}
            fullWidth={isMobileDevice}
          >
            Filter
          </Button>
        </Stack>
      </Stack>

      <Dialog
        open={isSchoolFilterModalOpen}
        onClose={() => setIsSchoolFilterModalOpen(false)}
        title="Filter Schools"
        maxWidth={500}
        actions={[
          {
            label: 'Reset',
            onClick: () => {
              setFilterSchoolCode('');
              setFilterSchoolName('');
              fetchSchools();
              setIsSchoolFilterModalOpen(false);
            },
            color: 'secondary',
            variant: 'outlined',
            startIcon: 'mdi:refresh',
          },
          {
            label: 'Apply Filter',
            onClick: fetchFilteredSchools,
            color: 'primary',
            variant: 'contained',
            startIcon: 'mdi:filter',
          },
        ]}
        content={
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              size="small"
              label="School Code"
              value={filterSchoolCode}
              onChange={(e) => setFilterSchoolCode(e.target.value)}
            />
            <TextField
              fullWidth
              size="small"
              label="School Name"
              value={filterSchoolName}
              onChange={(e) => setFilterSchoolName(e.target.value)}
            />
          </Stack>
        }
      />

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #e9edf4', overflow: 'hidden' }}
      >
        <DataGrid
          rowHeight={72}
          rows={filteredSchools}
          columns={schoolColumns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'school_name', sort: 'asc' }] },
          }}
          getRowId={(row) => row.id}
          slots={{
            basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e9edf4',
            },
          }}
        />
      </Paper>

      <Dialog
        open={isSchoolFormModalOpen}
        onClose={() => {
          if (!isSchoolSubmitting) setIsSchoolFormModalOpen(false);
        }}
        title={schoolFormMode === 'create' ? 'Add New School' : 'Edit School'}
        maxWidth={500}
        showLoading={isSchoolSubmitting}
        loadingTitle={schoolFormMode === 'create' ? 'Creating school...' : 'Saving changes...'}
        hideCloseButton={isSchoolSubmitting}
        disableBackdropClick={isSchoolSubmitting}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsSchoolFormModalOpen(false),
            color: 'secondary',
            variant: 'outlined',
            disabled: isSchoolSubmitting,
          },
          {
            label: schoolFormMode === 'create' ? 'Create School' : 'Save Changes',
            onClick: schoolFormMode === 'create' ? createSchool : updateSchool,
            color: 'primary',
            variant: 'contained',
            startIcon: schoolFormMode === 'create' ? 'mdi:plus' : 'mdi:content-save',
            disabled: isSchoolSubmitting,
          },
        ]}
        content={
          <Stack direction="column" spacing={2.5}>
            <Box>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                School Logo
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1 }}>
                <Avatar
                  src={selectedLogoPreview || undefined}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: selectedLogoPreview ? 'transparent' : '#f1f5f9',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {!selectedLogoPreview && (
                    <IconifyIcon icon="mdi:school" fontSize={32} color="#94a3b8" />
                  )}
                </Avatar>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<IconifyIcon icon="mdi:upload" />}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSchoolFormData({ ...schoolFormData, school_logo: file });
                        setSelectedLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </Button>
                {selectedLogoPreview && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => {
                      setSchoolFormData({ ...schoolFormData, school_logo: null });
                      setSelectedLogoPreview(null);
                    }}
                  >
                    Remove
                  </Button>
                )}
              </Stack>
            </Box>
            <TextField
              fullWidth
              size="small"
              label="School Code"
              value={schoolFormData.school_code}
              onChange={(e) =>
                setSchoolFormData({ ...schoolFormData, school_code: e.target.value })
              }
              disabled={schoolFormMode === 'edit'}
              error={!!schoolFormErrors.school_code}
              helperText={schoolFormErrors.school_code}
            />
            <TextField
              fullWidth
              size="small"
              label="School Name"
              value={schoolFormData.school_name}
              onChange={(e) =>
                setSchoolFormData({ ...schoolFormData, school_name: e.target.value })
              }
              error={!!schoolFormErrors.school_name}
              helperText={schoolFormErrors.school_name}
            />
            <TextField
              fullWidth
              size="small"
              label="School Email"
              type="email"
              value={schoolFormData.school_email}
              onChange={(e) =>
                setSchoolFormData({ ...schoolFormData, school_email: e.target.value })
              }
              error={!!schoolFormErrors.school_email}
              helperText={schoolFormErrors.school_email}
            />
          </Stack>
        }
      />
    </>
  );
};

// ============================================================
// USER MANAGEMENT COMPONENT
// ============================================================
const UserManagement = () => {
  const { get, post, put } = useRouteApiSetup();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [schoolsList, setSchoolsList] = useState<SchoolOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersErrorMsg, setUsersErrorMsg] = useState<string | null>(null);
  const [usersSearchQuery, setUsersSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [usersAnchorEl, setUsersAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<UserRecord | null>(null);
  const [isUserFormModalOpen, setIsUserFormModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userFormMode, setUserFormMode] = useState<'create' | 'edit'>('create');
  const [newPassword, setNewPassword] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserSchoolCode, setFilterUserSchoolCode] = useState('');
  const [isUserFilterModalOpen, setIsUserFilterModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    username: '',
    school_email: '',
    account_name: '',
    school_code: '',
    mobile_number: '',
    password: '',
    account_status: 'active',
  });
  const [userFormErrors, setUserFormErrors] = useState<Partial<UserFormData>>({});
  const [isUserSubmitting, setIsUserSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    setUsersErrorMsg(null);
    try {
      let url = '/super-admin/users';
      const params = new URLSearchParams();
      if (filterStatus) params.append('account_status', filterStatus);
      if (filterUserSchoolCode) params.append('school_code', filterUserSchoolCode);
      if (params.toString()) url += `?${params.toString()}`;

      console.log('Fetching users from:', url); // Debug log

      const response = await get<ApiResponse>(url);

      console.log('Fetch users response:', response); // Debug log

      if (response && response.success === true && Array.isArray(response.data)) {
        setUsers(response.data as UserRecord[]);
      } else {
        console.error('Invalid response:', response);
        setUsersErrorMsg(response?.message || response?.error || 'Failed to load users');
        setUsers([]);
      }
    } catch (error: any) {
      console.error('Fetch users error:', error);
      setUsersErrorMsg(error?.response?.data?.error || error?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSchoolsList = async () => {
    try {
      const response = await get<ApiResponse>('/super-admin/schools-list');
      if (response && response.success === true && Array.isArray(response.data)) {
        setSchoolsList(response.data as SchoolOption[]);
      }
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const showErrorAlert = (message: string, errors?: Record<string, string[]>) => {
    let errorHtml = `<p style="font-size: 14px; margin-bottom: 10px;">${message}</p>`;
    if (errors) {
      errorHtml += '<ul style="text-align: left; margin: 0; padding-left: 20px;">';
      Object.values(errors).forEach((errorList) => {
        errorList.forEach((err) => {
          errorHtml += `<li style="font-size: 13px; color: #dc2626;">${err}</li>`;
        });
      });
      errorHtml += '</ul>';
    }
    Swal.fire({
      icon: 'error',
      title: 'Error',
      html: errorHtml,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
    });
  };

  const showSuccessAlert = (title: string, message: string) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const createUser = async () => {
    if (!validateUserForm()) return;

    setIsUserSubmitting(true);
    setUsersErrorMsg(null);
    try {
      // Prepare the data to send
      const userData = {
        username: userFormData.username,
        school_email: userFormData.school_email,
        account_name: userFormData.account_name,
        school_code: userFormData.school_code,
        mobile_number: userFormData.mobile_number || null,
        password: userFormData.password,
        account_status: userFormData.account_status,
      };

      console.log('Sending user data:', userData); // Debug log

      const response = await post<ApiResponse>('/super-admin/users', userData);

      console.log('Response:', response); // Debug log

      if (response && response.success) {
        await fetchUsers();
        setIsUserFormModalOpen(false);
        resetUserForm();
        showSuccessAlert('Success!', 'Admin user created successfully.');
      } else {
        showErrorAlert(
          response?.message || response?.error || 'Failed to create user',
          response?.errors,
        );
      }
    } catch (error: any) {
      console.error('Create user error:', error);
      console.error('Error response:', error.response);
      showErrorAlert(error?.response?.data?.error || error?.message || 'Failed to create user');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const updateUser = async () => {
    if (!validateUserForm()) return;
    if (!selectedUser) return;

    setIsUserSubmitting(true);
    setUsersErrorMsg(null);
    try {
      // Create update data without password
      const updateData = {
        username: userFormData.username,
        school_email: userFormData.school_email,
        account_name: userFormData.account_name,
        school_code: userFormData.school_code,
        mobile_number: userFormData.mobile_number || null,
        account_status: userFormData.account_status,
      };

      console.log('Updating user data:', updateData); // Debug log

      const response = await put<ApiResponse>(`/super-admin/users/${selectedUser.id}`, updateData);

      console.log('Update response:', response); // Debug log

      if (response && response.success) {
        await fetchUsers();
        setIsUserFormModalOpen(false);
        resetUserForm();
        showSuccessAlert('Success!', 'Admin user updated successfully.');
      } else {
        showErrorAlert(
          response?.message || response?.error || 'Failed to update user',
          response?.errors,
        );
      }
    } catch (error: any) {
      console.error('Update user error:', error);
      showErrorAlert(error?.response?.data?.error || error?.message || 'Failed to update user');
    } finally {
      setIsUserSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword.trim() || newPassword.length < 8) {
      showErrorAlert('Password must be at least 8 characters');
      return;
    }
    if (!menuUser) return;

    setIsResetting(true);
    try {
      console.log('Resetting password for user:', menuUser.id); // Debug log

      const response = await post<ApiResponse>(`/super-admin/users/${menuUser.id}/reset-password`, {
        password: newPassword,
      });

      console.log('Reset password response:', response); // Debug log

      if (response && response.success) {
        setIsPasswordModalOpen(false);
        setNewPassword('');
        showSuccessAlert('Success!', 'Password reset successfully.');
      } else {
        showErrorAlert(response?.message || response?.error || 'Failed to reset password');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      showErrorAlert(error?.response?.data?.error || error?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const validateUserForm = (): boolean => {
    const errors: Partial<UserFormData> = {};
    if (!userFormData.username.trim()) errors.username = 'Username is required';
    if (!userFormData.school_email.trim()) {
      errors.school_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userFormData.school_email)) {
      errors.school_email = 'Invalid email format';
    }
    if (!userFormData.account_name.trim()) errors.account_name = 'Full name is required';
    if (!userFormData.school_code) errors.school_code = 'School is required';
    if (userFormMode === 'create' && !userFormData.password) {
      errors.password = 'Password is required for new users';
    } else if (userFormMode === 'create' && userFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    setUserFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).filter(Boolean) as string[];
      if (errorMessages.length > 0) {
        showErrorAlert('Please fix the following errors:', { validation: errorMessages });
      }
      return false;
    }
    return true;
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      school_email: '',
      account_name: '',
      school_code: '',
      mobile_number: '',
      password: '',
      account_status: 'active',
    });
    setUserFormErrors({});
    setSelectedUser(null);
    setUsersErrorMsg(null);
  };

  const openCreateUserModal = () => {
    setUserFormMode('create');
    resetUserForm();
    setIsUserFormModalOpen(true);
  };

  const openEditUserModal = (user: UserRecord) => {
    setUserFormMode('edit');
    setSelectedUser(user);
    setUserFormData({
      username: user.username,
      school_email: user.school_email,
      account_name: user.account_name,
      school_code: user.school_code,
      mobile_number: user.mobile_number || '',
      password: '',
      account_status: user.account_status,
    });
    setUserFormErrors({});
    setIsUserFormModalOpen(true);
  };

  const openResetPasswordModal = (user: UserRecord) => {
    setMenuUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  // Update the userColumns - add a hidden id column for sorting
  const userColumns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 0,
      sortable: true,
    },
    {
      field: 'account_name',
      headerName: 'Full Name',
      width: 200,
      sortable: false, // Disable sorting on name to keep order
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#2563eb', fontSize: '0.875rem' }}>
            {params.row.account_name?.charAt(0).toUpperCase() || 'A'}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.row.account_name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'username',
      headerName: 'Username',
      width: 150,
      sortable: false,
    },
    {
      field: 'school_email',
      headerName: 'Email',
      width: 220,
      sortable: false,
    },
    {
      field: 'school_code',
      headerName: 'School Code',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.school_code.toUpperCase()}
          size="small"
          sx={{ bgcolor: '#e0e7ff', color: '#2563eb', fontWeight: 600, fontFamily: 'monospace' }}
        />
      ),
    },
    {
      field: 'mobile_number',
      headerName: 'Mobile',
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">{params.row.mobile_number || '—'}</Typography>
      ),
    },
    {
      field: 'account_status',
      headerName: 'Status',
      width: 110,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.account_status === 'active' ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            bgcolor: getStatusBgColor(params.row.account_status),
            color: getStatusColor(params.row.account_status),
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'last_successful_login',
      headerName: 'Last Login',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Typography variant="body2">{formatDate(params.row.last_successful_login)}</Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Settings">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setUsersAnchorEl(e.currentTarget);
              setMenuUser(params.row as UserRecord);
            }}
            sx={{ color: '#64748b' }}
          >
            <IconifyIcon icon="mdi:settings" fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const filteredUsers = useMemo(() => {
    if (!usersSearchQuery.trim()) return users;
    const searchLower = usersSearchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(searchLower) ||
        user.account_name?.toLowerCase().includes(searchLower) ||
        user.school_email?.toLowerCase().includes(searchLower) ||
        user.school_code?.toLowerCase().includes(searchLower),
    );
  }, [users, usersSearchQuery]);

  useEffect(() => {
    fetchUsers();
    fetchSchoolsList();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Admin Users Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage all School Admin users in the system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<IconifyIcon icon="mdi:plus" />}
          onClick={openCreateUserModal}
          sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563eb' }}
        >
          Add New Admin
        </Button>
      </Stack>

      {usersErrorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUsersErrorMsg(null)}>
          {usersErrorMsg}
        </Alert>
      )}

      <Menu
        anchorEl={usersAnchorEl}
        open={Boolean(usersAnchorEl)}
        onClose={() => setUsersAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            if (menuUser) openEditUserModal(menuUser);
            setUsersAnchorEl(null);
          }}
          sx={{ gap: 1 }}
        >
          <IconifyIcon icon="mdi:pencil-outline" fontSize={18} color="#f59e0b" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit Admin
          </Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuUser) openResetPasswordModal(menuUser);
            setUsersAnchorEl(null);
          }}
          sx={{ gap: 1 }}
        >
          <IconifyIcon icon="mdi:key" fontSize={18} color="#2563eb" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Reset Password
          </Typography>
        </MenuItem>
      </Menu>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: 3 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <TextField
            placeholder="Search by name, username, email, or school..."
            value={usersSearchQuery}
            onChange={(e) => setUsersSearchQuery(e.target.value)}
            size="small"
            variant="outlined"
            fullWidth={isMobileDevice}
            sx={{ width: { xs: '100%', sm: 320 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconifyIcon icon="mdi:magnify" fontSize={20} color="#64748b" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<IconifyIcon icon="mdi:filter" />}
            onClick={() => setIsUserFilterModalOpen(true)}
            fullWidth={isMobileDevice}
          >
            Filter
          </Button>
        </Stack>
      </Stack>

      <Dialog
        open={isUserFilterModalOpen}
        onClose={() => setIsUserFilterModalOpen(false)}
        title="Filter Admin Users"
        maxWidth={500}
        actions={[
          {
            label: 'Reset',
            onClick: () => {
              setFilterStatus('');
              setFilterUserSchoolCode('');
              fetchUsers();
              setIsUserFilterModalOpen(false);
            },
            color: 'secondary',
            variant: 'outlined',
            startIcon: 'mdi:refresh',
          },
          {
            label: 'Apply Filter',
            onClick: () => {
              fetchUsers();
              setIsUserFilterModalOpen(false);
            },
            color: 'primary',
            variant: 'contained',
            startIcon: 'mdi:filter',
          },
        ]}
        content={
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Account Status</InputLabel>
              <Select
                value={filterStatus}
                label="Account Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>School</InputLabel>
              <Select
                value={filterUserSchoolCode}
                label="School"
                onChange={(e) => setFilterUserSchoolCode(e.target.value)}
              >
                <MenuItem value="">All Schools</MenuItem>
                {schoolsList.map((school) => (
                  <MenuItem key={school.school_code} value={school.school_code}>
                    {school.school_name} ({school.school_code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        }
      />

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #e9edf4', overflow: 'hidden' }}
      >
        <DataGrid
          rowHeight={64}
          rows={filteredUsers}
          columns={userColumns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            sorting: { sortModel: [{ field: 'id', sort: 'desc' }] }, // Sort by ID descending
          }}
          getRowId={(row) => row.id}
          slots={{
            basePagination: (props) => <DataGridPagination showFullPagination {...props} />,
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': { outline: 'none' },
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: '#f8fafc',
              borderBottom: '1px solid #e9edf4',
            },
          }}
        />
      </Paper>

      <Dialog
        open={isUserFormModalOpen}
        onClose={() => {
          if (!isUserSubmitting) setIsUserFormModalOpen(false);
        }}
        title={userFormMode === 'create' ? 'Add New Admin User' : 'Edit Admin User'}
        maxWidth={550}
        showLoading={isUserSubmitting}
        loadingTitle={userFormMode === 'create' ? 'Creating admin...' : 'Saving changes...'}
        hideCloseButton={isUserSubmitting}
        disableBackdropClick={isUserSubmitting}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsUserFormModalOpen(false),
            color: 'secondary',
            variant: 'outlined',
            disabled: isUserSubmitting,
          },
          {
            label: userFormMode === 'create' ? 'Create Admin' : 'Save Changes',
            onClick: userFormMode === 'create' ? createUser : updateUser,
            color: 'primary',
            variant: 'contained',
            startIcon: userFormMode === 'create' ? 'mdi:plus' : 'mdi:content-save',
            disabled: isUserSubmitting,
          },
        ]}
        content={
          <Stack direction="column" spacing={2.5}>
            <TextField
              fullWidth
              size="small"
              label="Full Name"
              placeholder="Enter full name"
              value={userFormData.account_name}
              onChange={(e) => setUserFormData({ ...userFormData, account_name: e.target.value })}
              error={!!userFormErrors.account_name}
              helperText={userFormErrors.account_name}
            />
            <TextField
              fullWidth
              size="small"
              label="Username"
              placeholder="Enter username"
              value={userFormData.username}
              onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
              error={!!userFormErrors.username}
              helperText={userFormErrors.username}
            />
            <TextField
              fullWidth
              size="small"
              label="Email Address"
              type="email"
              placeholder="admin@school.edu.ph"
              value={userFormData.school_email}
              onChange={(e) => setUserFormData({ ...userFormData, school_email: e.target.value })}
              error={!!userFormErrors.school_email}
              helperText={userFormErrors.school_email}
            />
            <FormControl fullWidth size="small">
              <InputLabel>School</InputLabel>
              <Select
                value={userFormData.school_code}
                label="School"
                onChange={(e) => setUserFormData({ ...userFormData, school_code: e.target.value })}
              >
                <MenuItem value="">Select School</MenuItem>
                {schoolsList.map((school) => (
                  <MenuItem key={school.school_code} value={school.school_code}>
                    {school.school_name} ({school.school_code})
                  </MenuItem>
                ))}
              </Select>
              {userFormErrors.school_code && (
                <Typography variant="caption" sx={{ color: '#d32f2f', mt: 0.5 }}>
                  {userFormErrors.school_code}
                </Typography>
              )}
            </FormControl>
            <TextField
              fullWidth
              size="small"
              label="Mobile Number"
              placeholder="09171234567"
              value={userFormData.mobile_number}
              onChange={(e) => setUserFormData({ ...userFormData, mobile_number: e.target.value })}
            />
            {userFormMode === 'create' && (
              <TextField
                fullWidth
                size="small"
                label="Password"
                type="password"
                placeholder="Enter password (min. 8 characters)"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                error={!!userFormErrors.password}
                helperText={userFormErrors.password}
              />
            )}
            <FormControl fullWidth size="small">
              <InputLabel>Account Status</InputLabel>
              <Select
                value={userFormData.account_status}
                label="Account Status"
                onChange={(e) =>
                  setUserFormData({ ...userFormData, account_status: e.target.value })
                }
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        }
      />

      <Dialog
        open={isPasswordModalOpen}
        onClose={() => {
          if (!isResetting) setIsPasswordModalOpen(false);
        }}
        title="Reset Password"
        maxWidth={400}
        showLoading={isResetting}
        loadingTitle="Resetting password..."
        hideCloseButton={isResetting}
        disableBackdropClick={isResetting}
        actions={[
          {
            label: 'Cancel',
            onClick: () => setIsPasswordModalOpen(false),
            color: 'secondary',
            variant: 'outlined',
            disabled: isResetting,
          },
          {
            label: 'Reset Password',
            onClick: resetPassword,
            color: 'primary',
            variant: 'contained',
            startIcon: 'mdi:key',
            disabled: isResetting,
          },
        ]}
        content={
          <Stack direction="column" spacing={2}>
            <Typography variant="body2">
              Reset password for: <strong>{menuUser?.account_name}</strong> ({menuUser?.username})
            </Typography>
            <TextField
              fullWidth
              size="small"
              label="New Password"
              type="password"
              placeholder="Enter new password (min. 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Stack>
        }
      />
    </>
  );
};

// ============================================================
// MAIN ACCOUNTS MANAGEMENT COMPONENT
// ============================================================
const AccountsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Schools" icon={<IconifyIcon icon="mdi:school" />} iconPosition="start" />
        <Tab
          label="Admin Users"
          icon={<IconifyIcon icon="mdi:account-group" />}
          iconPosition="start"
        />
      </Tabs>

      {activeTab === 0 && <SchoolManagement />}
      {activeTab === 1 && <UserManagement />}
    </Box>
  );
};

export default AccountsManagement;
