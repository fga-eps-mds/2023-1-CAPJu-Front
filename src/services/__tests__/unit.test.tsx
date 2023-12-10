import MockAdapter from "axios-mock-adapter";
import { createUnit, getUnits, updateUnit } from "services/unit";
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

describe("Testes para a função createUnit", () => {
  afterEach(() => {
    apiMockUnit.reset();
  });

  it("sucesso post /newUnit", async () => {
    apiMockUnit.onPost("/newUnit").reply(200, {
      idUnit: 1,
      name: "Unidade",
    });

    const result = await createUnit({ name: "Unidade" });

    expect(result).toEqual({
      type: "success",
      value: {
        idUnit: 1,
        name: "Unidade",
      },
    });
  });

  it("error post /newUnit", async () => {
    apiMockUnit.onPost("/newUnit").reply(400, {});

    const result = await createUnit({ name: "Unidade" });

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});

describe("Testes para a função updateUnit", () => {
  afterEach(() => {
    apiMockUnit.reset();
  });

  it("sucesso put /updateUnit", async () => {
    apiMockUnit.onPut("/updateUnit").reply(200, {
      name: "Unidade",
      idUnit: 1,
    });

    const result = await updateUnit({
      name: "Unidade",
      idUnit: 1,
    });

    expect(result).toEqual({
      type: "success",
      value: {
        name: "Unidade",
        idUnit: 1,
      },
    });
  });

  it("error put /updateUnit", async () => {
    apiMockUnit.onPut("/updateUnit").reply(400, {});

    const result = await updateUnit({
      name: "Unidade",
      idUnit: 1,
    });

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});
