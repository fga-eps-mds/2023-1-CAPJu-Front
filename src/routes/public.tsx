import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Login = lazy(() => import("pages/Login"));
const Signup = lazy(() => import("pages/Signup"));

export const PublicRoutes: MenuItem[] = [
  {
    index: true,
    name: "Login",
    element: <Login />,
  },
  {
    path: "/cadastro",
    name: "Cadastro",
    element: <Signup />,
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];
