import { api } from "services/api";

export const signIn = async (credentials: {
  cpf: string;
  password: string;
}): Promise<Result<User>> => {
  try {
    const res = await api.user.post<User>("/login", credentials);

    return { type: "success", value: res } as unknown as Result<User>;
  } catch (error) {
    if (error instanceof Error) return { type: "error", error };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
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

    return { type: "success", value: res } as unknown as Result<User>;
  } catch (error) {
    if (error instanceof Error) return { type: "error", error };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
    };
  }
};

export const updateUser = async (data: { email: string }, cpf: string) => {
  try {
    const res = await api.user.put(`/updateUser/${cpf}`, data);

    return { type: "success", value: res };
  } catch (error) {
    if (error instanceof Error) return { type: "error", error };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
    };
  }
};

export const updateUserPassword = async (
  data: { oldPassword: string; newPassword: string },
  cpf: string
) => {
  try {
    const res = await api.user.post(`/updateUserPassword/${cpf}`, data);

    return { type: "success", value: res };
  } catch (error) {
    if (error instanceof Error) return { type: "error", error };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
    };
  }
};