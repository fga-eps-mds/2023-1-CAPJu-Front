import { describe, expect } from "vitest";
import {
  act,
  render,
  screen,
} from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedManagerUser, mockedStages } from "utils/mocks";
import { getPaginatedArray } from "utils/pagination";
import Stages from "../Stages";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_STAGES_SERVICE_URL}stages`,
    async (req, res, ctx) => {
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(mockedStages, {
        offset,
        limit,
      });
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
});
