import { describe, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import {
  mockedUser,
  mockedProcesses,
  mockedFlows,
  mockedPriorities,
} from "utils/mocks";
import Processes from "../Processes";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}processes`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedProcesses))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}priorities`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedPriorities))
  ),
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

describe("Processes page", () => {
  beforeAll(async () => {
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
                  <Processes />
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
});
