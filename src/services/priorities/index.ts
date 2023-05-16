import { api } from "services/api";

export const getPriorities = async (): Promise<Result<Priority[]>> => {
  try {
    const res = await api.processes.get<Priority[]>("/priorities");
    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Priority[]
    >;
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
