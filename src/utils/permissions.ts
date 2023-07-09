import { tabs } from "./tabs";

const Roles = {
  DIRETOR: 1,
  JUIZ: 2,
  SERVIDOR: 3,
  ESTAGIARIO: 4,
  ADMINISTRADOR: 5,
};

export const permissionsArray = [
  {
    actions: ["manage-profiles-actions"],
    users: [Roles.ADMINISTRADOR],
  },
  {
    actions: [
      "create-stage",
      "edit-stage",
      "delete-stage",
      "create-flow",
      "edit-flow",
      "delete-flow",
    ],
    users: [Roles.DIRETOR, Roles.SERVIDOR, Roles.ADMINISTRADOR],
  },
  {
    actions: [
      "create-process",
      "edit-process",
      "delete-process",
      "advance-stage",
    ],
    users: [
      Roles.ESTAGIARIO,
      Roles.DIRETOR,
      Roles.SERVIDOR,
      Roles.ADMINISTRADOR,
    ],
  },
  {
    actions: ["view-unit", "edit-account"],
    users: [
      Roles.ESTAGIARIO,
      Roles.DIRETOR,
      Roles.JUIZ,
      Roles.SERVIDOR,
      Roles.ADMINISTRADOR,
    ],
  },
  {
    actions: ["view-stage", "view-flow", "view-process"],
    users: [Roles.ESTAGIARIO, Roles.DIRETOR, Roles.JUIZ, Roles.SERVIDOR],
  },
  {
    actions: [
      "edit-unit",
      "delete-unit",
      "create-unit",
      "view-admins",
      "add-admin-in-unit",
    ],
    users: [Roles.ADMINISTRADOR],
  },
  {
    actions: ["view-user"],
    users: [Roles.DIRETOR, Roles.ADMINISTRADOR],
  },
  {
    actions: [
      "create-user",
      "accept-user",
      "regress-stage",
      "delete-user",
      "edit-user",
    ],
    users: [Roles.DIRETOR, Roles.ADMINISTRADOR],
  },
  {
    actions: ["view-process-in-flow", "view-statistic-of-process-in-flow"],
    users: [Roles.ESTAGIARIO, Roles.DIRETOR, Roles.JUIZ, Roles.SERVIDOR],
  },
];

export function hasPermission(user: User, permissionName: string) {
  if (!user) return false;

  return permissionsArray
    .find((p) => p.actions.includes(permissionName))
    ?.users.includes(user.idRole);
}

export function isActionAllowedToUser(
  allowedActions: string[],
  actionName: string
): boolean {
  return allowedActions.some((item) => item === actionName);
}

export function getAllowedTabPath(allowedActions: string[]) {
  return (
    tabs.find((tab) => allowedActions.some((i) => i === tab.action))?.path ||
    "/"
  );
}

export const actionsForm = [
  {
    label: "Criar Unidades",
    value: "create-unit",
  },
  {
    label: "Visualizar Unidades",
    value: "see-unit",
  },
  {
    label: "Editar Unidades",
    value: "edit-unit",
  },
  {
    label: "Excluir Unidades",
    value: "delete-unit",
  },
  {
    label: "Criar Etapas",
    value: "create-stage",
  },
  {
    label: "Visualizar Etapas",
    value: "see-stage",
  },
  {
    label: "Editar Etapas",
    value: "edit-stage",
  },
  {
    label: "Excluir Etapas",
    value: "delete-stage",
  },
  {
    label: "Avançar Etapas",
    value: "forward-stage",
  },
  {
    label: "Retroceder Etapas",
    value: "backward-stage",
  },
  {
    label: "Criar Fluxos",
    value: "create-flow",
  },
  {
    label: "Editar Fluxos",
    value: "edit-flow",
  },
  {
    label: "Visualizar Fluxos",
    value: "see-flow",
  },
  {
    label: "Excluir Fluxos",
    value: "delete-flow",
  },
  {
    label: "Criar Processos",
    value: "create-process",
  },
  {
    label: "Editar Processos",
    value: "edit-process",
  },
  {
    label: "Visualizar Processos",
    value: "see-process",
  },
  {
    label: "Excluir Processos",
    value: "delete-process",
  },
  {
    label: "Arquivar Processos",
    value: "archive-process",
  },
  {
    label: "Finalizar Processos",
    value: "end-process",
  },
  {
    label: "Visualizar Solicitações",
    value: "see-request",
  },
  {
    label: "Aceitar Solicitações",
    value: "accept-request",
  },
  {
    label: "Recusar Solicitações",
    value: "delete-request",
  },
  {
    label: "Visualizar Perfis",
    value: "see-profile",
  },
  {
    label: "Editar Perfis",
    value: "edit-profile",
  },
  {
    label: "Excluir Perfis",
    value: "delete-profile",
  },
  {
    label: "Editar Conta",
    value: "edit-account",
  },
  {
    label: "Gerenciar Perfis",
    value: "manage-profiles",
  },
];
