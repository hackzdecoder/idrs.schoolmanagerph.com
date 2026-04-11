import { Box, CircularProgress, Stack, StackOwnProps } from '@mui/material';
import { cssVarRgba } from 'lib/utils';

const MainLoader = (props: StackOwnProps) => {
  return (
    <Stack
      {...props}
      sx={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          height: '100dvh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: 0,
          zIndex: 9999,
          bgcolor: 'background.paper',
          inset: 0, // Shorthand for top/right/bottom/left
        },
        ...(Array.isArray(props.sx) ? props.sx : [props.sx]),
      ]}
    >
      <Box sx={{ position: 'relative' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={74}
          thickness={4}
          sx={(theme) => ({
            color: cssVarRgba(theme.vars.palette.primary.mainChannel, 0.1),
          })}
        />
        <CircularProgress
          size={74}
          thickness={4}
          sx={(theme) => ({
            position: 'absolute',
            left: 0,
            color: cssVarRgba(theme.vars.palette.primary.mainChannel, 0.6),
          })}
        />
      </Box>
    </Stack>
  );
};

export default MainLoader;
