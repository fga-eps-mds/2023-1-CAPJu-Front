import { api } from "services/api";

export const getRoleById = async (idRole: number): Promise<Result<Role>> => {
  try {
    const { data } = await api.role.get<Role>(`/roleAdmins/${idRole}`);

    return {
      type: "success",
      value: data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const getAllRoles = async (): Promise<Result<Role[]>> => {
  try {
    const res = await api.role.get<Role[]>("/");

    const orderedRolesNames = [
      "Estagiário",
      "Servidor",
      "Diretor",
      "Juiz",
      "Administrador",
    ];

    const orderedData = res.data?.sort(
      (a, b) =>
        orderedRolesNames.indexOf(a.name) - orderedRolesNames.indexOf(b.name)
    );

    return {
      type: "success",
      value: orderedData,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const updateRoleAllowedActions = async ({
  idRole,
  allowedActions,
}: {
  idRole: number;
  allowedActions: string[];
}): Promise<Result<Role>> => {
  try {
    const res = await api.role.put<Role>(`/updateRole/${idRole}`, {
      allowedActions,
    });

    return { type: "success", value: res.data };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};
