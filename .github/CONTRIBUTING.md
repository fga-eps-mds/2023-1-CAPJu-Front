
# Guia de Contribuição

Oi, estamos realmente felizes em saber em seu interesse em contribuir para o CAPJu - Controle de Acompanhamento de Processos da Justiça. Antes disso, certifique-se de tirar um momento e ler as seguintes orientações.

## Como eu posso contribuir para o CAPJu?

* Leia o nosso [**Código de Conduta**](./CODE_OF_CONDUCT.md)
* Crie sua [**Issue**](#crie-sua-issue)
* Crie uma [**Branch**](#política-de-branches)
* Fazer seus [**Commits**](#política-de-commits)
* Crie um [**Pull Request**](#crie-um-pull-request)

---

## Crie sua _Issue_

* Este projeto possui um padrão para criação de [_issue_](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/blob/main/.github/ISSUE_TEMPLATE/). Logo, se você encontrar um bug ou melhoria cheque se já se encontra cadastrado nas nossas [issues](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/issues), caso a resposta seja não, apenas abra uma [nova issues](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/issues/new/) utilizando uma label que adequa-se.

## Crie um Pull Request

1. Primeiramente, verifique se não existe nenhuma issue já cadastrada que solicite essa modificação nas  [_Issues_](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/issues). 

2. Se não existir, será preciso criar uma nova, com uma boa descrição da sugestão de mudança em [_Nova Issue_](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/issues/new/) e um título de fácil entendimento.

3. As suas mudanças devem ser submetidas por meio de [_Pull Requests_](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/pulls), que conta com um [_Template_](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/blob/main/.github/pull_request_template.md).

## Política de _Commits_

### Mensagem do _Commit_

A descrição dos _commits_ devem está em **português** e devem ser sucintas e objetivas, representando claramente o que está sendo alterado naquele _commit_. A mensagem deve estar acompanhada do número da _issue_ relacionada, como no exemplo abaixo:

> `git commit -m'X-Mensagem'`

__Onde X representa o número da _issue_ relacionada.__

### _Commits_ com pareamento

Quando houver pareamento o _commit_ deve vir acompanhado da mensagem: `Co-authored-by: CoAuthorName <coauthoremail@mail.com>`. Para tal deve-se seguir os seguintes passos:

1. `git commit -s`
1. Inserir a descrição do _commit_ na primeira linha
1. Na linha seguinte inserir a mensagem `Co-authored-by: CoAuthorName <coauthoremail@mail.com>`, com os respectivos dados do co-autor.

## Política de _Branches_

Objetivando manter a confiabilidade do código fonte do nosso produto, propõe-se o uso de uma política de branches para orientar os desenvolvedores no modo de organização das suas contribuições neste repositório. Assim, estabelecemos:


branch padrão **main**, para hospedar o código estável do projeto (que estará em ambiente de homologação);


__gh-pages__: Designada para conter todos os documentos do projeto, disponíveis no [Github Pages](https://fga-eps-mds.github.io/2022-1-CAPJu-Doc/#/)

* __`docs/nome_documento`__ - Branch onde será consolidada a documentação do projeto, sendo usada exclusivamente para isso.

* __`devel`__ - Branch destinada à integração das novas funcionalidades desenvolvidas, onde estarão as features em estágio avançado e/ou completas. Esta será a branch base para o desenvolvimento inicial de features e de correção de bugs. 

* __`hotfix/<nome_bug>`__ - Branch dedicada para correção de bugs presentes na aplicação. É preciso especificar o número da _issue_ cadastrada no repositório.
Exemplo: `hotfix/1-<nome_bug>` (_issue_ #1)

* __`feature/<feature-name>`__ - Branch usada para desenvolvimento de uma nova feature no projeto. O nome deve conter o número da issue registrada, no formato. 
Exemplo: `feature/1-<feature-name>` (_issue_ #1)

* __`release/<release-version>`__ - Branch destinada à ajustes finais/build que serão feitas para entrega de uma realize do software. O nome deve ser a própria versão da release. 


Para mais informações acesse [Estrutura de Branches e Padrões](https://github.com/fga-eps-mds/2022-1-CAPJu-Doc/branches)

## Referência:

> Guia de Contribuição [Over26](https://github.com/fga-eps-mds/2019.2-Over26/blob/master/.github/CONTRIBUTING.md)
