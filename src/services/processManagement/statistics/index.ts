import { api } from "services/api";

export const getStagesByIdFlow = async (
  idFlow: number,
  idStage: number,
  offset: number,
  limit: number
): Promise<Result<Process[]>> => {
  try {
    const res = await api.processManagement.get<{
      process: Process[];
      totalPages: number;
    }>(
      `statistics/ProcessByStage/${idFlow}/${idStage}?offset=${offset}&limit=${limit}`
    );
    return {
      type: "success",
      value: res.data.process,
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

export const getAllProcessByStage = async (
  idFlow: number,
  idStage: number
): Promise<Result<Process[]>> => {
  try {
    const res = await api.processManagement.get<{
      process: Process[];
      totalPages: number;
    }>(`statistics/AllProcessByStage/${idFlow}/${idStage}`);
    return {
      type: "success",
      value: res.data.process,
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

export const getCountProcessByIdFlow = async (
  idFlow: number
): Promise<Result<Stage[]>> => {
  try {
    const res = await api.processManagement.get<{
      stages: Stage[];
      totalPages: number;
    }>(`statistics/qtdFlow/${idFlow}`);
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
