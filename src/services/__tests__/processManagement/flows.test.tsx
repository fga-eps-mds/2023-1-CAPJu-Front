import MockAdapter from "axios-mock-adapter";
import { getFlows } from "services/processManagement/flows";
import { api } from "../../api";

const apiMockProcessManagement = new MockAdapter(api.processManagement);

describe("Testes para a função getFlows", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("sucesso get /flows", async () => {
    const params = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: "",
    };

    apiMockProcessManagement
      .onGet("/flow")
      .reply(200, { flows: [], totalPages: 0 });

    const result = await getFlows(params.pagination, params.filter);
    const result2 = await getFlows();

    expect(result).toEqual({ type: "success", value: [], totalPages: 0 });
    expect(result2).toEqual({ type: "success", value: [], totalPages: 0 });
  });

  it("error get /flows", async () => {
    const params = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: "",
    };

    apiMockProcessManagement.onGet("/flow").reply(400, {});

    const result = await getFlows(params.pagination, params.filter);

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});
