import { api } from "services/api";

export const getNotesByProcessRecord = async (
  record: string
): Promise<Result<Note[]>> => {
  try {
    const res = await api.note.get<Note[]>(`/note/${record}`);

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

export const addNoteToProcess = async (data: {
  record: string;
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
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
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
    if (error instanceof Error)
      return { type: "error", error, value: undefined };

    return {
      type: "error",
      error: new Error("Erro desconhecido"),
      value: undefined,
    };
  }
};
