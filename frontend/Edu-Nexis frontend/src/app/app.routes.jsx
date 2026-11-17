import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import NavigatorDashboard from "../features/auth/Navigator/NavigatorDashboard";
import GovtExplorer from "../features/government/GovtExplorer";
import PrivateExplorer from "../features/private-jobs/PrivateExplorer";
import HigherEdExplorer from "../features/higher-ed/HigherEdExplorer";
import ScholarshipsCoursesExplorer from "../features/scholarships-courses/ScholarshipsCoursesExplorer";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <NavigatorDashboard />
  },
  {
    path: "/navigator",
    element: <NavigatorDashboard />
  },
  {
    path: "/government",
    element: <GovtExplorer />
  },
  {
    path: "/private-jobs",
    element: <PrivateExplorer />
  },
  {
    path: "/higher-education",
    element: <HigherEdExplorer />
  },
  {
    path: "/scholarships-courses",
    element: <ScholarshipsCoursesExplorer />
  },
  {
    path: "/register",
    element: <Register />
  }
]);