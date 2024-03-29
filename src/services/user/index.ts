import { api } from "services/api";
import { getRoleById, getAllRoles } from "services/role";

export const signIn = async (credentials: {
  cpf: string;
  password: string;
}): Promise<Result<User>> => {
  try {
    const res = await api.user.post<User>("/login", credentials);

    return { type: "success", value: res.data };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const signUp = async (credentials: {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  idUnit: string;
  idRole: string;
}): Promise<Result<User>> => {
  try {
    const res = await api.user.post<User>("/newUser", credentials);

    return { type: "success", value: res.data };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const getUserById = async (
  userId: string
): Promise<Result<User & { allowedActions: string[] }>> => {
  try {
    const res = await api.user.get<User>(`/cpf/${userId}`);
    const { value: role } = await getRoleById(res.data?.idRole);

    return {
      type: "success",
      value: { ...res.data, allowedActions: role?.allowedActions || [] },
    };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const updateUser = async (data: { email: string }, cpf: string) => {
  try {
    const res = await api.user.put(`/updateUser/${cpf}`, data);

    return { type: "success", value: res.data };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const updateUserPassword = async (
  data: { oldPassword: string; newPassword: string },
  cpf: string
) => {
  try {
    const res = await api.user.post(`/updateUserPassword/${cpf}`, data);

    return { type: "success", value: res.data };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const updateUserEmailAndPassword = async (
  data: { email: string; password: string },
  cpf: string
) => {
  try {
    const res = await api.user.put(`/updateUserEmailAndPassword/${cpf}`, data);

    return { type: "success", value: res.data };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const forgotPassword = async (data: { email: string }) => {
  try {
    const res = await api.user.post("/requestRecovery", data);

    return { type: "success", value: res.data };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const getAcceptedUsers = async (
  pagination?: Pagination,
  filter?: string
): Promise<Result<User[]>> => {
  try {
    const res = await api.user.get<{ users: User[]; totalPages: number }>(
      `/allUser?accepted=true`,
      {
        params: {
          offset: pagination?.offset ?? 0,
          limit: pagination?.limit,
          filter,
        },
      }
    );

    return {
      type: "success",
      value: res.data?.users?.filter((user) => user.idRole !== 5),
      totalPages: res?.data?.totalPages,
    };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const getUsersRequests = async (
  pagination?: Pagination,
  filter?: string
): Promise<Result<User[]>> => {
  try {
    const res = await api.user.get<{ users: User[]; totalPages: number }>(
      `/allUser?accepted=false`,
      {
        params: {
          offset: pagination?.offset ?? 0,
          limit: pagination?.limit,
          filter,
        },
      }
    );
    const { value: roles } = await getAllRoles();
    const value = res.data?.users?.map((item: User) => {
      return {
        ...item,
        role: roles?.find((i) => i.idRole === item.idRole)?.name || "-",
      };
    });

    return { type: "success", value, totalPages: res?.data?.totalPages };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const acceptRequest = async (userId: string): Promise<Result<null>> => {
  try {
    await api.user.post(`/acceptRequest/${userId}`);

    return { type: "success", value: null };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const denyRequest = async (userId: string): Promise<Result<null>> => {
  try {
    await api.user.delete(`/deleteRequest/${userId}`);

    return { type: "success", value: null };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const deleteUser = async (userId: string): Promise<Result<null>> => {
  try {
    await api.user.delete(`/deleteUser/${userId}`);

    return { type: "success", value: null };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};

export const updateUserRole = async (
  cpf: string,
  idRole: number
): Promise<Result<null>> => {
  try {
    await api.user.put(`/updateUserRole/`, {
      cpf,
      idRole,
    });

    return { type: "success", value: null };
  } catch (error) {
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};
