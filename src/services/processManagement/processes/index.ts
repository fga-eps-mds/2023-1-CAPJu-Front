import { api } from "services/api";

export const getProcesses = async (
  flowId: number | undefined,
  pagination?: Pagination,
  filter?: string
): Promise<Result<Process[]>> => {
  try {
    const res = await api.processManagement.get<{
      processes: Process[];
      totalPages: number;
    }>(`/process${flowId ? `?flowId=${flowId}` : ""}`, {
      params: {
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit,
        filter,
      },
    });

    return {
      type: "success",
      value: res.data.processes,
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

export const deleteProcess = async (
  registro: string
): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.delete<Process>(
      `/process/deleteProcess/${registro}`
    );

    return {
      type: "success",
      value: res.data,
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

export const createProcess = async (data: {
  record: string;
  nickname: string;
  idFlow: number;
  priority: number;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.post<Process>(
      "/process/newProcess",
      data
    );

    return {
      type: "success",
      value: res.data,
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

export const updateProcess = async (data: {
  record: string;
  nickname: string;
  idFlow: number | number[];
  priority: number;
  effectiveDate: Date | string;
  status: string;
  idStage: number | null;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.put<Process>(
      `/process/updateProcess/${data.record}`,
      data
    );

    return {
      type: "success",
      value: res.data,
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

export const getProcessByRecord = async (
  record: string
): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.get<Process>(
      `/process/record/${record}`
    );

    return {
      type: "success",
      value: res.data,
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

export const updateStage = async (data: {
  record: string;
  from: number;
  to: number;
  commentary: string;
  idFlow: number;
  isNextStage: boolean;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.put<Process>(
      "/process/updateStage",
      data
    );

    return {
      type: "success",
      value: res.data,
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

export const updateProcessStatus = async (data: {
  priority: number;
  idFlow: number;
  record: string;
  status: string;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.put<Process>(
      "/process/updateProcess",
      data
    );

    return {
      type: "success",
      value: res.data,
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
