import { api } from "services/api";

export const getNotesByProcessRecord = async (
  record: string
): Promise<Result<Note[]>> => {
  try {
    const res = await api.note.get<Note[]>(`/${record}`);

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const getNotesByProcessId = async (
  idProcess: number
): Promise<Result<Note[]>> => {
  try {
    const res = await api.note.get<Note[]>(`/${idProcess}`);

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const addNoteToProcess = async (data: {
  idProcess: number;
  idStageA: string;
  idStageB: string;
  commentary: string;
}): Promise<Result<Note>> => {
  try {
    const res = await api.note.post<Note>("/newNote", data);

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const deleteProcessNote = async (
  idNote: number
): Promise<Result<Note>> => {
  try {
    const res = await api.note.delete<Note>(`/deleteNote/${idNote}`);

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};
