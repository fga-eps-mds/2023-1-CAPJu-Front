import { api } from "services/api";

export const getStages = async (): Promise<Result<Stage[]>> => {
  try {
    const res = await api.units.get<Stage[]>("/stages");
    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Stage[]
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
