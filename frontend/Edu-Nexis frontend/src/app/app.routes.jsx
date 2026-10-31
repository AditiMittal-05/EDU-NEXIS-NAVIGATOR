import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import NavigatorDashboard from "../features/auth/Navigator/NavigatorDashboard";

export const routes = createBrowserRouter([
  {
    path: "/navigator",
    element: <NavigatorDashboard />
  },
  {
    path: "/register",
    element: <Register />
  }
]);