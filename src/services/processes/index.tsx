import { api } from "services/api";

export const getProcesses = async (): Promise<Result<Process[]>> => {
  try {
    const res = await api.processes.get<Process[]>("/processes");
    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Process[]
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
