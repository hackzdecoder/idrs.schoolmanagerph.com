import { Icon } from '@iconify/react';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Swal from 'sweetalert2';

const SocialAuth = () => {
  /**
   * Handle Google sign in click
   */
  const handleGoogleSignIn = (e: React.MouseEvent) => {
    e.preventDefault();
    Swal.fire({
      title: 'Not Available',
      text: 'Google Sign In is not available yet. Please use username and password to log in.',
      icon: 'info',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-lg shadow-lg',
      },
    });
  };

  return (
    <Grid
      container
      spacing={2}
      sx={{
        alignItems: 'center',
      }}
    >
      <Grid
        size={{
          xs: 12,
          lg: 12,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          color="neutral"
          size="large"
          sx={{ flex: 1, whiteSpace: 'nowrap' }}
          startIcon={<Icon icon="flat-color-icons:google" width={21} height={21} />}
          onClick={handleGoogleSignIn}
        >
          Sign in with Google
        </Button>
      </Grid>
    </Grid>
  );
};

export default SocialAuth;
