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
import ViewModal from "../ProfilesManager";

const restHandlers = [
  rest.post(
    `${import.meta.env.VITE_USER_SERVICE_URL}allUser?accepted=true`,
    async (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          user: mockedUser,
          type: "success",
        })
      )
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}allUser?accepted=true`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
];

const server = setupServer(...restHandlers);

const queryClient = new QueryClient();

describe("ViewModal page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await act(async () => {
      render(
        <ChakraProvider>
          <LoadingProvider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                  <ViewModal />
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
  });
});
