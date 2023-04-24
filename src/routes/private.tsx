// import { lazy } from "react";
import { Navigate } from "react-router-dom";

// const Home = lazy(() => import("pages/Home"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Home",
    element: <></>,
    authorizedRoles: [],
  },
  {
    path: "*",
    name: "404",
    element:  <Navigate to="/" replace />,
    authorizedRoles: [],
  }
];
