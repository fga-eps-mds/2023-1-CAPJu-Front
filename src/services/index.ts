export const Services = {
  note: {
    baseURL: import.meta.env.VITE_NOTE_SERVICE_URL,
  },
  processManagement: {
    baseURL: import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL,
  },
  role: {
    baseURL: import.meta.env.VITE_ROLE_SERVICE_URL,
  },
  unit: {
    baseURL: import.meta.env.VITE_UNIT_SERVICE_URL,
  },
  user: {
    baseURL: import.meta.env.VITE_USER_SERVICE_URL,
  },
};
