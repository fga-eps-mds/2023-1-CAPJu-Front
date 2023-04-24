export function authorization() {
  const localStorageUser = localStorage.getItem("@CAPJu:user");

  if (!localStorageUser) return {};

  const user = JSON.parse(localStorageUser);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
  };

  return config;
}
