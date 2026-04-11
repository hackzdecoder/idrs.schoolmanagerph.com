import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import paths from 'routes/paths';
import PasswordTextField from 'components/common/PasswordTextField';
import PageLoader from 'components/loading/PageLoader';

interface StudentIdRegistrationFormProps {
  defaultValues?: { studentId: string; schoolIdCode: string };
}

interface VerifyResponse {
  success: boolean;
  error?: string;
  redirect?: string;
  data?: {
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    student_id: string;
    present_address: string;
    permanent_address: string;
  };
}

interface FormErrors {
  studentId?: string;
  schoolId?: string;
}

const StudentIdRegistrationForm = ({ defaultValues }: StudentIdRegistrationFormProps) => {
  const navigate = useNavigate();
  const { post, loading: apiLoading, error: apiError } = useRouteApiSetup();
  const [formData, setFormData] = useState({
    studentId: defaultValues?.studentId || '',
    schoolId: defaultValues?.schoolIdCode || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    studentId: false,
    schoolId: false,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Student ID is required';
    }

    if (!formData.schoolId) {
      newErrors.schoolId = 'School Code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange =
    (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [field]: event.target.value });

      if (errors[field as keyof FormErrors]) {
        setErrors({ ...errors, [field]: undefined });
      }

      if (submitError) {
        setSubmitError(null);
      }
    };

  const handleBlur = (field: keyof typeof touched) => () => {
    setTouched({ ...touched, [field]: true });

    if (field === 'studentId') {
      if (!formData.studentId) {
        setErrors({ ...errors, studentId: 'Student ID is required' });
      }
    }

    if (field === 'schoolId') {
      if (!formData.schoolId) {
        setErrors({ ...errors, schoolId: 'School Code is required' });
      }
    }
  };

  /**
   * Handle form submission for student verification
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      studentId: true,
      schoolId: true,
    });

    if (!validateForm()) {
      return;
    }

    setSubmitError(null);

    try {
      const response = await post<VerifyResponse>('/verify', {
        student_id: formData.studentId,
        school_code: formData.schoolId,
      });

      if (response.redirect) {
        if (response.data) {
          localStorage.setItem('existing_student_data', JSON.stringify(response.data));
        }
        navigate(response.redirect);
        return;
      }

      if (response.success && response.data) {
        localStorage.setItem('existing_student_data', JSON.stringify(response.data));
        localStorage.setItem('existing_student_school_code', formData.schoolId);
        navigate(paths.existing_student);
      } else {
        setSubmitError(response.error ?? 'Verification failed');
      }
    } catch (err: any) {
      setSubmitError(err?.message ?? 'An error occurred');
    }
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
            direction="column"
            spacing={1}
            sx={{
              mb: 2,
            }}
          >
            <Typography variant="h4">Verify Existing Student</Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: 'text.secondary',
              }}
            >
              Enter your Student ID Number and School ID Code to verify your record.
            </Typography>
          </Stack>
        </Grid>

        <Grid size={12}>
          <Divider sx={{ color: 'text.secondary' }} />
        </Grid>

        <Grid size={12}>
          <Box component="form" noValidate onSubmit={handleSubmit}>
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

              <Grid sx={{ mb: 3 }} size={12}>
                <TextField
                  fullWidth
                  size="large"
                  id="studentId"
                  label="Student ID Number"
                  placeholder="e.g., 2020-00123"
                  value={formData.studentId}
                  onChange={handleChange('studentId')}
                  onBlur={handleBlur('studentId')}
                  error={touched.studentId && !!errors.studentId}
                  helperText={touched.studentId && errors.studentId}
                  disabled={apiLoading}
                />
              </Grid>

              <Grid sx={{ mb: 6 }} size={12}>
                <PasswordTextField
                  fullWidth
                  size="large"
                  id="schoolIdCode"
                  label="School ID Code"
                  placeholder="Enter your school ID code"
                  value={formData.schoolId}
                  onChange={handleChange('schoolId')}
                  onBlur={handleBlur('schoolId')}
                  error={touched.schoolId && !!errors.schoolId}
                  helperText={touched.schoolId && errors.schoolId}
                  disabled={apiLoading}
                />
              </Grid>

              {Object.keys(errors).length > 0 &&
                (touched.studentId || touched.schoolId) &&
                !submitError &&
                !apiError && (
                  <Grid size={12} sx={{ mb: 2 }}>
                    <Alert severity="error" sx={{ borderRadius: 1 }}>
                      {errors.studentId && errors.schoolId
                        ? 'Please enter a valid Student ID and School Code'
                        : errors.studentId
                          ? 'Please enter a valid Student ID'
                          : 'Please enter a valid School Code'}
                    </Alert>
                  </Grid>
                )}

              <Grid size={12}>
                <Button
                  fullWidth
                  type="submit"
                  size="large"
                  variant="contained"
                  disabled={apiLoading}
                  sx={{
                    textTransform: 'none',
                    borderRadius: 2,
                    bgcolor: '#2563eb',
                    '&:hover': { bgcolor: '#1d4ed8' },
                  }}
                >
                  Verify & Continue
                </Button>
              </Grid>

              <Grid size={12} sx={{ mt: 3 }}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Already have an account?
                  </Typography>
                  <Link href={paths.login} variant="subtitle2">
                    Log in
                  </Link>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default StudentIdRegistrationForm;
