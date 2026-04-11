import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
import Swal from 'sweetalert2';
import PasswordTextField from 'components/common/PasswordTextField';
import PageLoader from 'components/loading/PageLoader';
import SocialAuth from './SocialAuth';

interface LoginFormProps {
  defaultCredential?: { username: string; password: string };
}

interface FormErrors {
  username?: string;
  password?: string;
}

interface LoginResponse {
  success: boolean;
  response?: string;
  error?: string;
  user?: {
    username: string;
    email: string;
    role: string;
    user_id: string;
    account_status: string;
  };
  access_token?: string;
  access_expires_at?: string;
}

const LoginForm = ({ defaultCredential }: LoginFormProps) => {
  const navigate = useNavigate();
  const { post, loading: apiLoading, error: apiError, setAuthToken } = useRouteApiSetup();
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    username: false,
    password: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: defaultCredential?.username || '',
    password: defaultCredential?.password || '',
  });

  useState(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  });

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });

      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }

      if (submitError) {
        setSubmitError(null);
      }
    };

  const handleBlur = (field: keyof typeof touched) => () => {
    setTouched({ ...touched, [field]: true });

    if (field === 'username') {
      if (!formData.username) {
        setErrors({ ...errors, username: 'Username is required' });
      } else if (formData.username.length < 3) {
        setErrors({ ...errors, username: 'Username must be at least 3 characters' });
      } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        setErrors({
          ...errors,
          username: 'Username can only contain letters, numbers, and underscores',
        });
      }
    }

    if (field === 'password') {
      if (!formData.password) {
        setErrors({ ...errors, password: 'Password is required' });
      } else if (formData.password.length < 6) {
        setErrors({ ...errors, password: 'Password must be at least 6 characters' });
      }
    }
  };

  /**
   * Handle forgot password click
   */
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Not Available',
      text: 'This feature is not available yet. Please contact the administrator.',
      icon: 'info',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
      },
    });
  };

  /**
   * Handle trouble signing in click
   */
  const handleTroubleSigningIn = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Need Help?',
      text: 'Please contact the administrator for assistance with your account.',
      icon: 'info',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
      },
    });
  };

  /**
   * Handle login form submission
   */
  const handleLoginForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      username: true,
      password: true,
    });

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      const response = await post<LoginResponse>('/login', {
        username: formData.username,
        password: formData.password,
      });

      if (response.success && response.access_token) {
        setAuthToken(response.access_token);

        if (response.user) {
          localStorage.setItem(
            'user',
            JSON.stringify({
              username: response.user.username,
              email: response.user.email,
              role: response.user.role,
              user_id: response.user.user_id,
            }),
          );
        }

        navigate(paths.root, { replace: true });
      } else {
        setSubmitError(response.error ?? null);
      }
    } catch (err: any) {
      setSubmitError(err?.message ?? null);
    }
  };

  if (pageLoading || apiLoading) {
    return <PageLoader />;
  }

  return (
    <Stack
      direction="column"
      sx={{
        height: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: { md: 10 },
        pb: 10,
      }}
    >
      <div />

      <Grid
        container
        sx={{
          maxWidth: '35rem',
          rowGap: 4,
          p: { xs: 3, sm: 5 },
          mb: 5,
        }}
      >
        <Grid size={12}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
            }}
          >
            <Typography variant="h4">Log in</Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'text.secondary',
              }}
            >
              Don&apos;t have an account?
              <Link href={paths.user_existence} sx={{ ml: 1 }}>
                Sign up
              </Link>
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <SocialAuth />
        </Grid>
        <Grid size={12}>
          <Divider sx={{ color: 'text.secondary' }}>or use username</Divider>
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleLoginForm}>
            <Grid container>
              {submitError && (
                <Grid size={12} sx={{ mb: 2 }}>
                  <Alert severity="error" sx={{ borderRadius: 1 }}>
                    {submitError}
                  </Alert>
                </Grid>
              )}

              {apiError && !submitError && (
                <Grid size={12} sx={{ mb: 2 }}>
                  <Alert severity="error" sx={{ borderRadius: 1 }}>
                    {apiError}
                  </Alert>
                </Grid>
              )}

              <Grid sx={{ mb: 2 }} size={12}>
                <TextField
                  fullWidth
                  size="large"
                  id="username"
                  type="text"
                  label="Username"
                  value={formData.username}
                  onChange={handleChange('username')}
                  onBlur={handleBlur('username')}
                  error={touched.username && !!errors.username}
                  helperText={touched.username && errors.username}
                  disabled={apiLoading}
                  autoComplete="username"
                />
              </Grid>
              <Grid sx={{ mb: 2.5 }} size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  id="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  disabled={apiLoading}
                />
              </Grid>

              {Object.keys(errors).length > 0 &&
                (touched.username || touched.password) &&
                !submitError &&
                !apiError && (
                  <Grid size={12} sx={{ mb: 2 }}>
                    <Alert severity="error" sx={{ borderRadius: 1 }}>
                      {errors.username && errors.password
                        ? 'Please enter a valid username and password'
                        : errors.username
                          ? 'Please enter a valid username'
                          : 'Please enter a valid password'}
                    </Alert>
                  </Grid>
                )}

              <Grid sx={{ mb: 6 }} size={12}>
                <Stack
                  spacing={1}
                  sx={{
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox name="checked" color="primary" size="small" disabled={apiLoading} />
                    }
                    label={
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        Remember this device
                      </Typography>
                    }
                  />

                  <Link
                    href="#!"
                    variant="subtitle2"
                    onClick={handleForgotPassword}
                    sx={{
                      pointerEvents: apiLoading ? 'none' : 'auto',
                      opacity: apiLoading ? 0.5 : 1,
                      cursor: apiLoading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={apiLoading}
                >
                  Log in
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Link
        href="#!"
        variant="subtitle2"
        onClick={handleTroubleSigningIn}
        sx={{
          pointerEvents: apiLoading ? 'none' : 'auto',
          opacity: apiLoading ? 0.5 : 1,
          cursor: apiLoading ? 'not-allowed' : 'pointer',
        }}
      >
        Trouble signing in?
      </Link>
    </Stack>
  );
};

export default LoginForm;
