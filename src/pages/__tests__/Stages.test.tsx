import { describe, expect } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";

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
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}stage`,
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
    `${import.meta.env.VITE_USER_SERVICE_URL}cpf/${mockedManagerUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedManagerUser))
  ),
  rest.get(
    `${import.meta.env.VITE_ROLE_SERVICE_URL}roleAdmins/${
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
    expect(screen.queryAllByText("Etapas")).not.toBe(null);
    expect(screen.queryAllByText("Criar Etapa")).not.toBe(null);
    expect(screen.queryAllByText("Duração (em dias)")).not.toBe(null);
    expect(screen.queryAllByText("Etapa")).not.toBe(null);
    expect(screen.queryAllByText("Ações")).not.toBe(null);

    expect(screen.queryByText("a")).not.toBe(null);
    expect(screen.queryByText("b")).not.toBe(null);
    expect(screen.queryByText("c")).not.toBe(null);
    expect(screen.queryByText("d")).not.toBe(null);
    expect(screen.queryByText("e")).not.toBe(null);
    expect(screen.queryByText("f")).toBe(null);
    expect(screen.queryByText("g")).toBe(null);
    expect(screen.queryByText("h")).toBe(null);
    expect(screen.queryByText("i")).toBe(null);
    expect(screen.queryByText("j")).toBe(null);
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

    const queriesByText = screen.queryByText("a");

    expect(queriesByText).not.toBe(null);

    const searchBarButton = screen.getByLabelText("botão de busca");

    expect(searchBarButton).not.toBe(null);

    await act(async () => {
      await fireEvent.change(searchStagesButton, {
        target: { value: "c" },
      });
      await fireEvent.click(searchBarButton);
    });

    expect(await screen.queryByText("c")).not.toBe(null);
  });
});
