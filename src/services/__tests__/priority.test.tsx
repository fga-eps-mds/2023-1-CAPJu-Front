import { getPriorities } from "services/processManagement/priority";
import MockAdapter from "axios-mock-adapter";
import { api } from "../api";

const apiMockProcessManagement = new MockAdapter(api.processManagement);

describe("Teste para a função getPriorities", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("Sucesso getPriorities when id is provided", async () => {
    const prioritiesData = [
      { idPriority: 1, name: "High" },
      { idPriority: 2, name: "Medium" },
    ];

    const targetId = 2;
    const expectedPriority = prioritiesData.find(
      (priority) => priority.idPriority === targetId
    );

    apiMockProcessManagement.onGet("/priority").reply(200, prioritiesData);

    const result = await getPriorities(targetId);

    expect(result).toEqual({
      type: "success",
      value: expectedPriority,
    });
  });

  it("Sucesso getPriorities when id is not provided", async () => {
    const prioritiesData = [
      { idPriority: 1, name: "High" },
      { idPriority: 2, name: "Medium" },
    ];

    apiMockProcessManagement.onGet("/priority").reply(200, prioritiesData);

    const result = await getPriorities();

    expect(result).toEqual({
      type: "success",
      value: prioritiesData,
    });
  });

  it("Erro getPriorities", async () => {
    apiMockProcessManagement.onGet("/priority").reply(500);

    const result = await getPriorities();

    expect(result.type).toBe("error");
    expect(result.value).toBeUndefined();
  });
});
