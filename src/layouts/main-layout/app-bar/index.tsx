import { Box, Button, Stack, paperClasses } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useSettingsContext } from 'providers/SettingsProvider';
import IconifyIcon from 'components/base/IconifyIcon';
import AppbarActionItems from '../common/AppbarActionItems';

const AppBar = () => {
  const {
    config: { drawerWidth },
    handleDrawerToggle,
  } = useSettingsContext();

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        borderBottom: `1px solid`,
        borderColor: 'divider',
        [`&.${paperClasses.root}`]: {
          outline: 'none',
        },
      }}
    >
      <Toolbar variant="appbar" sx={{ px: { xs: 3, md: 5 } }}>
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            gap: 1,
            pr: 2,
          }}
        >
          <Button
            color="neutral"
            variant="soft"
            shape="circle"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
          >
            <IconifyIcon icon="material-symbols:menu-rounded" sx={{ fontSize: 20 }} />
          </Button>
        </Box>

        <Stack
          sx={{
            alignItems: 'center',
            flex: 1,
          }}
        >
          <AppbarActionItems />
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
