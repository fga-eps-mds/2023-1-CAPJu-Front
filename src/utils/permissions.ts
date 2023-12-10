import { tabs } from "./tabs";

export function isActionAllowedToUser(
  allowedActions: string[],
  actionName: string
): boolean {
  return allowedActions.some((item) => item === actionName);
}

export function getAllowedTabPath(allowedActions: string[]) {
  return (
    tabs.find((tab) => allowedActions.some((i) => i === tab.action))?.path ||
    "/contribuidores"
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
    label: "Concluir Processos",
    value: "archive-process",
  },
  {
    label: "Interromper Processos",
    value: "end-process",
  },
  {
    label: "Visualizar Estatísticas",
    value: "see-statistics",
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
    label: "Visualizar Usuários",
    value: "see-profile",
  },
  {
    label: "Editar Usuários",
    value: "edit-profile",
  },
  {
    label: "Excluir Usuários",
    value: "delete-profile",
  },
  {
    label: "Gerenciar Permissões dos Perfis",
    value: "manage-profiles",
  },
];
