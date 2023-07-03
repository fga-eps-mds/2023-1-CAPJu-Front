import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { permissionsArray } from "utils/permissions";

const AccountEdition = lazy(() => import("pages/AccountEdition"));
const EmailEdition = lazy(() => import("pages/EmailEdition"));
const PasswordEdition = lazy(() => import("pages/PasswordEdition"));
const Units = lazy(() => import("pages/Units"));
const Users = lazy(() => import("pages/ProfilesManager"));
const Stages = lazy(() => import("pages/Stages"));
const Flows = lazy(() => import("pages/Flows"));
const Processes = lazy(() => import("pages/Processes"));
const ViewProcess = lazy(() => import("pages/ViewProcess"));
const About = lazy(() => import("pages/About"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Unidade",
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
    element: <Flows />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-flow")
    )?.users,
  },
  {
    path: "processos",
    name: "Processes",
    element: <Processes />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-process")
    )?.users,
  },
  {
    path: "processos/:record",
    name: "ViewProcess",
    element: <ViewProcess />,
    authorizedRoles: permissionsArray.find((item) =>
      item.actions.includes("view-process")
    )?.users,
  },

  {
    path: "acessos",
    name: "ProfilesManager",
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
