import { PrivateLayout } from "layouts/Private";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

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
const ActionsManager = lazy(() => import("pages/ProfilesActionsManager"));
const Statistics = lazy(() => import("pages/Statistics"));

export const PrivateRoutes: MenuItem[] = [
  {
    index: true,
    name: "Unidade",
    element: <Units />,
    actionName: "see-unit",
  },
  {
    path: "etapas",
    name: "Stages",
    element: <Stages />,
    actionName: "see-stage",
  },
  {
    path: "fluxos",
    name: "Flows",
    element: <Flows />,
    actionName: "see-flow",
  },
  {
    path: "processos",
    name: "Processes",
    actionName: "see-process",
    element: <Processes />,
  },
  {
    path: "processos/:record",
    name: "ViewProcess",
    actionName: "see-process",
    element: <ViewProcess />,
  },
  {
    path: "estatisticas",
    name: "Estatisticas",
    actionName: "see-process",
    element: <Statistics />,
  },
  {
    path: "acessos",
    name: "ProfilesManager",
    element: <Users />,
    actionName: "see-request",
  },
  {
    path: "perfis",
    name: "ActionsManager",
    actionName: "manage-profiles",
    element: <ActionsManager />,
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
    path: "editar-conta/senha",
    name: "PasswordEdition",
    element: <PasswordEdition />,
  },
  {
    path: "/contribuidores",
    name: "About",
    element: (
      <PrivateLayout>
        <About />
      </PrivateLayout>
    ),
  },
  {
    path: "*",
    name: "404",
    element: <Navigate to="/" replace />,
  },
];
