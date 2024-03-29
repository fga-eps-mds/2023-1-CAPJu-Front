import { api } from "services/api";

export const getFlows = async (
  pagination?: Pagination,
  filter?: string
): Promise<Result<Flow[]>> => {
  try {
    const res = await api.processManagement.get<{
      flows: Flow[];
      totalPages: number;
    }>("/flow", {
      params: {
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit,
        filter,
      },
    });

    return {
      type: "success",
      value: res.data.flows,
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

export const getFlowById = async (
  id: string | number
): Promise<Result<Flow>> => {
  try {
    const res = await api.processManagement.get<Flow>(`/flow/${id}`);

    return { type: "success", value: res.data };
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

export const createFlow = async (data: {
  name: string;
  sequences: FlowSequence[];
  idUsersToNotify: (string | number)[];
  idUnit: number;
}) => {
  try {
    const res = await api.processManagement.post<Flow>(`/flow/newFlow/`, data);

    return { type: "success", value: res.data };
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

export const updateFlow = async (data: {
  name: string;
  sequences: FlowSequence[];
  idUsersToNotify: (string | number)[];
  idFlow: number;
}) => {
  try {
    const res = await api.processManagement.put<Flow>(`/flow/`, data);

    return { type: "success", value: res.data };
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

export const deleteFlow = async (id: number) => {
  try {
    const res = await api.processManagement.delete<Flow[]>(`/flow/${id}`);

    return { type: "success", value: res.data };
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
