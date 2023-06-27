import { describe, expect } from "vitest";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";

import { mockedManagerUser, mockedStages } from "utils/mocks";
import Stages from "../Stages";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_STAGES_SERVICE_URL}stages`,
    async (req, res, ctx) => {
      const filter = req.url.searchParams.get("filter");

      if (filter && filter !== "") {
        return res(
          ctx.status(200),
          ctx.json(
            mockedStages.filter((stages) => stages.name.includes(filter))
          )
        );
      }

      return res(ctx.status(200), ctx.json(mockedStages));
    }
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedManagerUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedManagerUser))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Stages page", () => {
  beforeAll(async () => {
    localStorage.setItem("@CAPJu:user", JSON.stringify(mockedManagerUser));
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
                  <Stages />
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
    expect(screen.getAllByText("Etapas")).not.toBe(null);
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

  it("opens and closes the creation modal correctly", async () => {
    const createStageButton = await screen.getByText("Criar Etapa");

    await act(async () => {
      await fireEvent.click(createStageButton);
    });

    expect(await screen.getByText("Nome")).not.toBe(null);
    expect(await screen.getByPlaceholderText("Nome da etapa")).not.toBeNull();

    expect(await screen.getAllByText("Duração (em dias)")).not.toBe(null);
    expect(
      await screen.getByPlaceholderText("Duração da etapa")
    ).not.toBeNull();

    const closeModalButton = await screen.getByText("Cancelar");

    await act(async () => {
      await fireEvent.click(closeModalButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("CreationModal")).toBeNull();
    });
  });

  it("filters stages correctly", async () => {
    const input = screen.getByPlaceholderText("Pesquisar etapas");

    expect(input).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "etapaA" },
      });
      await fireEvent.submit(input);
    });

    expect(await screen.queryByText("etapaA")).not.toBe(null);
    expect(await screen.queryByText("etapaB")).toBe(null);
    expect(await screen.queryByText("etapaC")).toBe(null);

    const button = screen.getByLabelText("botão de busca");

    expect(button).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "etapaC" },
      });
      await fireEvent.click(button);
    });

    expect(await screen.queryByText("etapaA")).toBe(null);
    expect(await screen.queryByText("etapaB")).toBe(null);
    expect(await screen.queryByText("etapaC")).not.toBe(null);
  });
});
