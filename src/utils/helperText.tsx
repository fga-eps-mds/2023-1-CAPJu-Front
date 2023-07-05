export const helperText = [
  {
    title: "Unidades",
    subtitle:
      "Unidades representam setores da Justiça Federal, como, por exemplo, uma Vara Judicial.",
    content: [
      "Na página de Unidades é possível visualizar os setores cadastrados (Varas e Centrais) de uma determinada localidade (Seção Judiciária ou Tribunal, por exemplo)",
      "Apenas no perfil de Administrador é possível criar, editar ou excluir uma Unidade",
    ],
  },
  {
    title: "Etapas",
    subtitle:
      "Etapas representam as fases de um Processo em um determinado Fluxo de trabalho.",
    content: [
      "Na página de Etapas é possível visualizar as Etapas cadastradas com as informações de nome e duração em dias úteis.",
      "Para alguns perfis é possível criar, editar ou excluir uma Etapa.",
    ],
  },
  {
    title: "Fluxos",
    subtitle:
      "Fluxos representam a sequência de Etapas seguida por um Processo.",
    content: [
      "Na página de Fluxos é possível visualizar os Fluxos cadastrados com a informação de nome.",
      "A criação de um Fluxo exige pelo menos 2 etapas e um usuário a ser notificado sobre atraso nas Etapas.",
      "A sequência das Etapas no Fluxo é definida pela ordem de escolha (inserção) da Etapa",
      "Para alguns perfis é possível criar, visualizar, editar ou excluir um Fluxo.",
      "A opção visualizar redireciona o usuário para a página com a lista de Processos em andamento no Fluxo selecionado",
      "Arquivado é a situação do Processo que precisou ser retirado do Fluxo antes de percorrer todas as Etapas",
      "Finalizado é a situação do Processo que percorreu todas as Etapas do Fluxo.",
    ],
  },
  {
    title: "Processos",
    subtitle:
      "Processos podem ser judiciais (tramitam no sistema PJe) ou administrativos (tramitam no sistema SEI).",
    content: [
      "Na página de Processos é possível visualizar os Processo cadastrados com as informações de registro (número), apelido, situação no Fluxo, Fluxo pertencente e status.",
      "O registro de um Processo deve ser feito de acordo com a numeração padrão do CNJ.",
      "Na página de visualização é apresentada a lista dos Processos em andamento nos diversos Fluxos.",
      "O avanço e retrocesso de Etapa, bem como o arquivamento, de um Processo é feito na opção de visualização do Process",
      "Para alguns perfis é possível criar, visualizar, editar ou excluir um Processo.",
    ],
  },
  {
    title: "Cadastro",
    subtitle:
      "Na página de Cadastro é possível visualizar as solicitações de acesso ao sistema e os acessos concedidos.",
    content: [
      `Na parte "solicitações", para alguns perfis é possível visualizar, aceitar e recusar a solicitação de cadastro do usuário.`,
      `Na parte “perfil de acesso”, para alguns perfis é possível visualizar, editar e remover um usuário.`,
    ],
  },
  {
    title: "Editar Conta",
    subtitle: `A página "Editar conta" permite ao usuário editar o e-mail e a senha cadastrados do usuário.`,
  },
];
