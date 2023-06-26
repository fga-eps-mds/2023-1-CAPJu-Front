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
  {
    idUnit: 6,
    name: "Unidade 6",
  },
  {
    idUnit: 7,
    name: "Unidade 7",
  },
  {
    idUnit: 8,
    name: "Unidade 8",
  },
  {
    idUnit: 9,
    name: "Unidade 9",
  },
  {
    idUnit: 10,
    name: "Unidade 10",
  },
];

export const mockedStages = [
  {
    idStage: 1,
    name: "a",
    duration: 2,
    idUnit: 1,
  },
  {
    idStage: 2,
    name: "b",
    duration: 5,
    idUnit: 2,
  },
  {
    idStage: 3,
    name: "c",
    duration: 5,
    idUnit: 3,
  },
  {
    idStage: 4,
    name: "d",
    duration: 5,
    idUnit: 4,
  },
  {
    idStage: 5,
    name: "e",
    duration: 5,
    idUnit: 5,
  },
  {
    idStage: 6,
    name: "f",
    duration: 5,
    idUnit: 6,
  },
  {
    idStage: 7,
    name: "g",
    duration: 5,
    idUnit: 7,
  },
  {
    idStage: 8,
    name: "h",
    duration: 5,
    idUnit: 8,
  },
  {
    idStage: 9,
    name: "i",
    duration: 5,
    idUnit: 9,
  },
  {
    idStage: 10,
    name: "j",
    duration: 5,
    idUnit: 10,
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
    name: "FirstFlow",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 2,
    name: "SecondFlow",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 3,
    name: "ThirdFlow",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 4,
    name: "Fluxo 4",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 5,
    name: "Fluxo 5",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 6,
    name: "Fluxo 6",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 7,
    name: "Fluxo 7",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 8,
    name: "Fluxo 8",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 9,
    name: "Fluxo 9",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
  {
    idFlow: 10,
    name: "Fluxo 10",
    idUnit: 1,
    stages: [1, 2],
    sequences: [{ from: 1, commentary: "Comentário", to: 2 }],
  },
];

export const mockedProcesses = [
  {
    effectiveDate: null,
    idFlow: 1,
    idPriority: 0,
    idStage: null,
    idUnit: 1,
    nickname: "Processo não Iniciado",
    record: "12345678912345678915",
    status: "notStarted",
  },
  {
    effectiveDate: null,
    idFlow: 1,
    idPriority: 1,
    idStage: null,
    idUnit: 1,
<<<<<<< HEAD
    nickname: "Processo Arquivado",
    record: "12345678912345678916",
    status: "archived",
=======
    nickname: "A",
    record: "12345678912345678910",
    status: "notStarted",
>>>>>>> e3f8220 ((fga-eps-mds/2023-1-CAPJu-Doc#121) - Adiciona teste de paginação na página de processos.)
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: 1,
    idStage: 1,
    idUnit: 1,
<<<<<<< HEAD
    nickname: "Processo em Andamento",
    record: "12345678912345678917",
    status: "inProgress",
=======
    nickname: "B",
    record: "12345678912345678911",
    status: "notStarted",
>>>>>>> e3f8220 ((fga-eps-mds/2023-1-CAPJu-Doc#121) - Adiciona teste de paginação na página de processos.)
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
<<<<<<< HEAD
    nickname: "Processo Finalizado",
    record: "12345678912345678918",
=======
    nickname: "C",
    record: "12345678912345678912",
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "D",
    record: "12345678912345678913",
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "E",
    record: "12345678912345678914",
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "F",
    record: "12345678912345678915",
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "G",
    record: "12345678912345678916",
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "H",
    record: "12345678912345678917",
>>>>>>> e3f8220 ((fga-eps-mds/2023-1-CAPJu-Doc#121) - Adiciona teste de paginação na página de processos.)
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "I",
    record: "12345678912345678918",
    status: "finished",
  },
  {
    effectiveDate: new Date(),
    idFlow: 1,
    idPriority: null,
    idStage: null,
    idUnit: 1,
    nickname: "J",
    record: "12345678912345678919",
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

export const mockedNotStartedProcess = {
  effectiveDate: null,
  idFlow: 1,
  idPriority: 0,
  idStage: null,
  idUnit: 1,
  nickname: "Processo NS",
  record: "12345678912345678915",
  status: "notStarted",
};

export const mockedInProgressProcess = {
  effectiveDate: "2023-06-21T01:00:54.109Z",
  idFlow: 2,
  idPriority: 0,
  idStage: 1,
  idUnit: 1,
  nickname: "Processo NS",
  record: "12345678901234567881",
  status: "inProgress",
  progress: [
    {
      idStage: 1,
      entrada: "2023-06-21T01:00:54.110Z",
      vencimento: "2023-06-22T01:00:54.110Z",
    },
  ],
};
