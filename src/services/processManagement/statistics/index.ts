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
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
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
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
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
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const getProcessesByDueDate = async (
  minDate: string,
  maxDate: string,
  pagination?: Pagination
): Promise<Result<Process[]>> => {
  try {
    const res = await api.processManagement.get<{
      processInDue: Process[];
      totalPages: number;
    }>(`/statistics/${minDate}/${maxDate}`, {
      params: {
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit,
      },
    });

    return {
      type: "success",
      value: res.data.processInDue,
      totalPages: res.data.totalPages,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};
