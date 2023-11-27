import { api } from "services/api";

export const getPriorities = async (
  id?: number
): Promise<Result<Priority[] | Priority>> => {
  try {
    const res = await api.processManagement.get<Priority[]>("/priority");
    const priorityById = id
      ? res.data?.find((item) => item.idPriority === id)
      : null;

    return priorityById
      ? { type: "success", value: priorityById }
      : { type: "success", value: res.data };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};
