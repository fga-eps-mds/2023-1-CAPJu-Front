import MockAdapter from "axios-mock-adapter";
import {
  getFlows,
  getFlowById,
  createFlow,
  getHistoricFlow,
  getExpectedFlow,
  updateFlow,
} from "services/processManagement/flows";
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

describe("Testes para a função getFlowById", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("sucesso get /flow/:id", async () => {
    apiMockProcessManagement.onGet("/flow/1").reply(200, {
      idProcess: 1,
    });

    const result = await getFlowById(1);

    expect(result).toEqual({
      type: "success",
      value: {
        idProcess: 1,
      },
    });
  });

  it("error get /flow/:id", async () => {
    apiMockProcessManagement.onGet("/flow/1").reply(400, {});

    const result = await getFlowById(1);

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});

describe("Testes para a função createFlow", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("sucesso post /flow/newFlow", async () => {
    apiMockProcessManagement.onPost("/flow/newFlow/").reply(200, {
      name: "fluxo 01",
      sequences: [],
      idUsersToNotify: [],
      idUnit: 1,
    });

    const result = await createFlow({
      name: "fluxo 01",
      sequences: [],
      idUsersToNotify: [],
      idUnit: 1,
    });

    expect(result).toEqual({
      type: "success",
      value: {
        name: "fluxo 01",
        sequences: [],
        idUsersToNotify: [],
        idUnit: 1,
      },
    });
  });

  it("error post /flow/newFlow", async () => {
    apiMockProcessManagement.onPost("/flow/newFlow/").reply(400, {});

    const result = await createFlow({
      name: "fluxo 01",
      sequences: [],
      idUsersToNotify: [],
      idUnit: 1,
    });

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});

describe("Testes para a função getHistoricFlow", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("sucesso get /flow/historicFlow/1", async () => {
    apiMockProcessManagement.onGet("/flow/historicFlow/1").reply(200, {
      name: "fluxo 01",
      idFlow: 1,
    });

    const result = await getHistoricFlow(1);

    expect(result).toEqual({
      type: "success",
      value: {
        name: "fluxo 01",
        idFlow: 1,
      },
    });
  });

  it("error get /flow/historicFlow/1", async () => {
    apiMockProcessManagement.onGet("/flow/historicFlow/1").reply(400, {});

    const result = await getHistoricFlow(1);

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});

describe("Testes para a função getExpectedFlow", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("sucesso get /flowStage/1", async () => {
    apiMockProcessManagement.onGet("/flowStage/1").reply(200, {
      name: "fluxo 01",
      idFlow: 1,
    });

    const result = await getExpectedFlow(1);

    expect(result).toEqual({
      type: "success",
      value: {
        name: "fluxo 01",
        idFlow: 1,
      },
    });
  });

  it("error get /flowStage/1", async () => {
    apiMockProcessManagement.onGet("/flowStage/1").reply(400, {});

    const result = await getExpectedFlow(1);

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});

describe("Testes para a função updateFlow", () => {
  afterEach(() => {
    apiMockProcessManagement.reset();
  });

  it("sucesso put /flow", async () => {
    apiMockProcessManagement.onPut("/flow/").reply(200, {
      name: "fluxo 01",
      sequences: [],
      idUsersToNotify: [],
      idFlow: 1,
    });

    const result = await updateFlow({
      name: "fluxo 01",
      sequences: [],
      idUsersToNotify: [],
      idFlow: 1,
    });

    expect(result).toEqual({
      type: "success",
      value: {
        name: "fluxo 01",
        sequences: [],
        idUsersToNotify: [],
        idFlow: 1,
      },
    });
  });

  it("error put /flow", async () => {
    apiMockProcessManagement.onPut("/flow/").reply(400, {});

    const result = await updateFlow({
      name: "fluxo 01",
      sequences: [],
      idUsersToNotify: [],
      idFlow: 1,
    });

    expect(result).toEqual({
      type: "error",
      value: undefined,
      error: new Error("Something went wrong"),
    });
  });
});
