import { api } from "services/api";

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
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};
