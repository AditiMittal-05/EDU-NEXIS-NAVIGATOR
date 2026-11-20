import { createBrowserRouter } from 'react-router-dom';
import NavigatorDashboard from "../features/auth/Navigator/NavigatorDashboard"; // keep your existing imports
import GovtExplorer from '../features/government/GovtExplorer';
import PrivateExplorer from '../features/private-jobs/PrivateExplorer';
import HigherEdExplorer from '../features/higher-ed/HigherEdExplorer';
import ScholarshipsCoursesExplorer from '../features/scholarships-courses/ScholarshipsCoursesExplorer';
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import Logout from '../features/auth/pages/Logout';
import { ProtectedRoute, PublicOnlyRoute } from '../features/auth/components/ProtectedRoute';

export const routes = createBrowserRouter([
  // Public-Only Auth Routes (redirects to "/" if already logged in)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },

  // Logout Route (accessible anytime to clear session)
  {
    path: '/logout',
    element: <Logout />,
  },

  // Protected Routes (requires valid login token)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <NavigatorDashboard />,
      },
      {
        path: '/navigator',
        element: <NavigatorDashboard />,
      },
      {
        path: '/government',
        element: <GovtExplorer />,
      },
      {
        path: '/private-jobs',
        element: <PrivateExplorer />,
      },
      {
        path: '/higher-education',
        element: <HigherEdExplorer />,
      },
      {
        path: '/scholarships-courses',
        element: <ScholarshipsCoursesExplorer />,
      },
    ],
  },
]);