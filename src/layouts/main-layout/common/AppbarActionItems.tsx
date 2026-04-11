import { ReactElement } from 'react';
import { Stack, SxProps } from '@mui/material';
// import NotificationMenu from './NotificationMenu';
import ProfileMenu from './ProfileMenu';

interface AppbarActionItemsProps {
  sx?: SxProps;
  searchComponent?: ReactElement;
}

const AppbarActionItems = ({ sx, searchComponent }: AppbarActionItemsProps) => {
  return (
    <Stack
      className="action-items"
      spacing={1}
      sx={{
        alignItems: 'center',
        ml: 'auto',
        ...sx,
      }}
    >
      {searchComponent}
      {/* <NotificationMenu /> */}
      <ProfileMenu />
    </Stack>
  );
};

export default AppbarActionItems;
