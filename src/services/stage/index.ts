import { api } from "services/api";

export const getStages = async (): Promise<Result<Stage[]>> => {
  try {
    const res = await api.stages.get<Stage[]>("/stages");
    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Stage[]
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
    } as unknown as ResultSuccess<Stage>;
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
