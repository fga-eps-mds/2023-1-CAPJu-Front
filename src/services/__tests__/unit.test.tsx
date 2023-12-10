import MockAdapter from "axios-mock-adapter";
import { getUnits } from "services/unit";
import { api } from "../api";

const apiMockUnit = new MockAdapter(api.unit);

describe("Testes para a função getUnits", () => {
  afterEach(() => {
    apiMockUnit.reset();
  });

  it("sucesso get /", async () => {
    const params = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: {
        type: "",
        value: "",
      },
    };

    apiMockUnit.onGet("/").reply(200, { units: [], totalPages: 0 });

    const result = await getUnits(params.pagination, params.filter);
    const result2 = await getUnits();

    expect(result).toEqual({ type: "success", value: [], totalPages: 0 });
    expect(result2).toEqual({ type: "success", value: [], totalPages: 0 });
  });

  it("error get /", async () => {
    const params = {
      pagination: {
        offset: 0,
        limit: 10,
      },
      filter: {
        type: "",
        value: "",
      },
    };

    apiMockUnit.onGet("/").reply(400, {});

    const result = await getUnits(params.pagination, params.filter);

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});
