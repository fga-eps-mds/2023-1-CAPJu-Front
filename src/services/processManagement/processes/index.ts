import { api } from "services/api";

export const getProcesses = async (
  flowId: number | undefined,
  pagination?: Pagination,
  filter?: string,
  filterByLegalPriority?: boolean,
  status?: String[],
  from?: string,
  to?: string,
  nicknameOrRecordFilter?: string,
  showArchivedAndFinished?: boolean,
): Promise<Result<Process[]>> => {

  try {
    const res = await api.processManagement.get<{
      processes: Process[];
      totalPages: number;
      totalProcesses: number;
      totalArchived: number;
      totalFinished: number;
    }>(`/process${flowId ? `?idFlow=${flowId}` : ""}`, {
      params: {
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit,
        filter,
        filterByLegalPriority,
        status: status || undefined,
        from,
        to,
        nicknameOrRecordFilter,
        showArchivedAndFinished,
      },
    });

    return {
      type: "success",
      value: res.data.processes,
      totalPages: res.data.totalPages,
      totalProcesses: res.data.totalProcesses,
      totalArchived: res.data.totalArchived,
      totalFinished: res.data.totalFinished,
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
    idProcess: number
): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.delete<Process>(
      `/process/deleteProcess/${idProcess}`
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
  idProcess: number,
  nickname: string;
  idFlow: number | number[];
  priority: number;
  effectiveDate: Date | string;
  status: string;
  idStage: number | null;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.put<Process>(
      `/process/updateProcess/${data.idProcess}`,
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

export const getProcessById = async (
    idProcess: string | number
): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.get<Process>(
        `/process/${idProcess}`
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
  idProcess: number;
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
  idProcess: number,
  status: string;
}): Promise<Result<Process>> => {

  try {
    const res = await api.processManagement.put<Process>(
      `/process/updateProcess/${data.idProcess}`,
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

export const finalizeProcess = async (process: Process): Promise<Result<Process>> => {
  try {
    const res = await api.processManagement.put<Process>(`/process/finalizeProcess/${process.idProcess}`);

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

export const archiveProcess = async (process: Process): Promise<Result<Process>> => {
  try {

    const res = await api.processManagement.put<Process>(`/process/archiveProcess/${process.idProcess}/${process.status !== 'archived'}`);

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



