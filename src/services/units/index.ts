import { api } from "services/api";

export const getUnits = async (): Promise<Result<Unit[]>> => {
  try {
    const res = await api.units.get<Unit[]>("/");

    return { type: "success", value: res.data } as unknown as Result<Unit[]>;
  } catch (error) {
    if (error instanceof Error) return { type: "error", error };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
    };
  }
};
