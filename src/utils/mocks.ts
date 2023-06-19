export const mockedUser = {
  cpf: "12345678900",
  fullName: "User Teste",
  email: "test@test.com",
  idUnit: 1,
  token: "mocked-token",
  idRole: 1,
  expiresIn: "2100-06-19T03:26:25.050Z",
};

export const mockedAdminUser = {
  ...mockedUser,
  idRole: 5,
};

export const mockedManagerUser = {
  ...mockedUser,
  idRole: 1,
};

export const mockedUnits = [
  {
    idUnit: 1,
    name: "Unidade 1",
  },
  {
    idUnit: 2,
    name: "Unidade 2",
  },
  {
    idUnit: 3,
    name: "Unidade 3",
  },
  {
    idUnit: 4,
    name: "Unidade 4",
  },
  {
    idUnit: 5,
    name: "Unidade 5",
  },
];

export const mockedProcesses = [
  {
    record: "12345678901234567881",
    nickname: "teste",
    status: "notStarted",
  },
];

export const mockedFlows = [
  {
    idFlow: 1,
    idUnit: 1,
    name: "teste",
  },
  {
    idFlow: 2,
    idUnit: 1,
    name: "abcd",
  },
  {
    idFlow: 3,
    idUnit: 1,
    name: "quadrado",
  },
];
