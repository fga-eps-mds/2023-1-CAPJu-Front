import { api } from "services/api";

export const getStages = async (): Promise<Result<Stage[]>> => {
  try {
    const res = await api.stages.get<Stage[]>("/stages");

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

export const createStage = async (data: {
  name: string;
  duration: number;
  idUnit: number;
}): Promise<Result<Stage>> => {
  try {
    const res = await api.stages.post<Stage>("/newStage", data);

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

export const deleteStage = async (idStage: number): Promise<Result<Stage>> => {
  try {
    const res = await api.stages.delete<Stage>(`/deleteStage/${idStage}`);

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
