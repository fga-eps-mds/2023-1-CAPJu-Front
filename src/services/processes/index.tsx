import { api } from "services/api";

export const getProcesses = async (): Promise<Result<Process[]>> => {
  try {
    const res = await api.processes.get<Process[]>("/processes");
    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Process[]
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

export const deleteProcess = async (
  registro: string
): Promise<Result<Process>> => {
  try {
    const res = await api.processes.delete<Process>(
      `/deleteProcess/${registro}`
    );
    return {
      type: "success",
      value: res.data,
    } as unknown as ResultSuccess<Process>;
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
  effectiveDate: Date;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processes.post<Process>("/newProcess", data);
    return {
      type: "success",
      value: res.data,
    } as unknown as ResultSuccess<Process>;
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
  idFlow: number;
  priority: number;
  effectiveDate: Date;
}): Promise<Result<Process>> => {
  try {
    const res = await api.processes.put<Process>("/updateProcess", data);
    return {
      type: "success",
      value: res.data,
    } as unknown as ResultSuccess<Process>;
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
