import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { PrivateLayout } from "layouts/Private";
import { permissionsArray } from "utils/permissions";

const AccountEdition = lazy(() => import("pages/AccountEdition"));
const EmailEdition = lazy(() => import("pages/EmailEdition"));
const PasswordEdition = lazy(() => import("pages/PasswordEdition"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Unidades",
    element: <PrivateLayout />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-unit")
    )?.users,
  },
  {
    path: "etapas",
    name: "Stages",
    element: <PrivateLayout />,
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
    path: "solicitacoes",
    name: "UserRequests",
    element: <PrivateLayout />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("accept-user")
    )?.users,
  },
  {
    path: "perfil-de-acesso",
    name: "Users",
    element: <PrivateLayout />,
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
    path: "solicitacoes",
    name: "UserRequests",
    element: <PrivateLayout />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("accept-user")
    )?.users,
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];