import { api } from "services/api";

export const getStagesByIdFlow = async (
  IdFlow: number
): Promise<Result<Stage[]>> => {
  try {
    const res = await api.processManagement.get<{
      stages: Stage[];
      totalPages: number;
    }>(`statistics/qtdFlow/${IdFlow}`, {
      params: {
        name: String,
        idStage: Number,
      },
    });

    return {
      type: "success",
      value: res.data.stages,
      totalPages: res.data.totalPages,
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
