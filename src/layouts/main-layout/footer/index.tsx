import { useEffect, useRef, useState } from 'react';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import useRouteApiSetup from 'hooks/useRouteApiSetup';

const Footer = () => {
  const { get } = useRouteApiSetup();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [copyrightNotice, setCopyrightNotice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchFooterData = async () => {
      try {
        setLoading(true);
        const response = await get('/footer');

        if (response?.success && response?.data?.copyright_notice) {
          setCopyrightNotice(response.data.copyright_notice);
        } else {
          // Fallback default
          const year = new Date().getFullYear();
          setCopyrightNotice(`© ${year} TaparSoft Enterprise. All rights reserved.`);
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
        // Fallback default
        const year = new Date().getFullYear();
        setCopyrightNotice(`© ${year} TaparSoft Enterprise. All rights reserved.`);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, [get]);

  if (loading) {
    return null;
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto', // ✅ Pushes footer to bottom
        bgcolor: 'background.default',
        width: '100%',
      }}
    >
      <Divider />
      <Stack
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          py: 2,
          px: { xs: 2, sm: 3, md: 5 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant={isMobile ? 'caption' : 'body2'}
          sx={{
            color: 'text.secondary',
          }}
        >
          {copyrightNotice}
        </Typography>
      </Stack>
    </Box>
  );
};

export default Footer;
