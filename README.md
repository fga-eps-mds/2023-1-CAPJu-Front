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
### Configurando .env.local

Configure o arquivo .env.local dos repositório igual abaixo:

```
VITE_USER_SERVICE_URL=
VITE_UNITS_SERVICE_URL=
VITE_STAGES_SERVICE_URL=
VITE_PROCESSES_SERVICE_URL=
VITE_FLOWS_SERVICE_URL=
```

Obs: é necessário ser igual ao back-end.

## Execute o projeto

Para executar o projeto é recomendar executar os comandos na ordem de repositórios de back-end primeiro e front-end ao final. E cada um em um terminal diferente. 

Os comandos de execução do ambiente do projeto estão todos descritos no arquivo Makefile, desde sua instalação, passando pela execução até possíveis remoções, sendo aqui descritas apenas a sua instalação e execução:

```bash
# Para rodar o projeto pela primeira vez basta executar o comando:

make first

# Após sua execução a aplicação deve estar na porta 3000, bastando acessar o endereço localhost:3000 no navegador.
# Para as próximas execução basta executar o comando:

make start

# Para interromper a execução da aplicação execute o comando:

make stop
```

## Instalação local

Para executar a aplicação localmente (fora do ambiente dockerizado), basta executar os comandos:

```bash

yarn # Instala as bibliotecas 

# E em seguida

yarn dev # Inicia a execução da aplicação na porta 3000
```

## Testes

Para rodar os testes execute:

```bash
yarn test
```

## Instalando Novas Dependecias

Pode ser utilizado o seguinte comando para inserir novas dependencias na aplicação:

```bash
yarn add nome-da-dependencia
```

Veja que, o exemplo acima adiciona a biblioteca no ambiente local, para realizar a instalação no container docker execute:

```bash
# Esse comando deve abrir um terminal dentro do container, 
# certifique-se que o nome do container (capju-front) coincide com o nome do ambiente em sua máquina
docker-compose exec -it capju-front sh

# Agora sim podemos instalar a biblioteca normalmente
yarn add nome-da-dependencia

# E para sair de dentro do container
exit
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
