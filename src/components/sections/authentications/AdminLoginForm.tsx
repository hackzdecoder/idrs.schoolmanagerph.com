import React from 'react';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
import PasswordTextField from 'components/common/PasswordTextField';
import { Dialog } from 'components/dialogs/Dialog';
import PageLoader from 'components/loading/PageLoader';
import TermsAndPrivacyContent from '../../../helpers/TermsAndPrivacyContent';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FormErrors {
  username?: string;
  password?: string;
}

interface AdminLoginResponse {
  success: boolean;
  error?: string;
  response?: string;
  access_token?: string;
  access_expires_at?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    account_name: string;
    role: string;
    account_status: string;
    user_level: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEYS = {
  USER: 'user',
  ACCESS_EXPIRES_AT: 'access_expires_at',
} as const;

// ============================================================================
// Component
// ============================================================================

const AdminLoginForm: React.FC = () => {
  const { post, loading: apiLoading, error: apiError } = useRouteApiSetup();

  // State Management
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Combined Terms & Privacy Modal State
  const [termsPrivacyModalOpen, setTermsPrivacyModalOpen] = useState(false);
  const [termsPrivacyAccepted, setTermsPrivacyAccepted] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  // ==========================================================================
  // Validation Helpers
  // ==========================================================================

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================================================
  // Storage Helpers
  // ==========================================================================

  const storeUserData = (user: AdminLoginResponse['user']): void => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  };

  const storeTokenExpiry = (expiresAt: string): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_EXPIRES_AT, expiresAt);
  };

  // ==========================================================================
  // Event Handlers
  // ==========================================================================

  const handleChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });
      if (errors[field as keyof FormErrors]) {
        setErrors({ ...errors, [field]: undefined });
      }
      if (submitError) setSubmitError(null);
    };

  const handleBlur = (field: keyof typeof touched) => () => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ username: true, password: true });

    if (!validateForm()) return;

    if (!termsPrivacyAccepted) {
      setSubmitError('You must accept the Terms and Privacy Policy before logging in.');
      return;
    }

    setSubmitError(null);

    try {
      const response = await post<AdminLoginResponse>('/verify-user-account', {
        username: formData.username.trim(),
        password: formData.password,
      });

      if (response.success && response.access_token && response.user) {
        storeUserData(response.user);

        if (response.access_expires_at) {
          storeTokenExpiry(response.access_expires_at);
        }

        window.location.replace(paths.root);
      } else {
        setSubmitError(
          response.error || response.response || 'Login failed. Please check your credentials.',
        );
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setSubmitError(err?.message || 'An error occurred during login. Please try again.');
    }
  };

  // ==========================================================================
  // Modal Handlers
  // ==========================================================================

  const handleOpenTermsPrivacyModal = () => {
    setIsCheckboxChecked(false);
    setTermsPrivacyModalOpen(true);
  };

  const handleCloseTermsPrivacyModal = () => {
    setTermsPrivacyModalOpen(false);
    setIsCheckboxChecked(false);
  };

  const handleAcceptTermsPrivacy = () => {
    console.log('Accept clicked, isCheckboxChecked:', isCheckboxChecked);
    if (isCheckboxChecked) {
      setTermsPrivacyAccepted(true);
      setTermsPrivacyModalOpen(false);
      setIsCheckboxChecked(false);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    console.log('Checkbox changed in parent:', checked);
    setIsCheckboxChecked(checked);
  };

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
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: { xs: 2, sm: 3, md: 0 },
          px: { xs: 2, sm: 3 },
          backgroundImage: {
            xs: 'none',
            md: 'url("/assets/images/admin-login-bg.jpg")',
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
                p: { xs: 2.5, sm: 4, md: 5 },
              }}
            >
              <Stack
                direction="column"
                spacing={1.5}
                sx={{
                  mb: { xs: 2, sm: 3 },
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
                  <Icon icon="mdi:shield-account" width={32} height={32} />
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
                  Please provide your valid username and password
                </Typography>
              </Stack>

              <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

              <Box component="form" noValidate onSubmit={handleSubmit}>
                <Stack spacing={2.5} direction="column">
                  {renderErrorAlert()}

                  <TextField
                    fullWidth
                    size="medium"
                    id="username"
                    label="Username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange('username')}
                    onBlur={handleBlur('username')}
                    error={touched.username && !!errors.username}
                    helperText={touched.username && errors.username}
                    disabled={apiLoading}
                    autoComplete="username"
                  />

                  <PasswordTextField
                    fullWidth
                    size="medium"
                    id="password"
                    label="Password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    disabled={apiLoading}
                    autoComplete="current-password"
                  />

                  <Button
                    fullWidth
                    type="submit"
                    size="large"
                    variant="contained"
                    color="primary"
                    disabled={apiLoading || !termsPrivacyAccepted}
                    sx={{ py: { xs: 1.2, sm: 1.5 }, mt: { xs: 0.5, sm: 1 } }}
                  >
                    {apiLoading ? 'Logging in...' : 'Login'}
                  </Button>

                  <Divider sx={{ my: 1 }}>
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Link
                        component="button"
                        type="button"
                        variant="body2"
                        onClick={handleOpenTermsPrivacyModal}
                        sx={{
                          cursor: 'pointer',
                          fontSize: { xs: 11, sm: 12 },
                          '&:hover': {
                            color: 'primary.main',
                          },
                        }}
                      >
                        I have read and I agree to the <b>TERMS</b> and <b>PRIVACY POLICY</b>
                      </Link>
                    </Stack>
                  </Divider>
                </Stack>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog with memoized actions */}
      <Dialog
        open={termsPrivacyModalOpen}
        onClose={handleCloseTermsPrivacyModal}
        disableBackdropClick={true}
        disableEscapeKeyDown={true}
        title="Terms & Privacy Policy"
        maxWidth={700}
        hideCloseButton={false}
        content={
          <TermsAndPrivacyContent
            onCheckboxChange={handleCheckboxChange}
            isChecked={isCheckboxChecked}
          />
        }
        actions={
          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
            <Button onClick={handleCloseTermsPrivacyModal} variant="outlined" color="secondary">
              Close
            </Button>
            <Button
              onClick={handleAcceptTermsPrivacy}
              variant="contained"
              color="primary"
              disabled={!isCheckboxChecked}
            >
              I Agree
            </Button>
          </Box>
        }
      />
    </>
  );
};

export default AdminLoginForm;
