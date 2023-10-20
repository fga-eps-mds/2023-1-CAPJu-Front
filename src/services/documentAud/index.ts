import {api} from "../api";

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

        if (error instanceof Error)
            return { type: "error", error, value: error.message };


        return {
            type: "error",
            error: new Error("Erro desconhecido"),
            value: undefined,
        };


    }

}