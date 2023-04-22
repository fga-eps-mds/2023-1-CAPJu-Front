# CAPJu - Front

<div align="center">
  <img src="https://i.imgur.com/0KsqIUe.png" alt="logo">
</div>

## Sobre Projetos

O CAPJu é abreviação para _"Controle e Acompanhamento de Processos da Justiça"_, no qual trata-se de uma projeto de código aberto que tem como objetivo ajudar os usuários da 4ª vara cível da Justiça Federal na realização de gerenciar os processos.

Este repositório, em especial, é totalmente dedicado à manutenção dos detalhes do Microserviço Front do projeto. Sinta-se livre para contribuir, mas antes leia o guia de contribuição.

O CAPJu é uma aplicação _Web_ compatível com qualquer navegador.

## Tecnologias

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)


## Instalação
### Configurando .env

Configure o arquivo .env dos repositório igual abaixo:

```
JWT_SECRET=
REACT_APP_API_SERVICE=
REACT_APP_USER_SERVICE=
```

Obs: é necessário ser igual ao back-end.

### Instalado bibliotecas do node

Para instalar as bibliotecas de cada repositorio basta apenas dar o seguinte comando

```
yarn install
```
## Execute o projeto

Para executar o projeto é recomendar executar os comandos na ordem de repositórios de back-end primeiro e front-end ao final. E cada um em um terminal diferente

```
yarn dev
```
## Testes

Para rodar os testes execute:

```bash
yarn test
```

## Instalando de Dependecias

Pode ser utilizado o seguinte comando para inserir novas dependencias no sistema

```bash
yarn add "nome_da_dependencia"
```

### Deployment

[GitHub Actions](https://github.com/fga-eps-mds/2023-1-CAPJu-Front/actions).

## Contribuição

Certifique-se de ler o [Guia de Contribuição](https://github.com/fga-eps-mds/2023-1-CAPJu-Front/blob/main/.github/CONTRIBUTING.md) antes de realizar qualquer atividade no projeto!

## Licença

O CAPJu está sob as regras aplicadas na licença [MIT](https://github.com/fga-eps-mds/2023-1-CAPJu-Front/blob/main/LICENSE)

## Contribuidores

<a href="https://github.com/fga-eps-mds/2023-1-CAPJu-Front/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fga-eps-mds/2023-1-CAPJu-Front" />
</a>