import "@testing-library/jest-dom";
import ResizeObserver from "resize-observer-polyfill";
import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { mockedFlows, mockedPriorityProcess, mockedProcess } from "utils/mocks";
import * as router from "react-router";
import * as query from "react-query";
import * as processService from "services/processManagement/processes";
import FlowData from "../../../FlowAccordion/FlowData";

const tableActions = [
  {
    label: "Visualizar Processos do Fluxo",
    icon: null,
    isNavigate: true,
    actionName: "see-flow",
    disabled: false,
  },
  {
    label: "Editar Fluxo",
    icon: null,
    action: vi.fn(),
    actionName: "edit-flow",
    disabled: false,
  },
  {
    label: "Excluir Fluxo",
    actionName: "delete-flow",
    icon: null,
    action: vi.fn(),
    disabled: false,
  },
];

const filteredFlows =
  (mockedFlows.reduce(
    (acc: TableRow<Flow>[] | Flow[], curr: TableRow<Flow> | Flow) => [
      ...acc,
      {
        ...curr,
        tableActions,
        actionsProps: {
          flow: curr,
          state: { flow: curr },
          pathname: `/processos`,
        },
      },
    ],
    []
  ) as TableRow<Flow>[]) || [];

const queryClient = new query.QueryClient();

describe("FlowData component", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
  });

  beforeEach(async () => {
    const mockUseLocation = {
      key: "useLocation",
      pathname: "/testroute",
      search: "",
      hash: "",
      state: null,
    };
    const mockUseNavigate = vi.fn();

    vi.spyOn(router, "useLocation").mockImplementation(() => mockUseLocation);
    vi.spyOn(router, "useNavigate").mockImplementation(() => mockUseNavigate);

    await act(async () => {
      render(
        <query.QueryClientProvider client={queryClient}>
          <FlowData data={filteredFlows[0]} />
        </query.QueryClientProvider>
      );
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  it("should renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });

  it("should show process", async () => {
    vi.spyOn(processService, "getProcesses").mockImplementation(async () => {
      return {
        type: "success",
        value: [mockedProcess],
        totalPages: 1,
        totalProcesses: 1,
        totalArchived: 0,
        totalFinished: 0,
      } as ResultSuccess<Process[]>;
    });

    expect(screen.findByText(`${mockedProcess.record}`)).toBeDefined();
  });

  it("process should have a priority", async () => {
    vi.clearAllMocks();
    vi.resetAllMocks();

    const mockUseLocation = {
      key: "useLocation",
      pathname: "/testroute",
      search: "",
      hash: "",
      state: null,
    };
    const mockUseNavigate = vi.fn();
    const mockResultQueryProcesses = {
      data: {
        value: [mockedPriorityProcess],
      },
      isFetched: true,
      refetch: vi.fn(),
    };

    const mockResultQueryGetUserData = {
      isFetched: true,
    };

    vi.spyOn(router, "useLocation").mockImplementation(() => mockUseLocation);
    vi.spyOn(router, "useNavigate").mockImplementation(() => mockUseNavigate);
    vi.spyOn(query, "useQuery").mockImplementation(
      // @ts-ignore
      (data: any) => {
        console.log(data);
        if (data.queryKey[0] === "user-data") return mockResultQueryGetUserData;
        return mockResultQueryProcesses;
      }
    );

    await act(async () => {
      render(
        <query.QueryClientProvider client={queryClient}>
          <FlowData data={filteredFlows[0]} />
        </query.QueryClientProvider>
      );
    });

    expect(screen.findByText("Prioridade legal")).toBeDefined();
  });
});
