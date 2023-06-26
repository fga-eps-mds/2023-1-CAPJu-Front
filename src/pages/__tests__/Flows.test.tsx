import { describe, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import ResizeObserver from "resize-observer-polyfill";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser, mockedFlows } from "utils/mocks";
import { getPaginatedArray } from "utils/pagination";
import Flows from "../Flows";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_FLOWS_SERVICE_URL}flows`,
    async (req, res, ctx) => {
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(mockedFlows, {
        offset,
        limit,
      });

      return res(
        ctx.status(200),
        ctx.json({ flows: paginatedArray, totalPages })
      );
    }
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Flows page", () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
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
                  <Flows />
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
  it("shows pagination content correctly", async () => {
    expect(await screen.queryByText("Fluxo 1")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 2")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 3")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 4")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 5")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 6")).toBe(null);
    expect(await screen.queryByText("Fluxo 7")).toBe(null);
    expect(await screen.queryByText("Fluxo 8")).toBe(null);
    expect(await screen.queryByText("Fluxo 9")).toBe(null);
    expect(await screen.queryByText("Fluxo 10")).toBe(null);
  });
});
