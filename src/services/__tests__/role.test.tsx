import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import { getRoleById } from "../role";

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
});
