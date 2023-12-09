import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import {
  signIn,
  signUp,
  getUserById,
  updateUser,
  updateUserPassword,
  forgotPassword,
  getAcceptedUsers,
} from "../user";

const apiMockUser = new MockAdapter(api.user);
const apiMockRole = new MockAdapter(api.role);

describe("Testes para a função signIn", () => {
  afterEach(() => {
    apiMockUser.reset();
  });

  it("Sucesso signIn", async () => {
    apiMockUser.onPost("/login").reply(200, "mock-token");

    const result = await signIn({ cpf: "usuário", password: "senha" });

    expect(result).toEqual({ type: "success", value: "mock-token" });
  });

  it("Erro signIn", async () => {
    apiMockUser.onPost("/login").reply(401, "Invalid credentials");

    const result = await signIn({ cpf: "usuário", password: "senha" });

    expect(result).toEqual({
      type: "error",
      error: new Error("Invalid credentials"),
      value: undefined,
    });
  });
});

describe("Testes para a função signUp", () => {
  afterEach(() => {
    apiMockUser.reset();
  });

  it("Sucesso signUp", async () => {
    apiMockUser.onPost("/newUser").reply(200, "dados");

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
    apiMockUser.onPost("/newUser").reply(500, "Erro ao criar usuário");

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
});

describe("Testes para a função getUserById", () => {
  afterEach(() => {
    apiMockUser.reset();
    apiMockRole.reset();
  });

  it("getUserById: usuario existe e não tem idRole", async () => {
    const id = "1";
    apiMockUser.onGet(`/cpf/${id}`).reply(200, { nome: "Fulano" });

    const result = await getUserById(id);

    expect(result).toEqual({
      type: "success",
      value: { nome: "Fulano", allowedActions: [] },
    });
  });

  it("getUserById: usuario existe e tem idRole, sem allowedActions", async () => {
    const id = "1";
    apiMockUser.onGet(`/cpf/${id}`).reply(200, { nome: "Fulano", idRole: 1 });

    const result = await getUserById(id);
    expect(result).toEqual({
      type: "success",
      value: {
        nome: "Fulano",
        idRole: 1,
        allowedActions: [],
      },
    });
  });

  it("getUserById: usuario existe e tem idRole, com allowedActions", async () => {
    const id = "1";
    const userData = {
      nome: "Fulano",
      idRole: 1,
    };
    const role = {
      roleId: 1,
      name: "Administrador",
      allowedActions: ["Ação 1", "Ação 2"],
    };
    apiMockUser.onGet(`/cpf/${id}`).reply(200, { ...userData });
    apiMockRole.onGet(`/roleAdmins/${userData.idRole}`).reply(200, { ...role });

    const result = await getUserById(id);
    expect(result).toEqual({
      type: "success",
      value: {
        nome: "Fulano",
        idRole: 1,
        allowedActions: role.allowedActions,
      },
    });
  });

  it("getUserById: usuario não existe", async () => {
    const id = "1";
    apiMockUser.onGet(`/cpf/${id}`).reply(404, "Usuario não encontrado");

    const result = await getUserById(id);

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Usuario não encontrado"),
    });
  });
});

describe("Testes para a função updateUser", () => {
  afterEach(() => {
    apiMockUser.reset();
  });

  it("updateUser: sucesso", async () => {
    const cpf = "11111111111";
    const data = { email: "email@email" };
    apiMockUser.onPut(`/updateUser/${cpf}`, data).reply(200, { ...data });

    const result = await updateUser(data, cpf);

    expect(result).toEqual({ type: "success", value: data });
  });

  it("updateUser: erro", async () => {
    const cpf = "11111111111";
    const data = { email: "email@email" };
    apiMockUser.onPut(`/updateUser/${cpf}`, data).reply(500, "Ocorreu um erro");

    const result = await updateUser(data, cpf);

    expect(result).toEqual({
      type: "error",
      error: new Error("Ocorreu um erro"),
      value: undefined,
    });
  });
});

describe("Testes para a função updateUserPassword", () => {
  afterEach(() => {
    apiMockUser.reset();
  });

  it("updateUserPassword: erro", async () => {
    const cpf = "11111111111";
    apiMockUser
      .onPost(`/updateUserPassword/${cpf}`, {
        oldPassword: "senha1",
        newPassword: "senha2",
      })
      .reply(400, "Ocorreu um erro");
    const result = await updateUserPassword(
      { oldPassword: "senha1", newPassword: "senha2" },
      cpf
    );

    expect(result).toEqual({
      type: "error",
      error: new Error("Something went wrong"),
      value: undefined,
    });
  });
});

// describe("Testes para a função updateUserPassword", () => {

//   afterEach(() => {
//     apiMockUser.reset();
//   });
// })

describe("Testes para a função forgotPassword", () => {
  afterEach(() => {
    apiMockUser.reset();
  });

  it("forgotPassword: sucesso", async () => {
    apiMockUser
      .onPost("/requestRecovery", { email: "email@email.com" })
      .reply(200, { dados: "" });

    const result = await forgotPassword({ email: "email@email.com" });

    expect(result).toEqual({
      type: "success",
      value: { dados: "" },
    });
  });

  it("forgotPassword: erro", async () => {
    apiMockUser
      .onPost("/requestRecovery", { email: "email@email.com" })
      .reply(400, "Ocorreu um erro");

    const result = await forgotPassword({ email: "email@email.com" });

    expect(result).toEqual({
      type: "error",
      error: new Error("Ocorreu um erro"),
      value: undefined,
    });
  });
});

describe("Testes para a função getAcceptedUsers", () => {
  afterEach(() => {
    apiMockUser.reset();
  });

  it("getAcceptedUsers: sucesso, sem paginação", async () => {
    apiMockUser.onGet("/allUser?accepted=true").reply(200, {
      users: [
        { name: "1", idRole: 1 },
        { name: "2", idRole: 2 },
        { name: "5", idRole: 5 },
      ],
    });

    const result = await getAcceptedUsers();
    expect(result).toEqual({
      type: "success",
      value: [
        { name: "1", idRole: 1 },
        { name: "2", idRole: 2 },
      ],
    });
  });

  it("getAcceptedUsers: sucesso, com paginação sem offset", async () => {
    apiMockUser.onGet("/allUser?accepted=true", { limit: 2 }).reply(200, {
      users: [
        { name: "1", idRole: 1 },
        { name: "2", idRole: 2 },
        { name: "5", idRole: 5 },
      ],
    });

    const result = await getAcceptedUsers();
    expect(result).toEqual({
      type: "success",
      value: [
        { name: "1", idRole: 1 },
        { name: "2", idRole: 2 },
      ],
    });
  });
  it("getAcceptedUsers: sucesso, com paginação e offset", async () => {
    apiMockUser
      .onGet("/allUser?accepted=true", { limit: 1, offset: 1 })
      .reply(200, {
        users: [
          { name: "2", idRole: 2 },
          { name: "5", idRole: 5 },
        ],
      });

    const result = await getAcceptedUsers();
    expect(result).toEqual({
      type: "success",
      value: [{ name: "2", idRole: 2 }],
    });
  });

  it("getAcceptedUsers: erro", async () => {
    apiMockUser
      .onGet("/allUser?accepted=true", { limit: 1, offset: 1 })
      .reply(400, "Ocorreu um erro");

    const result = await getAcceptedUsers();
    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Ocorreu um erro"),
    });
  });
});
