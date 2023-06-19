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
import {
  mockedUser,
  mockedNotStartedProcess,
  mockedStages,
  mockedPriorities,
  mockedFlow,
} from "utils/mocks";
import ViewProcess from "../ViewProcess";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_STAGES_SERVICE_URL}stages`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedStages))
  ),
  rest.get(
    `${import.meta.env.VITE_FLOWS_SERVICE_URL}flow/${
      mockedNotStartedProcess.idFlow
    }`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedFlow))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}priorities`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedPriorities))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESSES_SERVICE_URL}getOneProcess/${
      mockedNotStartedProcess.record
    }`,
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(mockedNotStartedProcess))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedUser))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("ViewProcess page", () => {
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
                <MemoryRouter
                  initialEntries={[
                    {
                      pathname: `/processos/${mockedNotStartedProcess.record}`,
                      state: { process: mockedNotStartedProcess },
                    },
                  ]}
                >
                  <ViewProcess />
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
