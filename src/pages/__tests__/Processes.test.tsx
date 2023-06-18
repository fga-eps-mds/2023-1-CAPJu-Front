import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react-dom/test-utils";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedProcesses } from "utils/mocks";
import Processes from "../Processes";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}processes`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedProcesses))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Processes page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await act(async () => {
      render(
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

  it("shows text content correctly", () => {
    expect(screen.findAllByText("Processos")).not.toBe(null);
    expect(screen.getByText("Registro")).not.toBe(null);
    expect(screen.getByText("Apelido")).not.toBe(null);
    expect(screen.getByText("Situação atual")).not.toBe(null);
    expect(screen.getByText("Fluxo")).not.toBe(null);
    expect(screen.getByText("Status")).not.toBe(null);
    expect(screen.getByText("Ações")).not.toBe(null);
    expect(screen.getByText("12345678901234567881")).not.toBe(null);
    expect(screen.getByText("teste")).not.toBe(null);
    expect(screen.getByText("Não iniciado")).not.toBe(null);
  });

  it("shows 'create process' correctly", async () => {
    const button = screen.getByText("Criar Processo");

    if (button) {
      expect(button).not.toBe(null);
    }
  });

  it("shows 'legal priority' correctly", async () => {
    const button = screen.getByText("Mostrar processos com prioridade legal");

    if (button) {
      expect(button).not.toBe(null);
    }
  });

  it("shows 'search bar' correctly", async () => {
    const button = screen.getByPlaceholderText(
      "Pesquisar processos (por registro ou apelido)"
    );

    if (button) {
      expect(button).not.toBe(null);
    }
  });
});
