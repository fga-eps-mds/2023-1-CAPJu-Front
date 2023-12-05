import { api } from "../../api";

const processFileUrl = "processesFile";

export const importFile = async (data: {
  file: File;
  name: string;
}): Promise<Result<ProcessesFile>> => {
  try {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("file", data.file);

    const res = await api.processManagement.post<ProcessesFile>(
      "/processesFile/newFile",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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

export const findFileById = async (
  idProcessesFile: number,
  resulting: boolean = false,
  format: string = "xlsx"
): Promise<Result<ProcessesFile>> => {
  try {
    const originalQueryParam = resulting ? "false" : "true";

    const url = `/processesFile/findFileById/${idProcessesFile}?original=${originalQueryParam}&format=${format}`;

    const res = await api.processManagement.get<ProcessesFile>(url);

    return {
      type: "success",
      value: res.data,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const findAllPaged = async (
  pagination?: Pagination,
  nameOrRecord?: string
): Promise<Result<any>> => {
  try {
    const res = await api.processManagement.get<ProcessesFile[]>(
      `/${processFileUrl}/findAllPaged`,
      {
        params: {
          offset: nameOrRecord?.trim() ? 0 : pagination?.offset ?? 0,
          limit: pagination?.limit,
          ...(nameOrRecord?.trim() && { nameOrRecord: nameOrRecord.trim() }),
        },
      }
    );
    return { type: "success", value: res.data as any };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const findAllItemsPaged = async (
  idProcessesFile: number,
  pagination?: Pagination
): Promise<Result<any>> => {
  try {
    const res = await api.processManagement.get<ProcessesFileItem[]>(
      `/${processFileUrl}/findAllItemsPaged?idProcessesFile=${idProcessesFile}`,
      {
        params: {
          offset: pagination?.offset ?? 0,
          limit: pagination?.limit,
        },
      }
    );
    return { type: "success", value: res.data as any };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const deleteById = async (
  idProcessesFile: number
): Promise<Result<void>> => {
  try {
    await api.processManagement.delete<void>(
      `/${processFileUrl}/deleteFile/${idProcessesFile}`
    );

    return {
      type: "success",
      value: undefined,
    };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const updateFileItemById = async (
  idProcessesFileItem: number,
  data: any
): Promise<Result<number>> => {
  try {
    const res = await api.processManagement.put<number>(
      `/${processFileUrl}/updateFileItem/${idProcessesFileItem}`,
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
