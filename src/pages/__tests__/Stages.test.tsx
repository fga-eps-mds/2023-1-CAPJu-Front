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
import { mockedManagerUser, mockedRoles, mockedStages } from "utils/mocks";
import { getPaginatedArray } from "utils/pagination";
import Stages from "../Stages";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_STAGES_SERVICE_URL}stages`,
    async (req, res, ctx) => {
      const filter = req.url.searchParams.get("filter");
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(
        filter && filter !== ""
          ? mockedStages.filter((stages) => stages.name.includes(filter))
          : mockedStages,
        {
          offset,
          limit,
        }
      );
      return res(
        ctx.status(200),
        ctx.json({ stages: paginatedArray, totalPages })
      );
    }
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedManagerUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedManagerUser))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}roleAdmins/${
      mockedManagerUser.idRole
    }`,
    async (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json(
          mockedRoles?.find((i) => i.idRole === mockedManagerUser.idRole)
        )
      )
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

  it("shows text content correctly", async () => {
    expect(await screen.queryAllByText("Etapas")).not.toBe(null);
    expect(await screen.queryAllByText("Criar Etapa")).not.toBe(null);
    expect(await screen.queryAllByText("Duração (em dias)")).not.toBe(null);
    expect(await screen.queryAllByText("Etapa")).not.toBe(null);
    expect(await screen.queryAllByText("Ações")).not.toBe(null);

    expect(await screen.queryByText("a")).not.toBe(null);
    expect(await screen.queryByText("b")).not.toBe(null);
    expect(await screen.queryByText("c")).not.toBe(null);
    expect(await screen.queryByText("d")).not.toBe(null);
    expect(await screen.queryByText("e")).not.toBe(null);
    expect(await screen.queryByText("f")).toBe(null);
    expect(await screen.queryByText("g")).toBe(null);
    expect(await screen.queryByText("h")).toBe(null);
    expect(await screen.queryByText("i")).toBe(null);
    expect(await screen.queryByText("j")).toBe(null);
  });

  it("open and closes the edition modal correctly", async () => {
    const editStageButton = screen.getAllByLabelText("Editar Etapa");

    await act(async () => {
      await fireEvent.click(editStageButton[0]);
    });

    expect(await screen.findAllByText("Editar etapa")).not.toBeNull();

    const closeModalButton = await screen.getByText("Cancelar");

    await act(async () => {
      await fireEvent.click(closeModalButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Editar etapa")).toBeNull();
    });
  });

  it("filters stages correctly", async () => {
    const searchStagesButton = screen.getByPlaceholderText("Pesquisar etapas");

    expect(searchStagesButton).not.toBe(null);

    await act(async () => {
      await fireEvent.change(searchStagesButton, {
        target: { value: "a" },
      });
      await fireEvent.submit(searchStagesButton);
    });

    expect(await screen.queryByText("a")).not.toBe(null);
    expect(await screen.queryByText("b")).toBe(null);
    expect(await screen.queryByText("c")).toBe(null);

    const searchBarButton = screen.getByLabelText("botão de busca");

    expect(searchBarButton).not.toBe(null);

    await act(async () => {
      await fireEvent.change(searchStagesButton, {
        target: { value: "c" },
      });
      await fireEvent.click(searchBarButton);
    });

    expect(await screen.queryByText("a")).toBe(null);
    expect(await screen.queryByText("b")).toBe(null);
    expect(await screen.queryByText("c")).not.toBe(null);
  });
});
