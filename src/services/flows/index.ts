import { api } from "services/api";

export const getFlows = async (
  pagination?: Pagination
): Promise<Result<Flow[]>> => {
  try {
    const res = await api.flows.get<{
      flows: Flow[];
      totalPages: number;
    }>("/flows", {
      params: {
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit ?? 5,
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
    const res = await api.flows.get<Flow>(`/flow/${id}`);

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
    const res = await api.flows.post<Flow>(`/newFlow/`, data);

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
    const res = await api.flows.put<Flow>(`/flow/`, data);

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
    const res = await api.flows.delete<Flow[]>(`/flow/${id}`);

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
