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
import { mockedProcess } from "utils/mocks";
import ViewProcess from "pages/ViewProcess";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}getOneProcess/${
      mockedProcess.record
    }`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedProcess))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Processes page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await act(async () => {
      render(
        <ChakraProvider>
          <LoadingProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <BrowserRouter>
                  <ViewProcess />
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
});
