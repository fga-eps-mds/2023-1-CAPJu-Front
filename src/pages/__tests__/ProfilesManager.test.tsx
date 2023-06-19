import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react-dom/test-utils";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser } from "utils/mocks";
import { QueryClient, QueryClientProvider } from "react-query";
import ProfilesManager from "../ProfilesManager";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}ProfilesManager`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}allUser?accepted=true`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}allUser?accepted=false`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
];

const server = setupServer(...restHandlers);

const queryClient = new QueryClient();

describe("Signup page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await act(async () => {
      render(
        <ChakraProvider>
          <LoadingProvider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                  <ProfilesManager />
                </BrowserRouter>
              </QueryClientProvider>
            </AuthProvider>
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
    expect(screen.getByText("Solicitações")).not.toBe(null);
    expect(screen.getByText("Perfil de Acesso")).not.toBe(null);
  });

  it("shows solicitations and requests text correctly", () => {
    expect(screen.findAllByAltText("Nome")).not.toBe(null);
    expect(screen.findAllByAltText("User Teste")).not.toBe(null);
    expect(screen.findAllByAltText("Perfil")).not.toBe(null);
    expect(screen.findAllByAltText("Ações")).not.toBe(null);
  });

  it("shows 'search bar' correctly", async () => {
    expect(screen.getByPlaceholderText("Pesquisar usuários por nome")).not.toBe(
      null
    );
    expect(screen.getByPlaceholderText("Pesquisar usuário pelo nome")).not.toBe(
      null
    );
  });
});
