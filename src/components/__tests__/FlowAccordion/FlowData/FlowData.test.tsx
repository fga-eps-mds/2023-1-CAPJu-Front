import "@testing-library/jest-dom";
import ResizeObserver from "resize-observer-polyfill";
import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { mockedFlows } from "utils/mocks";
import * as router from "react-router";
import { QueryClient, QueryClientProvider } from "react-query";
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

const queryClient = new QueryClient();

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
        <QueryClientProvider client={queryClient}>
          <FlowData data={filteredFlows[0]} />
        </QueryClientProvider>
      );
    });
  });

  it("should renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });
});
