import { api } from "../api";

export const registerEvent = async (data: DocumentAudInput) => {
  try {
    const res = await api.processManagement.post<DocumentAudInput>(
      "/documentAud/registerEvent",
      data
    );

    return {
      type: "success",
      value: res.data,
    };
  } catch (error: any) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};
