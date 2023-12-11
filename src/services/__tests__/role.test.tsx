import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import { getRoleById, getAllRoles } from "../role";

const apiMockRole = new MockAdapter(api.role);

describe("Teste para a função getRoleById", () => {
  afterEach(() => {
    apiMockRole.reset();
  });

  it("Sucesso getRoleById", async () => {
    const roleData = { id: 1, name: "Admin" };
    apiMockRole.onGet("/roleAdmins/1").reply(200, roleData);

    const result = await getRoleById(1);

    expect(result).toEqual({
      type: "success",
      value: roleData,
    });
  });

  it("Erro getRoleById", async () => {
    apiMockRole.onGet("/roleAdmins/2").reply(500);

    const result = await getRoleById(2);

    expect(result.type).toBe("error");
    expect(result.value).toBeUndefined();
  });
});

describe("getAllRoles", () => {
  it("Deve retornar todos os cargos", async () => {
    const mockRolesData = [
      { id: 3, name: "Diretor" },
      { id: 1, name: "Estagiário" },
      { id: 4, name: "Juiz" },
      { id: 5, name: "Administrador" },
      { id: 2, name: "Servidor" },
    ];

    const orderedMockRolesData = [
      { id: 1, name: "Estagiário" },
      { id: 2, name: "Servidor" },
      { id: 3, name: "Diretor" },
      { id: 4, name: "Juiz" },
      { id: 5, name: "Administrador" },
    ];

    apiMockRole.onGet("/").reply(200, mockRolesData);

    const result = await getAllRoles();

    expect(result).toEqual({
      type: "success",
      value: orderedMockRolesData,
    });
  });

  it("Erro getAllRoles", async () => {
    apiMockRole.onGet("/").reply(500);

    const result = await getAllRoles();

    expect(result.type).toBe("error");
    expect(result.value).toBeUndefined();
  });
});
