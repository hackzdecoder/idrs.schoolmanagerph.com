import { Box, Link, Typography } from '@mui/material';
import { rootPaths } from 'routes/paths';

interface LogoProps {
  showName?: boolean;
}

const Logo = ({ showName = true }: LogoProps) => {
  return (
    <Link
      href={rootPaths.root}
      underline="none"
      sx={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        component="img"
        src="/assets/images/school-logo.png"
        alt="School Logo"
        sx={{
          height: 70,
          width: 'auto',
          maxWidth: 70,
          objectFit: 'contain',
        }}
      />
      {showName && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'left',
            lineHeight: 1.2,
            ml: 1, // Added margin left for spacing
          }}
        >
          <Typography
            variant="caption"
            component="div"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              letterSpacing: 0.4,
              fontSize: 11,
            }}
          >
            TaparSoft
          </Typography>

          <Typography
            variant="h6"
            component="div"
            sx={{
              color: '#000',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            SchoolMANAGER
          </Typography>

          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: 9,
              textAlign: 'right',
              letterSpacing: 0.3,
              whiteSpace: 'nowrap',
            }}
          >
            ID Registration System
          </Typography>
        </Box>
      )}
    </Link>
  );
};

export default Logo;
