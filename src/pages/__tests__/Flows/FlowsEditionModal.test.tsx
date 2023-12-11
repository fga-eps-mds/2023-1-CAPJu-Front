import { describe, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import {
  mockedManagerUser,
  mockedFlow,
  mockedRoles,
  mockedStages,
} from "utils/mocks";
import { getPaginatedArray } from "utils/pagination";
import { EditionModal } from "pages/Flows/EditionModal";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_PROCESS_MANAGEMENT_SERVICE_URL}process`,
    async (req, res, ctx) => {
      const filter = req.url.searchParams.get("filter");
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(
        filter && filter !== ""
          ? mockedStages.filter((stages) => stages.name.includes(filter))
          : mockedStages,
        {
          offset,
          limit,
        }
      );
      return res(
        ctx.status(200),
        ctx.json({ stages: paginatedArray, totalPages })
      );
    }
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}cpf/${mockedManagerUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedManagerUser))
  ),
  rest.get(
    `${import.meta.env.VITE_ROLE_SERVICE_URL}roleAdmins/${
      mockedManagerUser.idRole
    }`,
    async (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json(
          mockedRoles?.find((i) => i.idRole === mockedManagerUser.idRole)
        )
      )
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Stages page", () => {
  beforeAll(async () => {
    localStorage.setItem("@CAPJu:user", JSON.stringify(mockedManagerUser));
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(async () => {
    const onClose = vi.fn();
    const afterSubmission = vi.fn();

    await act(async () => {
      render(
        <ChakraProvider>
          <LoadingProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <BrowserRouter>
                  <EditionModal
                    flow={mockedFlow}
                    isOpen
                    onClose={onClose}
                    afterSubmission={afterSubmission}
                  />
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
