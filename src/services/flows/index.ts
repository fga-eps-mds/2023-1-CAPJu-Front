import { api } from "services/api";

export const getFlows = async (): Promise<Result<Flow[]>> => {
  try {
    const res = await api.flows.get<Flow[]>("/flows");

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
