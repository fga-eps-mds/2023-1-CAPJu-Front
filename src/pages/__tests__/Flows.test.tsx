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
import { mockedUser, mockedFlows } from "utils/mocks";
import Flows from "../Flows";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_FLOWS_SERVICE_URL}flows`,
    async (req, res, ctx) => {
      const filter = req.url.searchParams.get("filter");

      if (filter && filter !== "") {
        return res(
          ctx.status(200),
          ctx.json(mockedFlows.filter((flows) => flows.name.includes(filter)))
        );
      }

      return res(ctx.status(200), ctx.json(mockedFlows));
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

  it("filters flows correctly", async () => {
    const input = screen.getByPlaceholderText("Pesquisar fluxos");

    expect(input).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "FirstFlow" },
      });
      await fireEvent.submit(input);
    });

    expect(await screen.queryByText("FirstFlow")).not.toBe(null);
    expect(await screen.queryByText("SecondFlow")).toBe(null);
    expect(await screen.queryByText("ThirdFlow")).toBe(null);

    const button = screen.getByLabelText("botão de busca");

    expect(button).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "ThirdFlow" },
      });
      await fireEvent.click(button);
    });

    expect(await screen.queryByText("FirstFlow")).toBe(null);
    expect(await screen.queryByText("SecondFlow")).toBe(null);
    expect(await screen.queryByText("ThirdFlow")).not.toBe(null);
  });
});
