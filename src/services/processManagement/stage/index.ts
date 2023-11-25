import { api } from "services/api";

export const getStages = async (
  pagination?: Pagination,
  filter?: { type: string; value: string }
): Promise<Result<Stage[]>> => {
  try {
    const res = await api.processManagement.get<{
      stages: Stage[];
      totalPages: number;
    }>("/stage", {
      params: {
        offset: pagination?.offset ?? 0,
        limit: pagination?.limit,
        filter,
      },
    });

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

export const createStage = async (data: {
  name: string;
  duration: number;
}): Promise<Result<Stage>> => {
  try {
    const res = await api.processManagement.post<Stage>(
      "/stage/newStage",
      data
    );

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const updateStage = async (data: {
  idStage: number;
  name: string;
}): Promise<Result<Stage>> => {
  try {
    const res = await api.processManagement.put<Stage>(
      "/stage/updateStage",
      data
    );

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const deleteStage = async (idStage: number): Promise<Result<Stage>> => {
  try {
    const res = await api.processManagement.delete<Stage>(
      `/stage/deleteStage/${idStage}`
    );

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};
