import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
import Swal from 'sweetalert2';
import IconifyIcon from 'components/base/IconifyIcon';
import PasswordTextField from 'components/common/PasswordTextField';
import PageLoader from 'components/loading/PageLoader';

interface StudentInfo {
  first_name: string;
  middle_name: string;
  last_name: string;
  suffix: string;
  nickname: string;
  present_address: string;
  permanent_address: string;
}

interface UserAccount {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface FormErrors {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  nickname?: string;
  present_address?: string;
  permanent_address?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

const steps = ['Student Information', 'Create Account'];

const NewStudentForm = () => {
  const navigate = useNavigate();
  const { post, loading: apiLoading } = useRouteApiSetup();
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    nickname: '',
    present_address: '',
    permanent_address: '',
  });

  const [userAccount, setUserAccount] = useState<UserAccount>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  /**
   * Validate student information step
   */
  const validateStudentInfo = (): boolean => {
    const newErrors: FormErrors = {};

    if (!studentInfo.first_name) {
      newErrors.first_name = 'First name is required';
    }

    if (!studentInfo.last_name) {
      newErrors.last_name = 'Last name is required';
    }

    if (!studentInfo.present_address) {
      newErrors.present_address = 'Present address is required';
    }

    if (!studentInfo.permanent_address) {
      newErrors.permanent_address = 'Permanent address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Validate user account step
   */
  const validateUserAccount = (): boolean => {
    const newErrors: FormErrors = {};

    if (!userAccount.username) {
      newErrors.username = 'Username is required';
    } else if (userAccount.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(userAccount.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!userAccount.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userAccount.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!userAccount.password) {
      newErrors.password = 'Password is required';
    } else if (userAccount.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (userAccount.password !== userAccount.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle next step
   */
  const handleNext = () => {
    setSubmitError(null);

    if (activeStep === 0) {
      if (validateStudentInfo()) {
        setActiveStep(1);
        setErrors({});
        setTouched({});
      }
    } else if (activeStep === 1) {
      if (validateUserAccount()) {
        handleSubmit();
      }
    }
  };

  /**
   * Handle back step
   */
  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  };

  /**
   * Handle back to user existence
   */
  const handleBackToUserExistence = () => {
    navigate(paths.user_existence);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    try {
      const response = await post<{
        success: boolean;
        response: string;
      }>('/student/register/new', {
        student: studentInfo,
        user: {
          username: userAccount.username,
          email: userAccount.email,
          password: userAccount.password,
        },
      });

      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created. You can now log in.',
          confirmButtonColor: '#2563eb',
          confirmButtonText: 'Go to Login',
          background: '#ffffff',
          customClass: {
            popup: 'rounded-lg shadow-lg',
          },
        });
        navigate(paths.login);
      }
    } catch (error: any) {
      setSubmitError(error?.message || 'An error occurred during registration');
    }
  };

  const handleStudentInfoChange =
    (field: keyof StudentInfo) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setStudentInfo({ ...studentInfo, [field]: event.target.value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
      if (submitError) {
        setSubmitError(null);
      }
    };

  const handleUserAccountChange =
    (field: keyof UserAccount) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setUserAccount({ ...userAccount, [field]: event.target.value });
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
      if (submitError) {
        setSubmitError(null);
      }
    };

  const handleBlur = (field: string) => () => {
    setTouched({ ...touched, [field]: true });
  };

  if (apiLoading) {
    return <PageLoader />;
  }

  return (
    <Stack
      direction="column"
      sx={{
        height: 1,
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Grid
        container
        sx={{
          maxWidth: '45rem',
          rowGap: 4,
        }}
      >
        {/* Back Button */}
        <Grid size={12}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={handleBackToUserExistence}
              sx={{
                bgcolor: '#f1f5f9',
                '&:hover': { bgcolor: '#e2e8f0' },
              }}
            >
              <IconifyIcon icon="mdi:arrow-left" fontSize={20} />
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              Back to Student Type Selection
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Typography variant="h4" align="center" sx={{ mb: 1 }}>
            New Student Registration
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Please fill in your information to create an account
          </Typography>
        </Grid>

        <Grid size={12}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              border: '1px solid #e9edf4',
            }}
          >
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Error Messages */}
            {submitError && (
              <Alert severity="error" sx={{ borderRadius: 1, mb: 3 }}>
                {submitError}
              </Alert>
            )}

            {Object.keys(errors).length > 0 && activeStep === 0 && (
              <Alert severity="error" sx={{ borderRadius: 1, mb: 3 }}>
                Please fill in all required fields correctly
              </Alert>
            )}

            {/* Step 1: Student Information */}
            {activeStep === 0 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="First Name *"
                    value={studentInfo.first_name}
                    onChange={handleStudentInfoChange('first_name')}
                    onBlur={handleBlur('first_name')}
                    error={touched.first_name && !!errors.first_name}
                    helperText={touched.first_name && errors.first_name}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Middle Name"
                    value={studentInfo.middle_name}
                    onChange={handleStudentInfoChange('middle_name')}
                    onBlur={handleBlur('middle_name')}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Last Name *"
                    value={studentInfo.last_name}
                    onChange={handleStudentInfoChange('last_name')}
                    onBlur={handleBlur('last_name')}
                    error={touched.last_name && !!errors.last_name}
                    helperText={touched.last_name && errors.last_name}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Suffix"
                    placeholder="Jr., Sr., III, etc."
                    value={studentInfo.suffix}
                    onChange={handleStudentInfoChange('suffix')}
                    onBlur={handleBlur('suffix')}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Nickname"
                    value={studentInfo.nickname}
                    onChange={handleStudentInfoChange('nickname')}
                    onBlur={handleBlur('nickname')}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Present Address *"
                    value={studentInfo.present_address}
                    onChange={handleStudentInfoChange('present_address')}
                    onBlur={handleBlur('present_address')}
                    error={touched.present_address && !!errors.present_address}
                    helperText={touched.present_address && errors.present_address}
                    disabled={apiLoading}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Permanent Address *"
                    value={studentInfo.permanent_address}
                    onChange={handleStudentInfoChange('permanent_address')}
                    onBlur={handleBlur('permanent_address')}
                    error={touched.permanent_address && !!errors.permanent_address}
                    helperText={touched.permanent_address && errors.permanent_address}
                    disabled={apiLoading}
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Create Account */}
            {activeStep === 1 && (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Username *"
                    value={userAccount.username}
                    onChange={handleUserAccountChange('username')}
                    onBlur={handleBlur('username')}
                    error={touched.username && !!errors.username}
                    helperText={touched.username && errors.username}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="large"
                    label="Email *"
                    type="email"
                    value={userAccount.email}
                    onChange={handleUserAccountChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <PasswordTextField
                    fullWidth
                    size="large"
                    label="Password *"
                    value={userAccount.password}
                    onChange={handleUserAccountChange('password')}
                    onBlur={handleBlur('password')}
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    disabled={apiLoading}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <PasswordTextField
                    fullWidth
                    size="large"
                    label="Confirm Password *"
                    value={userAccount.confirm_password}
                    onChange={handleUserAccountChange('confirm_password')}
                    onBlur={handleBlur('confirm_password')}
                    error={touched.confirm_password && !!errors.confirm_password}
                    helperText={touched.confirm_password && errors.confirm_password}
                    disabled={apiLoading}
                  />
                </Grid>
              </Grid>
            )}

            {/* Navigation Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleBack}
                  disabled={apiLoading}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    borderColor: '#e2e8f0',
                    color: '#475569',
                    px: 4,
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                size="large"
                onClick={handleNext}
                disabled={apiLoading}
                sx={{
                  textTransform: 'none',
                  borderRadius: 2,
                  bgcolor: '#2563eb',
                  px: 4,
                  '&:hover': { bgcolor: '#1d4ed8' },
                }}
              >
                {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default NewStudentForm;
