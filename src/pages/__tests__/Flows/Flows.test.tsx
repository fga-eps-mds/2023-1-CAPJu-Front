import { describe, expect } from "vitest";
import { act, render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import ResizeObserver from "resize-observer-polyfill";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser, mockedFlows, mockedRoles } from "utils/mocks";
import { getPaginatedArray } from "utils/pagination";
import Flows from "../../Flows";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}flow`,
    async (req, res, ctx) => {
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const filter = req.url.searchParams.get("filter");
      const { paginatedArray, totalPages } = getPaginatedArray(
        filter && filter !== ""
          ? mockedFlows.filter((flows) => flows.name.includes(filter))
          : mockedFlows,
        {
          offset,
          limit,
        }
      );

      return res(
        ctx.status(200),
        ctx.json({ flows: paginatedArray, totalPages })
      );
    }
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

  it("filters flows correctly", async () => {
    const input = screen.getByPlaceholderText("Pesquisar fluxos");

    expect(input).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "Fluxo 1" },
      });
      await fireEvent.submit(input);
    });

    expect(screen.queryByText("Fluxo 1")).not.toBe(null);

    const button = screen.getByLabelText("botão de busca");

    expect(button).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "Fluxo 2" },
      });
      await fireEvent.click(button);
    });

    expect(await screen.queryByText("Fluxo 2")).not.toBe(null);
  });

  it("shows paginated content correctly", async () => {
    expect(await screen.queryByText("Fluxo 1")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 2")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 3")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 4")).not.toBe(null);
    expect(await screen.queryByText("Fluxo 5")).not.toBe(null);
  });
});
