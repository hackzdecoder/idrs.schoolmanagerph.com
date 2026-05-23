import { documentationPath } from 'lib/constants';

export const rootPaths = {
  root: '/',
  authRoot: 'auth',
};

const paths = {
  // Main routes
  root: rootPaths.root,
  management: '/management',
  accounts: '/accounts',
  // monitoring: '/monitoring',
  student_profile: '/student-profile',
  profile: '/profile',
  // system_settings: '/system-settings',
  notifications: '/notifications',
  documentation: documentationPath,
  404: '/404',

  // Authentication routes
  login: `/${rootPaths.authRoot}/login`,
  authenticate_login: `/${rootPaths.authRoot}/authenticate-login`,
  admin_login: `/${rootPaths.authRoot}/admin-login`,
  signup: `/${rootPaths.authRoot}/sign-up`,

  // Student registration routes
  user_existence: `/${rootPaths.authRoot}/user-type`,
  new_student: `/${rootPaths.authRoot}/new-student`,
  existing_student: `/${rootPaths.authRoot}/existing-student`,
  id_registration: `/${rootPaths.authRoot}/id-registration`,
};

export default paths;
