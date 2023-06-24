import { describe, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser, mockedStages } from "utils/mocks";
import Stages from "../Stages";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_STAGES_SERVICE_URL}stages`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedStages))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Stages page", () => {
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
                <MemoryRouter>
                  <Stages />
                </MemoryRouter>
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
    expect(screen.findAllByText("Etapas")).not.toBe(null);
    expect(screen.getByText("Duração (em dias)")).not.toBe(null);
    expect(screen.getByText("Ações")).not.toBe(null);
    expect(screen.getByText("etapaA")).not.toBe(null);
    expect(screen.getByText("2")).not.toBe(null);
    expect(screen.getByText("etapaB")).not.toBe(null);
    expect(screen.getByText("3")).not.toBe(null);
    expect(screen.getByText("etapaC")).not.toBe(null);
    expect(screen.getByText("5")).not.toBe(null);
  });

  it("shows 'create stage' correctly", async () => {
    const button = screen.getByText("Criar Etapa");

    if (button) {
      expect(button).not.toBe(null);
    }
  });

  it("shows 'search bar' correctly", async () => {
    const button = screen.getByPlaceholderText("Pesquisar etapas");

    if (button) {
      expect(button).not.toBe(null);
    }
  });

  /* 
  it("opens and closes the creation modal correctly", async () => {
        const createStageButton = await screen.getByText("Criar Etapa");
    
        await act(async () => {
          await fireEvent.click(createStageButton);
        });
    
        expect(await screen.findAllByText("Criar etapa")).not.toBeNull();
    
        const closeModalButton = await screen.getByText("Cancelar");
    
        await act(async () => {
          await fireEvent.click(closeModalButton);
        });
    
        await waitFor(() => {
          expect(screen.queryByText("Criar etapa")).toBeNull();
        });
      }); 
      */
});
