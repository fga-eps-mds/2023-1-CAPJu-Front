import ResizeObserver from "resize-observer-polyfill";
import { act, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { mockedFlows } from "utils/mocks";
import { createColumnHelper } from "@tanstack/react-table";
import * as router from "react-router";
import { FlowAccordion } from "../../FlowAccordion";

const tableColumnHelper = createColumnHelper<TableRow<Flow>>();
const tableColumns = [
  tableColumnHelper.accessor("name", {
    cell: (info) => info.getValue(),
    header: "Nome",
    meta: {
      isSortable: true,
    },
  }),
  tableColumnHelper.accessor("tableActions", {
    cell: (info) => info.getValue(),
    header: "Ações",
    meta: {
      isTableActions: true,
      isSortable: false,
    },
  }),
];

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

describe("FlowAccordion components", async () => {
  const mockedUseNavigate = vi.fn();

  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
  });

  beforeEach(async () => {
    vi.spyOn(router, "useNavigate").mockImplementation(() => mockedUseNavigate);

    await act(async () => {
      render(
        <FlowAccordion
          data={filteredFlows}
          columns={tableColumns}
          isDataFetching={false}
          emptyTableMessage="Não foram encontrados fluxos."
        />
      );
    });
  });

  it("should renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });
});
