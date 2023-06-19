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

export const mockedStages = [
  {
    idStage: 1,
    idUnit: 1,
    name: "a",
    duration: 1,
  },
  {
    idStage: 2,
    idUnit: 2,
    name: "b",
    duration: 2,
  },
  {
    idStage: 3,
    idUnit: 3,
    name: "c",
    duration: 3,
  },
];
