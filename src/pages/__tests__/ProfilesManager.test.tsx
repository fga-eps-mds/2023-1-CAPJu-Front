import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react-dom/test-utils";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUsers } from "utils/mocks";
import { QueryClient, QueryClientProvider } from "react-query";
import { getPaginatedArray } from "utils/pagination";
import ProfilesManager from "../ProfilesManager";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}/allUser?accepted=true`,
    async (req, res, ctx) => {
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(mockedUsers, {
        offset,
        limit,
      });

      return res(
        ctx.status(200),
        ctx.json({ user: paginatedArray, totalPages })
      );
    }
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}/allUser?accepted=false`,
    async (req, res, ctx) => {
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(mockedUsers, {
        offset,
        limit,
      });

      return res(
        ctx.status(200),
        ctx.json({ user: paginatedArray, totalPages })
      );
    }
  ),
];

const server = setupServer(...restHandlers);

const queryClient = new QueryClient();

describe("Profiles page", () => {
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

  it("shows requests and profiles text correctly", async () => {
    const userElements = await screen.queryAllByText("Nome");
    expect(userElements).toHaveLength(2);
    const userElements2 = await screen.queryAllByText("Perfil");
    expect(userElements2).toHaveLength(2);
    const userElements3 = await screen.queryAllByText("Ações");
    expect(userElements3).toHaveLength(2);
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
