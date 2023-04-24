import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Login = lazy(() => import("pages/Login"));

export const PublicRoutes: MenuItem[] = [
  {
    index: true,
    name: "Login",
    element: <Login />,
    authorizedRoles: [],
  },
  {
    path: "*",
    name: "404",
    element:  <Navigate to="/" replace />,
    authorizedRoles: [],
  }
];
