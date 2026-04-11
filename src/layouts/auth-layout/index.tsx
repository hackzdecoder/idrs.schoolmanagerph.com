import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Logo from 'components/common/Logo';
import image from '/assets/images/school-id-registration-background.jpg';

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Grid
      container
      sx={{
        height: { md: '100vh' },
        minHeight: '100vh',
        maxHeight: '100vh',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
        overflow: 'hidden',
      }}
    >
      {/* Left Section - Image fills entire side */}
      <Grid
        sx={{
          borderRight: { md: 1 },
          borderColor: { md: 'divider' },
          display: { xs: 'none', md: 'block' },
          overflow: 'hidden',
          height: '100%',
        }}
        size={{
          xs: 12,
          md: 6,
        }}
      >
        <Box
          component="img"
          src={image}
          alt="auth"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </Grid>

      {/* Right Section - Logo + Login Form */}
      <Grid
        size={{
          md: 6,
          xs: 12,
        }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Logo Section - Centered with minimal bottom gap */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pt: { xs: 3, sm: 4, md: 4 },
            pb: 0,
            px: { xs: 2, sm: 3 },
            flexShrink: 0,
          }}
        >
          <Logo />
        </Box>

        {/* Form Section - Starts right after logo */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            pt: { xs: 1, md: 0 },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Grid>
    </Grid>
  );
};

export default AuthLayout;
