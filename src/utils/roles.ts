export const roles = [
  { name: "Diretor", idRole: 1 },
  { name: "Juiz", idRole: 2 },
  { name: "Servidor", idRole: 3 },
  { name: "Estagiário", idRole: 4 },
  { name: "Administrador", idRole: 5 },
];

export const roleOptions = roles
  .filter((role) => role.idRole !== 5)
  .map((role) => {
    return {
      value: role.idRole,
      label: role.name,
    };
  });

export const roleNameById = (id: number | undefined) =>
  roles.find((roleItem) => roleItem.idRole === id)?.name || "";
