import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import { signIn, signUp } from "../user";

const mock = new MockAdapter(api.user);

describe("Testes para a função signIn", () => {
  afterEach(() => {
    mock.reset();
  });

  it("Sucesso signIn", async () => {
    mock.onPost("/login").reply(200, "mock-token");

    const result = await signIn({ cpf: "usuário", password: "senha" });

    expect(result).toEqual({ type: "success", value: "mock-token" });
  });

  it("Erro signIn", async () => {
    mock.onPost("/login").reply(401, "Invalid credentials");

    const result = await signIn({ cpf: "usuário", password: "senha" });

    expect(result).toEqual({
      type: "error",
      error: new Error("Invalid credentials"),
      value: undefined,
    });
  });

  // it('Erro desconhecido signIn', async () => {
  //   mock.onPost('/login').reply(500, 'Erro desconhecido');

  //   const result = await signIn({cpf:'usuário', password:'senha'});

  //   expect(result).toEqual({ type: 'error', error: new Error('Erro desconhecido'), value: undefined,
  // });
  // });
});

describe("Testes para a função signUp", () => {
  afterEach(() => {
    mock.reset();
  });

  it("Sucesso signUp", async () => {
    mock.onPost("/newUser").reply(200, "dados");

    const result = await signUp({
      fullName: "Joe Fulano",
      cpf: "11111111111",
      email: "joe@email.com",
      password: "senha",
      passwordConfirmation: "senha",
      idUnit: "1",
      idRole: "1",
    });

    expect(result).toEqual({ type: "success", value: "dados" });
  });

  it("Erro signUp", async () => {
    mock.onPost("/newUser").reply(500, "Erro ao criar usuário");

    const result = await signUp({
      fullName: "Joe Fulano",
      cpf: "11111111111",
      email: "joe@email.com",
      password: "senha",
      passwordConfirmation: "senha",
      idUnit: "1",
      idRole: "1",
    });

    expect(result).toEqual({
      type: "error",
      error: new Error("Erro ao criar usuário"),
      value: undefined,
    });
  });

  // it('Erro desconheido signUp', async () => {
  //   mock.onPost('/newUser').reply(500, "Erro desconhecido");

  //   const result = await signUp({
  //     fullName: "Joe Fulano",
  //     cpf: "11111111111",
  //     email: "joe@email.com",
  //     password: "senha",
  //     passwordConfirmation: "senha",
  //     idUnit: "1",
  //     idRole: "1",
  //   });

  //   expect(result).toEqual({ type: 'error',error:new Error('Erro desconhecido'), value: undefined});
  // });
});
