import { describe, expect } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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
  mockedNotStartedProcess,
} from "utils/mocks";
import Processes from "../Processes";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}processes`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedProcesses))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}priorities`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedPriorities))
  ),
  rest.get(
    `${import.meta.env.VITE_FLOWS_SERVICE_URL}flows`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedFlows))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
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
    expect(await screen.findByText("Registro")).not.toBe(null);
    expect(await screen.findByText("Apelido")).not.toBe(null);
    expect(await screen.findByText("Situação atual")).not.toBe(null);
    expect(await screen.findByText("Fluxo")).not.toBe(null);
    expect(await screen.findByText("Status")).not.toBe(null);
    expect(await screen.findByText("Ações")).not.toBe(null);
  });

  it("shows process text content correctly", async () => {
    expect(await screen.findByText("12345678912345678915")).not.toBe(null);
    expect(await screen.findByText("Processo não Iniciado")).not.toBe(null);
    expect(await screen.findByText("Não iniciado")).not.toBe(null);
    expect(await screen.findByText("12345678912345678916")).not.toBe(null);
    expect(await screen.findByText("Processo Arquivado")).not.toBe(null);
    expect(await screen.findByText("Arquivado")).not.toBe(null);
    expect(await screen.findByText("12345678912345678917")).not.toBe(null);
    expect(await screen.findByText("Processo em Andamento")).not.toBe(null);
    expect(await screen.findByText("Em andamento")).not.toBe(null);
    expect(await screen.findByText("12345678912345678918")).not.toBe(null);
    expect(await screen.findByText("Processo Finalizado")).not.toBe(null);
    expect(await screen.findByText("Finalizado")).not.toBe(null);
  });

  it("shows 'create process' correctly", async () => {
    const button = screen.getByText("Criar Processo");

    expect(button).not.toBe(null);
  });

  it("shows 'legal priority' correctly", async () => {
    const button = screen.getByText(
      "Mostrar apenas processos com prioridade legal"
    );

    if (button) {
      expect(button).not.toBe(null);
    }
  });

  it("toggles 'archived/finished processes' checkbox correctly", async () => {
    const button = screen.getByText(
      "Mostrar apenas processos arquivados/finalizados"
    );

    expect(button).not.toBe(null);

    expect(await screen.queryByText(mockedNotStartedProcess.record)).not.toBe(
      null
    );

    await act(async () => {
      await fireEvent.click(button);
    });

    expect(await screen.queryByText(mockedNotStartedProcess.record)).toBe(null);
  });

  it("displays the 'search bar' correctly", async () => {
    const input = screen.getByPlaceholderText(
      "Pesquisar processos (por registro ou apelido)"
    );

    expect(input).not.toBe(null);
  });

  it("opens and closes the creation modal correctly", async () => {
    const createProcessButton = await screen.getByText("Criar Processo");

    await act(async () => {
      await fireEvent.click(createProcessButton);
    });

    expect(await screen.getByPlaceholderText("N do Registro")).not.toBeNull();

    const closeModalButton = await screen.getByText("Cancelar");

    await act(async () => {
      await fireEvent.click(closeModalButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("CreationModal")).toBeNull();
    });
  });
});
