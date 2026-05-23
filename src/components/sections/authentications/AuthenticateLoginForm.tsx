import React, { useCallback, useState } from 'react';
import { Icon } from '@iconify/react';
import { Alert, Avatar, Box, Button, Divider, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
import PageLoader from 'components/loading/PageLoader';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FormData {
  school_code: string;
  student_id: string;
  mobile_no: string;
}

interface FormErrors {
  school_code?: string;
  student_id?: string;
  mobile_no?: string;
}

interface StudentInfo {
  first_name: string;
  surname: string;
  level: string;
  section_course: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  account_name: string;
  role: string;
  account_status: string;
  user_level: string;
  student_id?: string;
  school_code?: string;
  redirect_to?: string;
  student_info?: StudentInfo;
}

interface StudentLoginResponse {
  success: boolean;
  error?: string;
  response?: string;
  access_token?: string;
  access_expires_at?: string;
  redirect_to?: string;
  user?: UserData;
}

// ============================================================================
// Constants
// ============================================================================

// Validation Patterns
const MOBILE_REGEX = /^09[0-9]{9}$/;
const SCHOOL_CODE_REGEX = /^[A-Za-z0-9]+$/;
const STUDENT_ID_REGEX = /^[0-9]{11}$/;

const STORAGE_KEYS = {
  USER: 'user',
  STUDENT_INFO: 'student_info',
  ACCESS_EXPIRES_AT: 'access_expires_at',
} as const;

// ============================================================================
// Component
// ============================================================================

const AuthenticateLoginForm: React.FC = () => {
  const { post, loading: apiLoading, error: apiError } = useRouteApiSetup();

  // State Management
  const [formData, setFormData] = useState<FormData>({
    school_code: '',
    student_id: '',
    mobile_no: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
    school_code: false,
    student_id: false,
    mobile_no: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ==========================================================================
  // Validation Helpers
  // ==========================================================================

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // School Code validation
    if (!formData.school_code.trim()) {
      newErrors.school_code = 'School code is required';
    } else if (!SCHOOL_CODE_REGEX.test(formData.school_code)) {
      newErrors.school_code =
        'School code must contain only letters and numbers (no spaces or special characters)';
    }

    // Student ID validation
    if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
    } else if (!STUDENT_ID_REGEX.test(formData.student_id)) {
      newErrors.student_id = 'Student ID must be 11 digit numbers (e.g., 26010000001)';
    }

    // Mobile number validation
    if (!formData.mobile_no.trim()) {
      newErrors.mobile_no = 'Mobile number is required';
    } else if (!MOBILE_REGEX.test(formData.mobile_no)) {
      newErrors.mobile_no =
        'Please enter a valid mobile number starting with 09 (e.g., 09123456789)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ==========================================================================
  // Storage Helpers
  // ==========================================================================

  const storeUserData = useCallback((user: UserData): void => {
    const { student_info, ...userWithoutStudentInfo } = user;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userWithoutStudentInfo));

    if (student_info) {
      localStorage.setItem(STORAGE_KEYS.STUDENT_INFO, JSON.stringify(student_info));
    }
  }, []);

  const storeTokenExpiry = useCallback((expiresAt: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_EXPIRES_AT, expiresAt);
  }, []);

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleChange = useCallback(
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      if (field === 'student_id') {
        value = value.replace(/[^0-9]/g, '').slice(0, 11);
      } else if (field === 'school_code') {
        value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      } else if (field === 'mobile_no') {
        value = value.replace(/[^0-9]/g, '').slice(0, 11);
      }

      setFormData((prev) => ({ ...prev, [field]: value }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      if (submitError) setSubmitError(null);
    },
    [errors, submitError],
  );

  const handleBlur = useCallback(
    (field: keyof FormData) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    [],
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setTouched({
        school_code: true,
        student_id: true,
        mobile_no: true,
      });

      if (!validateForm()) return;

      setSubmitError(null);

      try {
        const response = await post<StudentLoginResponse>('/verify-user-account', {
          school_code: formData.school_code.trim(),
          student_id: formData.student_id.trim(),
          mobile_no: formData.mobile_no,
        });

        if (response.success && response.access_token && response.user) {
          storeUserData(response.user);

          if (response.access_expires_at) {
            storeTokenExpiry(response.access_expires_at);
          }

          const redirectPath = response.redirect_to || response.user?.redirect_to || paths.root;
          // Use replace to prevent going back to the login form
          window.location.replace(redirectPath);
        } else {
          setSubmitError(
            response.error || response.response || 'Login failed. Please check your credentials.',
          );
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An error occurred during login. Please try again.';
        setSubmitError(errorMessage);
      }
    },
    [formData, validateForm, post, storeUserData, storeTokenExpiry],
  );

  // ==========================================================================
  // Render Helpers
  // ==========================================================================

  const renderErrorAlert = (): React.ReactNode => {
    const errorMessage = submitError || apiError;
    if (!errorMessage) return null;

    return (
      <Alert severity="error" sx={{ borderRadius: 1 }}>
        {errorMessage}
      </Alert>
    );
  };

  if (apiLoading) return <PageLoader />;

  // ==========================================================================
  // Main Render
  // ==========================================================================

  return (
    <Box
      sx={{
        minHeight: { xs: 'auto', md: '100vh' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, sm: 4, md: 0 },
        px: { xs: 2, sm: 3 },
        backgroundImage: {
          xs: 'none',
          md: 'url("/assets/images/student-enrollment-bg.jpg")',
        },
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: { xs: '#f5f5f5', md: 'transparent' },
      }}
    >
      <Grid
        container
        sx={{
          maxWidth: '35rem',
          width: '100%',
          mx: 'auto',
        }}
      >
        <Grid size={12}>
          <Box
            sx={{
              bgcolor: 'background.paper',
              borderRadius: { xs: 3, sm: 4 },
              boxShadow: { xs: 0, sm: 1 }, // No shadow on mobile for cleaner look
              p: { xs: 2.5, sm: 4, md: 5 }, // Reduced padding on mobile
            }}
          >
            {/* Header Section - Reduced spacing on mobile */}
            <Stack
              direction="column"
              spacing={1.5} // Reduced from 2 on mobile
              sx={{
                mb: { xs: 2, sm: 3 }, // Reduced margin bottom on mobile
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <Avatar
                sx={{
                  width: { xs: 56, sm: 64, md: 80 },
                  height: { xs: 56, sm: 64, md: 80 },
                  bgcolor: '#2563eb',
                }}
              >
                <Icon icon="mdi:account-group" width={32} height={32} />
              </Avatar>

              <Typography
                variant="h4"
                sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}
              >
                ID Registration Portal
              </Typography>

              <Typography
                variant="subtitle1"
                sx={{ color: 'text.secondary', fontSize: { xs: 12, sm: 13, md: 14 } }}
              >
                Please provide your School Code, Student ID, and Mobile Number
              </Typography>
            </Stack>

            <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

            {/* Login Form - Reduced spacing on mobile */}
            <Box component="form" noValidate onSubmit={handleSubmit}>
              <Stack spacing={2.5} direction="column">
                {' '}
                {/* Reduced from 3 on mobile */}
                {renderErrorAlert()}
                <TextField
                  fullWidth
                  size="medium"
                  id="school_code"
                  label="School Code"
                  placeholder="Enter your school code (e.g., abc123)"
                  value={formData.school_code}
                  onChange={handleChange('school_code')}
                  onBlur={handleBlur('school_code')}
                  error={touched.school_code && !!errors.school_code}
                  helperText={touched.school_code && errors.school_code}
                  disabled={apiLoading}
                  autoComplete="off"
                  inputProps={{
                    autoCapitalize: 'characters',
                  }}
                />
                <TextField
                  fullWidth
                  size="medium"
                  id="student_id"
                  label="Student ID Number"
                  placeholder="e.g., 260******** (11 digits)"
                  value={formData.student_id}
                  onChange={handleChange('student_id')}
                  onBlur={handleBlur('student_id')}
                  error={touched.student_id && !!errors.student_id}
                  helperText={touched.student_id && errors.student_id}
                  disabled={apiLoading}
                  autoComplete="off"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 11,
                  }}
                />
                <TextField
                  fullWidth
                  size="medium"
                  id="mobile_no"
                  label="Mobile Number"
                  placeholder="e.g., 09123456789 (11 digits)"
                  value={formData.mobile_no}
                  onChange={handleChange('mobile_no')}
                  onBlur={handleBlur('mobile_no')}
                  error={touched.mobile_no && !!errors.mobile_no}
                  helperText={touched.mobile_no && errors.mobile_no}
                  disabled={apiLoading}
                  autoComplete="off"
                  inputProps={{
                    inputMode: 'tel',
                    pattern: '[0-9]*',
                    maxLength: 11,
                  }}
                />
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  color="primary"
                  disabled={apiLoading}
                  sx={{ py: { xs: 1.2, sm: 1.5 }, mt: { xs: 0.5, sm: 1 } }}
                >
                  {apiLoading ? 'Logging in...' : 'Login'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuthenticateLoginForm;
