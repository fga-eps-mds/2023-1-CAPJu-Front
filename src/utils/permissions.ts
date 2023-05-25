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
    actions: [
      "view-stage",
      "view-flow",
      "view-process",
      "view-unit",
      "edit-account",
    ],
    users: [
      Roles.ESTAGIARIO,
      Roles.DIRETOR,
      Roles.JUIZ,
      Roles.SERVIDOR,
      Roles.ADMINISTRADOR,
    ],
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
    users: [
      Roles.ESTAGIARIO,
      Roles.DIRETOR,
      Roles.JUIZ,
      Roles.SERVIDOR,
      Roles.ADMINISTRADOR,
    ],
  },
];

export function hasPermission(user: User, permissionName: string) {
  if (!user) return false;

  return permissionsArray
    .find((p) => p.actions.includes(permissionName))
    ?.users.includes(user.idRole);
}

export function getAllowedTabPath(userRoleId: number) {
  return (
    tabs.find((tab) =>
      permissionsArray.some(
        (item) =>
          item.users.some((permissionUser) => permissionUser === userRoleId) &&
          item.actions.some((action) => action === tab.action)
      )
    )?.path || "/"
  );
}
