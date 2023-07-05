import { lazy } from "react";
import { Navigate } from "react-router-dom";

const Login = lazy(() => import("pages/Login"));
const Signup = lazy(() => import("pages/Signup"));
const ForgotPassword = lazy(() => import("pages/ForgotPassword"));
const About = lazy(() => import("pages/About"));

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
    path: "/recuperar-senha",
    name: "ForgotPassword",
    element: <ForgotPassword />,
  },
  {
    path: "/contribuidores",
    name: "About",
    element: <About />,
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];
