import { describe, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";
import ResizeObserver from "resize-observer-polyfill";
import { StatiticsFiltersProvider } from "hooks/useStatisticsFilters";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import {
  mockedUser,
  mockedNotStartedProcess,
  mockedStages,
  mockedPriorities,
  mockedFlow,
  mockedRoles,
  mockedNotes,
} from "utils/mocks";
import ViewProcess from "../ViewProcess";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}stage`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedStages))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}process/${
      mockedNotStartedProcess.idProcess
    }`,
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(mockedNotStartedProcess))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}flow/${
      mockedNotStartedProcess.idFlow
    }`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedFlow))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}priority`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedPriorities))
  ),
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}process/record/${
      mockedNotStartedProcess.record
    }`,
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(mockedNotStartedProcess))
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
  rest.get(
    `${import.meta.env.VITE_NOTE_SERVICE_URL}${
      mockedNotStartedProcess.idProcess
    }`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedNotes))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("ViewProcess page", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
    localStorage.setItem("@CAPJu:user", JSON.stringify(mockedUser));
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(async () => {
    await act(async () => {
      render(
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
                  <StatiticsFiltersProvider>
                    <ViewProcess />
                  </StatiticsFiltersProvider>
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

  it("shows process text content correctly", () => {
    expect(screen.getByText("(12345678912345678915)")).not.toBe(null);
    expect(screen.getByText("Não iniciado")).not.toBe(null);
    expect(screen.getByText("Fluxo 1")).not.toBe(null);
    expect(screen.getByText("Não tem")).not.toBe(null);
  });

  it("shows staged name and due date correctly", () => {
    expect(screen.findByText("etapaA")).not.toBe(null);
    expect(screen.findByText("Vencimento")).not.toBe(null);
  });
});
