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
import { mockedFlows, mockedManagerUser } from "utils/mocks";
import Flows from "pages/Flows";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_FLOWS_SERVICE_URL}flows`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedFlows))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedManagerUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedManagerUser))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Flows page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await act(async () => {
      render(
        <ChakraProvider>
          <LoadingProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <BrowserRouter>
                  <Flows />
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
    expect(await screen.findAllByText("Fluxos")).not.toBe(null);
    expect(await screen.findByText("Nome")).not.toBe(null);
    expect(await screen.findByText("Ações")).not.toBe(null);
    expect(await screen.findByText("teste")).not.toBe(null);
    expect(await screen.findByText("abcd")).not.toBe(null);
    expect(await screen.findByText("quadrado")).not.toBe(null);
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

  /* it("opens and closes the creation modal correctly", async () => {
    const createFlowButton = await screen.getByText("Criar Fluxo");

    await act(async () => {
      await fireEvent.click(createFlowButton);
    });

    expect(await screen.findByText("Criar Fluxo")).not.toBeNull();

    const closeModalButton = await screen.getByText("Cancelar");

    await act(async () => {
      await fireEvent.click(closeModalButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Criar Fluxo")).toBeNull();
    });
  }); */
});
