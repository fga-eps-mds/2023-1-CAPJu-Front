import {AxiosError, InternalAxiosRequestConfig} from "axios";

export function authorization(
    config: InternalAxiosRequestConfig<any>
): InternalAxiosRequestConfig<any> {
  const bearerTokenWithQuotes = localStorage.getItem("@CAPJu:jwt_user");

  if (!bearerTokenWithQuotes)
    return config;

  if(config.url !== '/logout/userRequested')
    localStorage.setItem("@CAPJu:check_session_flag", 'true');

  const bearerToken = JSON.parse(bearerTokenWithQuotes);

  const authConfig = config;

  authConfig.headers.Authorization = `Bearer ${bearerToken}`;

  return authConfig;
}

export const errorResponseHandler = (
  error: AxiosError<ApiResponse<string>>
) => {
  if (error?.response) {
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

    if (typeof error?.response?.data?.error === "string") {
      return Promise.reject(new Error(error.response.data.error));
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
