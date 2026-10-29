import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>Welcome to Edu-Nexis</h1>
    },
    {
        path: "/register",
        element: <Register />
    }
])