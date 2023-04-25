import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { PrivateLayout } from "layouts/Private";

const AcountEdition = lazy(() => import("pages/AccountEdition"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Home",
    element: <PrivateLayout />,
  },
  {
    path: "editar-conta",
    name: "AccountEdition",
    element: <AcountEdition />,
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];
