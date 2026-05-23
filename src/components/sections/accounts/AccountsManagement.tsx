// app/src/components/sections/accounts/AccountsManagement.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  Stack,
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
import PageLoader from 'components/loading/PageLoader';
import DataGridPagination from 'components/pagination/DataGridPagination';

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

interface ApiResponse {
  success: boolean;
  data: SchoolRecord[];
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

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

const AccountsManagement = () => {
  const { get, post } = useRouteApiSetup();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolRecord | null>(null);
  const [selectedLogoPreview, setSelectedLogoPreview] = useState<string | null>(null);

  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSchool, setMenuSchool] = useState<SchoolRecord | null>(null);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Filter states
  const [filterSchoolCode, setFilterSchoolCode] = useState('');
  const [filterSchoolName, setFilterSchoolName] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState<SchoolFormData>({
    school_code: '',
    school_name: '',
    school_email: '',
    school_logo: null,
  });

  const [formErrors, setFormErrors] = useState<Partial<SchoolFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSchools = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await get<ApiResponse>('/super-admin/schools');

      if (response && response.success === true && Array.isArray(response.data)) {
        setSchools(response.data);
      } else {
        setErrorMsg('Failed to load schools');
        setSchools([]);
      }
    } catch {
      setErrorMsg('Failed to fetch schools. Please check your connection or login status.');
      setSchools([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilteredSchools = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const queryParams = new URLSearchParams();
      if (filterSchoolCode) queryParams.append('school_code', filterSchoolCode);
      if (filterSchoolName) queryParams.append('school_name', filterSchoolName);

      const queryString = queryParams.toString();
      const apiUrl = queryString ? `/super-admin/schools?${queryString}` : '/super-admin/schools';
      const response = await get<ApiResponse>(apiUrl);

      if (response && response.success === true && Array.isArray(response.data)) {
        setSchools(response.data);
        setSearchQuery('');
      } else {
        setErrorMsg('Failed to apply filter');
      }
    } catch {
      setErrorMsg('Failed to apply filter');
    } finally {
      setIsLoading(false);
      setIsFilterModalOpen(false);
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
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const submitData = new FormData();
      submitData.append('school_code', formData.school_code);
      submitData.append('school_name', formData.school_name);
      submitData.append('school_email', formData.school_email);

      if (formData.school_logo instanceof File) {
        submitData.append('school_logo', formData.school_logo);
      }

      const response = await post<ApiResponse>('/super-admin/schools', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response && response.success) {
        await fetchSchools();
        setIsFormModalOpen(false);
        resetForm();
        showSuccessAlert('Success!', 'School has been created successfully.');
      } else {
        const errorMessage = response?.message || 'Failed to create school';
        showErrorAlert(errorMessage, response?.errors);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to create school';
      showErrorAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSchool = async () => {
    if (!validateForm()) return;
    if (!selectedSchool) return;

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const submitData = new FormData();
      submitData.append('school_code', formData.school_code);
      submitData.append('school_name', formData.school_name);
      submitData.append('school_email', formData.school_email);
      submitData.append('_method', 'PUT');

      if (formData.school_logo instanceof File) {
        submitData.append('school_logo', formData.school_logo);
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
        setIsFormModalOpen(false);
        resetForm();
        showSuccessAlert('Success!', 'School has been updated successfully.');
      } else {
        const errorMessage = response?.message || 'Failed to update school';
        showErrorAlert(errorMessage, response?.errors);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to update school';
      showErrorAlert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<SchoolFormData> = {};

    if (!formData.school_code.trim()) {
      errors.school_code = 'School code is required';
    } else if (formData.school_code.length > 50) {
      errors.school_code = 'School code must be less than 50 characters';
    } else if (!/^[A-Za-z0-9]+$/.test(formData.school_code)) {
      errors.school_code = 'School code must contain only letters and numbers';
    }

    if (!formData.school_name.trim()) {
      errors.school_name = 'School name is required';
    }

    if (!formData.school_email.trim()) {
      errors.school_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.school_email)) {
      errors.school_email = 'Invalid email format';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMessages = Object.values(errors).filter(Boolean) as string[];
      if (errorMessages.length > 0) {
        showErrorAlert('Please fix the following errors:', {
          validation: errorMessages,
        });
      }
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      school_code: '',
      school_name: '',
      school_email: '',
      school_logo: null,
    });
    setSelectedLogoPreview(null);
    setFormErrors({});
    setSelectedSchool(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        showErrorAlert('Invalid file type. Please upload JPEG, PNG, JPG, GIF, or SVG files only.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        showErrorAlert('File too large. Please upload an image smaller than 2MB.');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setFormData({ ...formData, school_logo: file });
      const previewUrl = URL.createObjectURL(file);
      setSelectedLogoPreview(previewUrl);
    }
  };

  const openCreateModal = () => {
    setFormMode('create');
    resetForm();
    setIsFormModalOpen(true);
  };

  const openEditModal = (school: SchoolRecord) => {
    setFormMode('edit');
    setSelectedSchool(school);
    setFormData({
      school_code: school.school_code,
      school_name: school.school_name,
      school_email: school.school_email,
      school_logo: school.school_logo,
    });
    setSelectedLogoPreview(school.school_logo);
    setFormErrors({});
    setErrorMsg(null);
    setIsFormModalOpen(true);
  };

  const handleFormChange =
    (field: keyof Omit<SchoolFormData, 'school_logo'>) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
      if (formErrors[field]) {
        setFormErrors({ ...formErrors, [field]: undefined });
      }
    };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, school: SchoolRecord) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuSchool(school);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuSchool(null);
  };

  const handleEditClick = () => {
    if (menuSchool) {
      openEditModal(menuSchool);
    }
    handleMenuClose();
  };

  const handleFilterChange =
    (field: 'school_code' | 'school_name') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (field === 'school_code') {
        setFilterSchoolCode(event.target.value);
      } else {
        setFilterSchoolName(event.target.value);
      }
    };

  const resetFilters = () => {
    setFilterSchoolCode('');
    setFilterSchoolName('');
    fetchSchools();
    setIsFilterModalOpen(false);
  };

  const applyFilters = () => {
    fetchFilteredSchools();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools;
    const searchLower = searchQuery.toLowerCase();
    return schools.filter((school) => {
      return (
        school.school_code?.toLowerCase().includes(searchLower) ||
        school.school_name?.toLowerCase().includes(searchLower) ||
        school.school_email?.toLowerCase().includes(searchLower)
      );
    });
  }, [schools, searchQuery]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedLogoPreview && selectedLogoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(selectedLogoPreview);
      }
    };
  }, [selectedLogoPreview]);

  // ✅ UPDATED: DataGrid columns with Logo column as first column
  const dataGridColumns: GridColDef[] = [
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
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {capitalizeWords(params.row.school_name)}
          </Typography>
        );
      },
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
            onClick={(e) => handleMenuOpen(e, params.row as SchoolRecord)}
            sx={{ color: '#64748b' }}
          >
            <IconifyIcon icon="mdi:settings" fontSize={20} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (isLoading && schools.length === 0) {
    return <PageLoader />;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      {/* Header */}
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
          onClick={openCreateModal}
          sx={{
            textTransform: 'none',
            borderRadius: 2,
            bgcolor: '#2563eb',
            '&:hover': { bgcolor: '#1d4ed8' },
          }}
        >
          Add New School
        </Button>
      </Stack>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 120,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }}
      >
        <MenuItem onClick={handleEditClick} sx={{ gap: 1, py: 1 }}>
          <IconifyIcon icon="mdi:pencil-outline" fontSize={18} color="#f59e0b" />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Edit
          </Typography>
        </MenuItem>
      </Menu>

      {/* Search and Filter Bar */}
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
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            variant="outlined"
            fullWidth={isMobileDevice}
            sx={{
              width: { xs: '100%', sm: 320 },
              '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff', height: 40 },
            }}
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
            onClick={() => setIsFilterModalOpen(true)}
            fullWidth={isMobileDevice}
            sx={{
              textTransform: 'none',
              borderColor: '#e2e8f0',
              color: '#475569',
              '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
            }}
          >
            Filter
          </Button>
        </Stack>
      </Stack>

      {/* Filter Modal */}
      <Dialog
        open={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Schools"
        maxWidth={500}
        disableBackdropClick={true}
        actions={[
          {
            label: 'Reset',
            onClick: resetFilters,
            color: 'secondary',
            variant: 'outlined',
            startIcon: 'mdi:refresh',
          },
          {
            label: 'Apply Filter',
            onClick: applyFilters,
            color: 'primary',
            variant: 'contained',
            startIcon: 'mdi:filter',
          },
        ]}
        content={
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="School Code"
              placeholder="Filter by school code"
              value={filterSchoolCode}
              onChange={handleFilterChange('school_code')}
            />
            <TextField
              fullWidth
              size="small"
              label="School Name"
              placeholder="Filter by school name"
              value={filterSchoolName}
              onChange={handleFilterChange('school_name')}
            />
          </Stack>
        }
      />

      {/* DataGrid */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #e9edf4', overflow: 'hidden' }}
      >
        <DataGrid
          rowHeight={72}
          rows={filteredSchools}
          columns={dataGridColumns}
          pageSizeOptions={isMobileDevice ? [5, 10, 25] : [10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: isMobileDevice ? 5 : 10 } },
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
            '& .MuiDataGrid-row': { '&:hover': { bgcolor: '#f5f5f5' } },
          }}
        />
      </Paper>

      {/* Create/Edit School Modal */}
      <Dialog
        open={isFormModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsFormModalOpen(false);
            resetForm();
          }
        }}
        title={formMode === 'create' ? 'Add New School' : 'Edit School'}
        maxWidth={500}
        showLoading={isSubmitting}
        loadingTitle={formMode === 'create' ? 'Creating school...' : 'Saving changes...'}
        hideCloseButton={isSubmitting}
        disableBackdropClick={isSubmitting}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setIsFormModalOpen(false);
              resetForm();
            },
            color: 'secondary',
            variant: 'outlined',
            startIcon: 'mdi:close',
            disabled: isSubmitting,
          },
          {
            label: formMode === 'create' ? 'Create School' : 'Save Changes',
            onClick: formMode === 'create' ? createSchool : updateSchool,
            color: 'primary',
            variant: 'contained',
            startIcon: formMode === 'create' ? 'mdi:plus' : 'mdi:content-save',
            disabled: isSubmitting,
          },
        ]}
        content={
          <Stack direction="column" spacing={2.5} sx={{ mt: 1 }}>
            {/* Logo Upload */}
            <Box>
              <Typography
                variant="caption"
                sx={{ color: '#64748b', fontWeight: 500, display: 'block', mb: 1 }}
              >
                School Logo
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
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
                  sx={{ textTransform: 'none' }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                    onChange={handleLogoChange}
                    ref={fileInputRef}
                  />
                </Button>
                {selectedLogoPreview && (
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => {
                      setFormData({ ...formData, school_logo: null });
                      setSelectedLogoPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    sx={{ textTransform: 'none' }}
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
              value={formData.school_code}
              onChange={handleFormChange('school_code')}
              disabled={formMode === 'edit'}
              error={!!formErrors.school_code}
              helperText={formErrors.school_code}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="mdi:identifier" fontSize={18} color="#64748b" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="School Name"
              value={formData.school_name}
              onChange={handleFormChange('school_name')}
              error={!!formErrors.school_name}
              helperText={formErrors.school_name}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="mdi:school" fontSize={18} color="#64748b" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              size="small"
              label="School Email"
              type="email"
              value={formData.school_email}
              onChange={handleFormChange('school_email')}
              error={!!formErrors.school_email}
              helperText={formErrors.school_email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconifyIcon icon="mdi:email-outline" fontSize={18} color="#64748b" />
                  </InputAdornment>
                ),
              }}
            />
            {formMode === 'edit' && (
              <Typography variant="caption" sx={{ color: '#64748b', textAlign: 'center', mt: 1 }}>
                Note: School code cannot be changed after creation.
              </Typography>
            )}
          </Stack>
        }
      />
    </Box>
  );
};

export default AccountsManagement;
