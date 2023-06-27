import { describe, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react-dom/test-utils";

import ResizeObserver from "resize-observer-polyfill";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser, mockedFlows } from "utils/mocks";
import Flows from "../Flows";

const restHandlers = [
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
  it("shows text content correctly", async () => {
    expect(await screen.findAllByText("Fluxos")).not.toBe(null);
    expect(await screen.findByText("Nome")).not.toBe(null);
    expect(await screen.findByText("Ações")).not.toBe(null);
    expect(await screen.findByText("FirstFlow")).not.toBe(null);
    expect(await screen.findByText("SecondFlow")).not.toBe(null);
    expect(await screen.findByText("ThirdFlow")).not.toBe(null);
  });

  it("shows 'search bar' correctly", async () => {
    expect(screen.getByPlaceholderText("Pesquisar fluxos")).not.toBe(null);
  });

  it("shows 'create flow' correctly", async () => {
    const button = screen.getByText("Criar Fluxo");

    if (button) {
      expect(button).not.toBe(null);
    }
  });

  it("opens and closes the creation modal correctly", async () => {
    const createFlowButton = await screen.getByText("Criar Fluxo");

    await act(async () => {
      await fireEvent.click(createFlowButton);
    });

    expect(await screen.findByText("Criar")).not.toBeNull();

    const closeModalButton = await screen.getByText("Cancelar");

    await act(async () => {
      await fireEvent.click(closeModalButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("CreationModal")).toBeNull();
    });
  });
});
