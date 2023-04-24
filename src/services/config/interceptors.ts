import { AxiosError } from "axios";

export const errorResponseHandler = (
  error: AxiosError<ApiResponse<string>>
) => {
  if (error?.response) {
    console.log("AXIOS INTERCEPTED ERROR: ", error.response);

    if (typeof error?.response?.data === "string") {
      return Promise.reject(new Error(error.response.data));
    }

    if (typeof error?.response?.data?.message === "string") {
      return Promise.reject(
        new Error(error.response.data.message, {
          cause: new Error(error.response.data.data),
        })
      );
    }

    return Promise.reject(
      new Error("Something went wrong", {
        cause: error,
      })
    );
  }

  if (error?.request) {
    console.log("INTERNAL SERVER ERROR: ", error?.toJSON?.());

    return Promise.reject(new Error("Internal server error"));
  }

  return Promise.reject(error);
};
