import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { PrivateLayout } from "layouts/Private";

const AccountEdition = lazy(() => import("pages/AccountEdition"));
const EmailEdition = lazy(() => import("pages/EmailEdition"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Home",
    element: <PrivateLayout />,
  },
  {
    path: "editar-conta",
    name: "AccountEdition",
    element: <AccountEdition />,
  },
  {
    path: "editar-conta/email",
    name: "EmailEdition",
    element: <EmailEdition />,
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];
