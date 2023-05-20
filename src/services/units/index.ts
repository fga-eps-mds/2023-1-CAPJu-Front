import { api } from "services/api";

export const getUnits = async (): Promise<Result<Unit[]>> => {
  try {
    const res = await api.units.get<Unit[]>("/units");

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

export const createUnit = async (data: {
  name: string;
}): Promise<Result<Unit>> => {
  try {
    const res = await api.units.post<Unit>("/newUnit", data);

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

export const deleteUnit = async (idUnit: number): Promise<Result<any>> => {
  try {
    const res = await api.units.delete<Unit>("/deleteUnit", {
      data: { idUnit },
    });

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

export const getUnitAdmins = async (
  unitId: number
): Promise<Result<User[]>> => {
  try {
    const res = await api.units.get<User[]>(`/unitAdmins/${unitId}`);

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

export const addUnitAdmin = async (data: {
  idUnit: number;
  cpf: string;
}): Promise<Result<null>> => {
  try {
    await api.units.put("/setUnitAdmin/", { ...data });

    return { type: "success", value: null };
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

export const removeUnitAdmin = async (data: {
  idUnit: number;
  cpf: string;
}): Promise<Result<null>> => {
  try {
    await api.units.put("/removeUnitAdmin/", { ...data });

    return { type: "success", value: null };
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
