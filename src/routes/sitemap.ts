// app/src/routes/sitemap.ts
import { HTMLAttributeAnchorTarget } from 'react';
import { SxProps } from '@mui/material';
import { UserRole } from 'data/roles';
import paths, { rootPaths } from './paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  key?: string;
  selectionPrefix?: string;
  path?: string;
  target?: HTMLAttributeAnchorTarget;
  active?: boolean;
  icon?: string;
  iconSx?: SxProps;
  items?: SubMenuItem[];
  roles?: UserRole[];
}

export interface MenuItem {
  id: string;
  key?: string;
  subheader?: string;
  icon: string;
  target?: HTMLAttributeAnchorTarget;
  iconSx?: SxProps;
  items: SubMenuItem[];
  roles?: UserRole[];
}

const sitemap: MenuItem[] = [
  {
    id: 'pages',
    icon: 'material-symbols:view-quilt-outline',
    items: [
      {
        name: 'Dashboard',
        path: rootPaths.root,
        pathName: 'dashboard',
        icon: 'material-symbols:speed-outline',
        active: true,
        roles: ['Super Admin', 'Admin', 'Student'],
      },
      {
        name: 'Enrollment Approval',
        path: paths.management,
        pathName: 'management',
        icon: 'material-symbols:account-tree-outline',
        active: true,
        roles: ['Admin'],
      },
      {
        name: 'Accounts',
        path: paths.accounts,
        pathName: 'accounts',
        icon: 'material-symbols:group-outline',
        active: true,
        roles: ['Super Admin'],
      },
      {
        name: 'Profile',
        path: paths.profile,
        pathName: 'profile',
        icon: 'material-symbols:account-circle-outline',
        active: true,
        roles: ['Super Admin'],
      },
      {
        name: 'ID Registration',
        path: paths.student_profile,
        pathName: 'student-profile',
        icon: 'material-symbols:person-outline',
        active: true,
        roles: ['Student'],
      },
      {
        name: 'Logout',
        pathName: 'logout',
        icon: 'material-symbols:power-settings-new-rounded',
        active: true,
        roles: ['Super Admin', 'Admin', 'Faculty', 'Student'],
      },
    ],
  },
];

export default sitemap;
