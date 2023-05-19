export const Services = {
  user: {
    baseURL: import.meta.env.VITE_USER_SERVICE_URL,
  },
  units: {
    baseURL: import.meta.env.VITE_UNITS_SERVICE_URL,
  },
  stages: {
    baseURL: import.meta.env.VITE_STAGES_SERVICE_URL,
  },
  flows: {
    baseURL: import.meta.env.VITE_FLOWS_SERVICE_URL,
  },
};
