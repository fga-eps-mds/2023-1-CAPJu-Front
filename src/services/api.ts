import axios, { AxiosInstance } from "axios";

import { Services } from "services";
import {
  errorResponseHandler,
  authorization,
} from "services/config/interceptors";

type ServiceName = keyof typeof Services;

const api = {} as Record<ServiceName, AxiosInstance>;

Object.entries(Services).forEach(([serviceName, { baseURL }]) => {
  if (!baseURL)
    console.warn(
      `Falha ao carregar a baseURL do serviço ${serviceName}. Verificar '.env'.`,
      `A baseURL do ${serviceName} é '${baseURL}'.`
    );

  api[serviceName as ServiceName] = axios.create({
    baseURL,
  });

  api[serviceName as ServiceName].interceptors.request.use(authorization);

  api[serviceName as ServiceName].interceptors.response.use(
    (response) => response,
    errorResponseHandler
  );
});

export { api };
