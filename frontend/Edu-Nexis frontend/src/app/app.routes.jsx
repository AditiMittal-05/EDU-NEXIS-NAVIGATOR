import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import NavigatorDashboard from "../features/auth/Navigator/NavigatorDashboard";
import GovtExplorer from "../features/government/GovtExplorer";

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
    path: "/register",
    element: <Register />
  }
]);