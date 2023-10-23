import { api } from "services/api";

export const getProcessesByDueDate = async (
  minDate: string,
  maxDate: string
): Promise<Result<Process[]>> => {
  try {
    const res = await api.processManagement.get<{
      processInDue: Process[];
      totalPages: number;
    }>(`/statistics/${minDate}/${maxDate}`);

    return {
      type: "success",
      value: res.data.processInDue,
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
