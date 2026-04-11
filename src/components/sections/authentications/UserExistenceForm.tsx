import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Button,
  FormControlLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import paths from 'routes/paths';
import Swal from 'sweetalert2';

const UserExistenceForm = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('');

  /**
   * Handle student type selection
   */
  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    if (value === 'transferee') {
      Swal.fire({
        title: 'Not Available',
        text: 'Transferee registration is not available yet. Please choose New Student or Regular Student.',
        icon: 'info',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-lg',
        },
      });
      return;
    }

    setSelectedType(value);
  };

  /**
   * Handle continue button click
   */
  const handleContinue = () => {
    if (!selectedType) {
      Swal.fire({
        title: 'Selection Required',
        text: 'Please select a student type to continue.',
        icon: 'warning',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'OK',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-lg shadow-lg',
        },
      });
      return;
    }

    // Navigate based on selection
    if (selectedType === 'new') {
      navigate(paths.new_student);
    } else if (selectedType === 'regular') {
      navigate(paths.id_registration);
    }
  };

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
          maxWidth: '35rem',
          rowGap: 4,
        }}
      >
        <Grid size={12}>
          <Typography variant="h4" align="center" sx={{ mb: 1 }}>
            Select Student Type
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Please choose your student classification to proceed with registration
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
            <RadioGroup value={selectedType} onChange={handleTypeChange} sx={{ gap: 2 }}>
              <FormControlLabel
                value="new"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      New Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      First time enrolling in this school
                    </Typography>
                  </Box>
                }
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selectedType === 'new' ? '#2563eb' : '#e9edf4',
                  bgcolor: selectedType === 'new' ? '#f0f4fe' : 'transparent',
                  mx: 0,
                  width: '100%',
                  '&:hover': {
                    bgcolor: selectedType === 'new' ? '#f0f4fe' : '#f8fafc',
                  },
                }}
              />

              <FormControlLabel
                value="regular"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Regular Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Continuing student returning for another year
                    </Typography>
                  </Box>
                }
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selectedType === 'regular' ? '#2563eb' : '#e9edf4',
                  bgcolor: selectedType === 'regular' ? '#f0f4fe' : 'transparent',
                  mx: 0,
                  width: '100%',
                  '&:hover': {
                    bgcolor: selectedType === 'regular' ? '#f0f4fe' : '#f8fafc',
                  },
                }}
              />

              <FormControlLabel
                value="transferee"
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Transferee Student
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transferring from another school
                    </Typography>
                  </Box>
                }
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: selectedType === 'transferee' ? '#2563eb' : '#e9edf4',
                  bgcolor: selectedType === 'transferee' ? '#f0f4fe' : 'transparent',
                  mx: 0,
                  width: '100%',
                  opacity: 0.5,
                  '&:hover': {
                    bgcolor: selectedType === 'transferee' ? '#f0f4fe' : '#f8fafc',
                  },
                }}
              />
            </RadioGroup>
          </Paper>
        </Grid>

        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(paths.login)}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: '#e2e8f0',
                color: '#475569',
                px: 4,
              }}
            >
              Back to Login
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleContinue}
              disabled={!selectedType}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                bgcolor: '#2563eb',
                px: 4,
                '&:hover': { bgcolor: '#1d4ed8' },
                '&:disabled': {
                  bgcolor: '#94a3b8',
                },
              }}
            >
              Continue
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default UserExistenceForm;
