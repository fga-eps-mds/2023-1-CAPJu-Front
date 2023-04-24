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
