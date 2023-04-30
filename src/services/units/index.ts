import { api } from "services/api";

export const getUnits = async (): Promise<Result<Unit[]>> => {
  try {
    const res = await api.units.get<Unit[]>("/units");

    return { type: "success", value: res.data } as unknown as ResultSuccess<
      Unit[]
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

export const createUnit = async (data: {
  name: string;
}): Promise<Result<Unit>> => {
  try {
    const res = await api.units.post<Unit>("/newUnit", data);

    return {
      type: "success",
      value: res.data,
    } as unknown as ResultSuccess<Unit>;
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

export const getUnitAdmins = async (
  unitId: string
): Promise<Result<User[]>> => {
  try {
    const res = await api.units.get<Unit[]>(`/units/${unitId}`);

    return { type: "success", value: res.data } as unknown as Result<User[]>;
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
