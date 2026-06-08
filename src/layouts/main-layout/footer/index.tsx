import { useEffect, useRef, useState } from 'react';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import useRouteApiSetup from 'hooks/useRouteApiSetup';
import { mainDrawerWidth } from 'lib/constants';
import { useSettingsContext } from 'providers/SettingsProvider';

const Footer = () => {
  const { get } = useRouteApiSetup();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [copyrightNotice, setCopyrightNotice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const {
    config: { drawerWidth },
  } = useSettingsContext();

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
        position: 'fixed',
        bottom: 0,
        right: 0,
        bgcolor: 'background.default',
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: '0px -2px 8px rgba(0, 0, 0, 0.05)',
        zIndex: 1000, // Changed from 1100 to 1000 (SweetAlert is usually 1060)
        // Match the main content margin and width
        ml: { md: `${mainDrawerWidth.collapsed}px`, lg: 0 },
        width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
        left: { xs: 0, md: 'auto' },
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
