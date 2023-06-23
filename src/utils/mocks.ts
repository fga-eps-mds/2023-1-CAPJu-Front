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
    name: "a",
    duration: 5,
    idUnit: 1,
    createdAt: "2100-06-19T03:26:25.050Z",
    entrada: new Date(),
    vencimento: new Date(),
  },
  {
    idStage: 2,
    name: "b",
    duration: 3,
    idUnit: 1,
    createdAt: "2100-06-19T03:26:25.050Z",
    entrada: new Date(),
    vencimento: new Date(),
  },
  {
    idStage: 3,
    name: "c",
    duration: 1,
    idUnit: 1,
    createdAt: "2100-06-19T03:26:25.050Z",
    entrada: new Date(),
    vencimento: new Date(),
  },
];

export const mockedFlow = {
  idFlow: 1,
  name: "Fluxo 1",
  idUnit: 1,
  stages: [1, 2],
  sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
};

export const mockedFlows = [
  {
    idFlow: 1,
    name: "Fluxo 1",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 2,
    name: "Fluxo 2",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 3,
    name: "Fluxo 3",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
];

export const mockedNotStartedProcess = {
  effectiveDate: null,
  idFlow: 1,
  idPriority: 0,
  idStage: null,
  idUnit: 1,
  nickname: "Apelido do Processo",
  record: "12345678912345678915",
  status: "notStarted",
};

export const mockedProcesses = [
  {
    effectiveDate: null,
    idFlow: 1,
    idPriority: 1,
    idStage: null,
    idUnit: 1,
    nickname: "Apelido do Processo",
    record: "12345678912345678915",
    status: "notStarted",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: 1,
    idStage: 1,
    idUnit: 1,
    nickname: "Processo em Andamento",
    record: "12345678912345678916",
    status: "notStarted",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "Processo Finalizado",
    record: "12345678912345678917",
    status: "finished",
  },
];

export const mockedPriorities = [
  {
    idPriority: 1,
    description: "Art. 1048, II. Do CPC (ECA)",
  },
  {
    idPriority: 2,
    description: "Art. 1048, IV do CPC (Licitação)",
  },
  {
    idPriority: 3,
    description: "Art. 7, parágrafo 4, da Lei n 12.016/2009",
  },
  {
    idPriority: 4,
    description: "Idosa(a) maior de 80 anos",
  },
  {
    idPriority: 5,
    description: "Pessoa com deficiencia",
  },
  {
    idPriority: 6,
    description: "Pessoa em situação de rua",
  },
  {
    idPriority: 7,
    description: "Portador(a) de doença grave",
  },
  {
    idPriority: 8,
    description: "Réu Preso",
  },
];

export const mockedStage = [
  {
    idStage: 1,
    idUnit: 1,
    name: "a",
    duration: 5,
    createdAt: "2100-06-19T03:26:25.050Z",
    entrada: new Date(),
    vencimento: new Date(),
  },
];

export const mockedFlowSequence = [
  {
    from: 1,
    to: 2,
    commentary: "",
  },
];
