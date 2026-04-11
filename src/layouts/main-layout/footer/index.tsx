import { useEffect, useRef, useState } from 'react';
import { Box, Divider, Stack, Typography } from '@mui/material';
import useRouteApiSetup from 'hooks/useRouteApiSetup';

const Footer = () => {
  const { get } = useRouteApiSetup();
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
        }
      } catch (error) {
        console.error('Failed to fetch footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: 'background.default',
        width: '100%',
      }}
    >
      <Divider />
      <Stack
        component="footer"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          height: { xs: 72, sm: 56 },
          py: 1,
          px: { xs: 3, md: 5 },
          textAlign: 'center',
        }}
      >
        <Typography
          variant="caption"
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
