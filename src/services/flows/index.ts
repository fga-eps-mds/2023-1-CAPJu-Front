import { api } from "services/api";

export const getFlows = async (): Promise<Result<Flow[]>> => {
  try {
    const res = await api.flows.get<Flow[]>("/flows");
    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Flow[]
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
