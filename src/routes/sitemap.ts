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
        roles: ['Super Admin', 'Admin', 'Faculty', 'Student'],
      },
      {
        name: 'Management',
        path: paths.management,
        pathName: 'management',
        icon: 'material-symbols:account-tree-outline',
        active: true,
        roles: ['Super Admin', 'Admin'],
      },
      {
        name: 'Accounts',
        path: paths.accounts,
        pathName: 'accounts',
        icon: 'material-symbols:group-outline',
        active: true,
        roles: ['Super Admin', 'Admin', 'Accounting'],
      },
      {
        name: 'Monitoring',
        path: paths.monitoring,
        pathName: 'monitoring',
        icon: 'material-symbols:monitor-outline',
        active: true,
        roles: ['Super Admin'],
      },
      {
        name: 'Student Profile',
        path: paths.student_profile,
        pathName: 'student-profile',
        icon: 'material-symbols:person-outline',
        active: true,
        roles: ['Faculty'],
      },
      {
        name: 'System Settings',
        path: paths.system_settings,
        pathName: 'system-settings',
        icon: 'material-symbols:settings-outline',
        active: true,
        roles: ['Super Admin', 'Admin', 'Faculty'],
      },
      {
        name: 'ID Registration',
        path: paths.profile,
        pathName: 'profile',
        icon: 'material-symbols:account-box-outline',
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
