import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import { signIn } from "../user";

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

  // it('Erro desconhecido', async () => {
  //   mock.onPost('/login').reply(500, 'Erro desconhecido');

  //   const result = await signIn({cpf:'usuário', password:'senha'});

  //   expect(result).toEqual({ type: 'error', error: new Error('Erro desconhecido'), value: undefined,
  // });
  // });
  mock.reset();
});
