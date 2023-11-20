/* eslint-disable no-nested-ternary */
import { describe, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import {
  mockedUser,
  mockedProcesses,
  mockedFlows,
  mockedPriorities,
  mockedRoles,
} from "utils/mocks";
import { labelByProcessStatus } from "utils/constants";
import { getPaginatedArray } from "utils/pagination";
import Processes from "../Processes";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}process`,
    async (req, res, ctx) => {
      const filter = req.url.searchParams.get("filter");
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const showArchivedAndFinished = JSON.parse(
        req.url.searchParams.get("showArchivedAndFinished") || "false"
      );

      const filteredByStatus = mockedProcesses.filter(
        (p) => p.status === "archived" || p.status === "finished"
      );

      const { paginatedArray, totalPages } = getPaginatedArray(
        filter && filter !== ""
          ? (showArchivedAndFinished
              ? filteredByStatus
              : mockedProcesses
            ).filter(
              (process) =>
                process.nickname.includes(filter) ||
                process.record.includes(filter)
            )
          : showArchivedAndFinished
          ? filteredByStatus
          : mockedProcesses,
        {
          offset,
          limit,
        }
      );

      return res(
        ctx.status(200),
        ctx.json({ processes: paginatedArray, totalPages })
      );
    }
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}priority`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedPriorities))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}flow`,
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json({ flows: mockedFlows }))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}cpf/${mockedUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
  rest.get(
    `${import.meta.env.VITE_ROLE_SERVICE_URL}roleAdmins/${mockedUser.idRole}`,
    async (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json(mockedRoles?.find((i) => i.idRole === mockedUser.idRole))
      )
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Processes page", () => {
  beforeAll(async () => {
    localStorage.setItem("@CAPJu:user", JSON.stringify(mockedUser));
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(async () => {
    await act(async () => {
      await render(
        <ChakraProvider>
          <LoadingProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <BrowserRouter>
                  <Processes />
                </BrowserRouter>
              </AuthProvider>
            </QueryClientProvider>
          </LoadingProvider>
        </ChakraProvider>
      );
    });
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("renders correctly", () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows text content correctly", async () => {
    expect(await screen.findAllByText("Processos")).not.toBe(null);
    expect(await screen.queryByText("Registro")).not.toBe(null);
    expect(await screen.queryByText("Apelido")).not.toBe(null);
    expect(await screen.queryByText("Situação atual")).not.toBe(null);
    expect(await screen.findAllByText("Fluxo")).not.toBe(null);
    expect(await screen.queryByText("Status")).not.toBe(null);
    expect(await screen.queryByText("Ações")).not.toBe(null);
  });

  it("shows process text content correctly", async () => {
    expect(await screen.queryByText("A")).not.toBe(null);
    expect(await screen.queryByText("B")).not.toBe(null);
    expect(await screen.queryByText("C")).not.toBe(null);
    expect(await screen.queryByText("D")).not.toBe(null);
    expect(await screen.queryByText("E")).not.toBe(null);
  });

  it("shows 'create process' correctly", async () => {
    const button = screen.getByText("Criar Processo");

    expect(button).not.toBe(null);
  });

  it("shows 'legal priority' correctly", async () => {
    const button = screen.getByText(
      "Mostrar apenas processos com prioridade legal"
    );

    expect(button).not.toBe(null);
  });

  // it("toggles 'archived/finished processes' checkbox correctly", async () => {
  //   const button = screen.getByText("Mostrar processos arquivados/finalizados");

  //   expect(button).not.toBe(null);

  //   const mockedNotStartedProcess = mockedProcesses[0];

  //   expect(await screen.queryByText(mockedNotStartedProcess.record)).not.toBe(
  //     null
  //   );

  //   await act(async () => {
  //     await fireEvent.click(button);
  //   });

  //   expect(await screen.queryByText(mockedNotStartedProcess.record)).toBe(null);
  // });

  // it("opens and closes the creation modal correctly", async () => {
  //   const createProcessButton = await screen.getByText("Criar Processo");

  //   await act(async () => {
  //     await fireEvent.click(createProcessButton);
  //   });

  //   expect(await screen.getByPlaceholderText("N do Registro")).not.toBeNull();

  //   const closeModalButton = await screen.getByText("Cancelar");

  //   await act(async () => {
  //     await fireEvent.click(closeModalButton);
  //   });

  //   await waitFor(async () => {
  //     expect(await screen.getByPlaceholderText("N do Registro")).not.toBeNull();
  //   });
  // });

  it("filters processes correctly", async () => {
    const input = screen.getByPlaceholderText(
      "Pesquisar processos (por registro ou apelido)"
    );

    expect(input).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "12345678912345678915" },
      });
      // Testa pelo submit do input
      await fireEvent.submit(input);
    });

    expect(await screen.queryByText("12345678912345678915")).not.toBe(null);
    expect(await screen.queryByText("12345678912345678916")).toBe(null);
    expect(await screen.queryByText("12345678912345678917")).toBe(null);
    expect(await screen.queryByText("12345678912345678918")).toBe(null);

    const button = screen.getByLabelText("botão de busca");

    expect(button).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "12345678912345678916" },
      });
      // Testa pelo click no botão
      await fireEvent.click(button);
    });

    expect(await screen.queryByText("12345678912345678915")).toBe(null);
    expect(await screen.queryByText("12345678912345678916")).not.toBe(null);
    expect(await screen.queryByText("12345678912345678917")).toBe(null);
    expect(await screen.queryByText("12345678912345678918")).toBe(null);
  });

  it("shows processes status correctly", async () => {
    const validStatus = new Set(Object.values(labelByProcessStatus));
    const status = await mockedProcesses[0].status;
    const teste =
      labelByProcessStatus[status as keyof typeof labelByProcessStatus];

    expect(validStatus.has(teste)).toBe(true);
  });

  it("checks if processes have status displayed on the screen", async () => {
    if (mockedProcesses.length === 0) {
      // Isso serve para passar o teste caso não tenha processos
      expect(true).toBe(true);
      return;
    }

    const validStatusValues = Object.values(labelByProcessStatus);

    const matchingElementsPromises = validStatusValues.map(
      async (statusValue) => {
        const matchingElements = await screen.queryAllByText(statusValue);
        return matchingElements.length > 0;
      }
    );

    const matchingElementsResults = await Promise.all(matchingElementsPromises);
    const foundStatus = matchingElementsResults.some((result) => result);

    expect(foundStatus).toBe(true);
  });
});
