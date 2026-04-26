import { Suspense, lazy } from 'react';
import { Navigate, Outlet, RouteObject, createBrowserRouter, useLocation } from 'react-router';
import App from 'App';
import AuthLayout from 'layouts/auth-layout';
import MainLayout from 'layouts/main-layout';
import Page404 from 'pages/errors/Page404';
import AuthGuard from 'components/auth/AuthGuard';
import GuestGuard from 'components/auth/GuestGuard';
import PageLoader from 'components/loading/PageLoader';
import paths, { rootPaths } from './paths';

// Lazy-loaded page components
const AuthenticateLogin = lazy(() => import('pages/authentication/AuthenticateLogin'));
const AdminLogin = lazy(() => import('pages/authentication/AdminLogin'));
const Signup = lazy(() => import('pages/authentication/Signup'));
const UserExistence = lazy(() => import('pages/authentication/UserExistence'));
const NewStudent = lazy(() => import('pages/authentication/NewStudent'));
const ExistingStudent = lazy(() => import('pages/authentication/ExistingStudentRegistration'));
const IdRegistration = lazy(() => import('pages/authentication/StudentIdRegistration'));

const Dashboard = lazy(() => import('pages/dashboard/Dashboard'));
const Profile = lazy(() => import('pages/profile/Profile'));

const PlaceholderPage = ({ title }: { title: string }) => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>{title} Page (Coming Soon)</div>
);

export const SuspenseOutlet = () => {
  const location = useLocation();
  return (
    <Suspense key={location.pathname} fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
};

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      // Protected routes (require authentication)
      {
        path: '/',
        element: (
          <AuthGuard>
            <MainLayout>
              <SuspenseOutlet />
            </MainLayout>
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: paths.management, element: <Profile /> },
          { path: paths.accounts, element: <PlaceholderPage title="Accounts" /> },
          { path: paths.monitoring, element: <PlaceholderPage title="Monitoring" /> },
          { path: paths.student_profile, element: <PlaceholderPage title="Student Profile" /> },
          { path: paths.profile, element: <Profile /> },
          { path: paths.system_settings, element: <PlaceholderPage title="System Settings" /> },
        ],
      },

      // Public routes (accessible to guests only)
      {
        path: rootPaths.authRoot,
        element: (
          <GuestGuard>
            <AuthLayout>
              <SuspenseOutlet />
            </AuthLayout>
          </GuestGuard>
        ),
        children: [
          // Set authenticate-login as the default index route
          { index: true, element: <Navigate to={paths.authenticate_login} replace /> },
          { path: paths.login, element: <Navigate to={paths.authenticate_login} replace /> },
          { path: paths.authenticate_login, element: <AuthenticateLogin /> },
          { path: paths.admin_login, element: <AdminLogin /> },
          { path: paths.signup, element: <Signup /> },
          { path: paths.user_existence, element: <UserExistence /> },
          { path: paths.new_student, element: <NewStudent /> },
          { path: paths.existing_student, element: <ExistingStudent /> },
          { path: paths.id_registration, element: <IdRegistration /> },
        ],
      },

      // 404 routes
      { path: paths['404'], element: <Page404 /> },
      { path: '*', element: <Page404 /> },
    ],
  },
];

const router = createBrowserRouter(routes, { basename: '/' });
export default router;
