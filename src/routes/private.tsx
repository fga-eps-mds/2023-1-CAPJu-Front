import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { PrivateLayout } from "layouts/Private";
import { permissionsArray } from "utils/permissions";

const AccountEdition = lazy(() => import("pages/AccountEdition"));
const EmailEdition = lazy(() => import("pages/EmailEdition"));
const PasswordEdition = lazy(() => import("pages/PasswordEdition"));
const Units = lazy(() => import("pages/Units"));
const Users = lazy(() => import("pages/ProfilesManager"));
const Stages = lazy(() => import("pages/Stages"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Unidades",
    element: <Units />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-unit")
    )?.users,
  },
  {
    path: "etapas",
    name: "Stages",
    element: <Stages />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-stage")
    )?.users,
  },
  {
    path: "fluxos",
    name: "Flows",
    element: <PrivateLayout />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-flow")
    )?.users,
  },
  {
    path: "processos",
    name: "Processes",
    element: <PrivateLayout />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-process")
    )?.users,
  },

  {
    path: "cadastro-menu",
    name: "Users",
    element: <Users />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-user")
    )?.users,
  },
  {
    path: "editar-conta",
    name: "AccountEdition",
    element: <AccountEdition />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("edit-account")
    )?.users,
  },
  {
    path: "editar-conta/email",
    name: "EmailEdition",
    element: <EmailEdition />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("edit-account")
    )?.users,
  },
  {
    path: "editar-conta/senha",
    name: "PasswordEdition",
    element: <PasswordEdition />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("edit-account")
    )?.users,
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];
