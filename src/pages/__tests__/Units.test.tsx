import { describe, expect } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import {
  mockedUnits,
  mockedAdminUser,
  mockedRoleAdministrador,
} from "utils/mocks";
import { getPaginatedArray } from "utils/pagination";
import Units from "../Units";

const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_UNITS_SERVICE_URL}units`,
    async (req, res, ctx) => {
      const filter = req.url.searchParams.get("filter");
      const offset = Number(req.url.searchParams.get("offset"));
      const limit = Number(req.url.searchParams.get("limit"));
      const { paginatedArray, totalPages } = getPaginatedArray(
        filter && filter !== ""
          ? mockedUnits.filter((units) => units.name.includes(filter))
          : mockedUnits,
        {
          offset,
          limit,
        }
      );

      return res(
        ctx.status(200),
        ctx.json({ units: paginatedArray, totalPages })
      );
    }
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}user/${mockedAdminUser.cpf}`,
    async (_req, res, ctx) => res(ctx.status(200), ctx.json(mockedAdminUser))
  ),
  rest.get(
    `${import.meta.env.VITE_USER_SERVICE_URL}roleAdmins/${
      mockedAdminUser.idRole
    }`,
    async (_req, res, ctx) =>
      res(ctx.status(200), ctx.json(mockedRoleAdministrador))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Units page", () => {
  beforeAll(async () => {
    localStorage.setItem("@CAPJu:user", JSON.stringify(mockedAdminUser));
    server.listen({ onUnhandledRequest: "error" });
  });

  beforeEach(async () => {
    await act(async () => {
      await render(
        <ChakraProvider>
          <LoadingProvider>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <BrowserRouter>
                  <Units />
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
    expect(await screen.queryAllByText("Unidades")).not.toBe(null);
    expect(await screen.queryByText("Criar Unidade")).not.toBe(null);
    expect(await screen.queryByText("Unidade 1")).not.toBe(null);
    expect(await screen.queryByText("Unidade 2")).not.toBe(null);
    expect(await screen.queryByText("Unidade 3")).not.toBe(null);
    expect(await screen.queryByText("Unidade 4")).not.toBe(null);
    expect(await screen.queryByText("Unidade 5")).not.toBe(null);
    expect(await screen.queryByText("Unidade 6")).toBe(null);
    expect(await screen.queryByText("Unidade 7")).toBe(null);
    expect(await screen.queryByText("Unidade 8")).toBe(null);
    expect(await screen.queryByText("Unidade 8")).toBe(null);
    expect(await screen.queryByText("Unidade 10")).toBe(null);
  });

  it("opens and closes the creation modal correctly", async () => {
    const createUnitButton = await screen.getByText("Criar Unidade");

    await act(async () => {
      await fireEvent.click(createUnitButton);
    });

    expect(await screen.findByText("Criar unidade")).not.toBeNull();

    const closeModalButton = await screen.getByText("Cancelar");

    await act(async () => {
      await fireEvent.click(closeModalButton);
    });

    await waitFor(() => {
      expect(screen.queryByText("Criar unidade")).toBeNull();
    });
  });

  it("filters units correctly", async () => {
    const input = screen.getByPlaceholderText("Pesquisar unidades");

    expect(input).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "Unidade 5" },
      });
      await fireEvent.submit(input);
    });

    expect(await screen.queryByText("Unidade 1")).toBe(null);
    expect(await screen.queryByText("Unidade 2")).toBe(null);
    expect(await screen.queryByText("Unidade 3")).toBe(null);
    expect(await screen.queryByText("Unidade 4")).toBe(null);
    expect(await screen.queryByText("Unidade 5")).not.toBe(null);

    const button = screen.getByLabelText("botão de busca");

    expect(button).not.toBe(null);

    await act(async () => {
      await fireEvent.change(input, {
        target: { value: "Unidade 3" },
      });
      await fireEvent.click(button);
    });

    expect(await screen.queryByText("Unidade 1")).toBe(null);
    expect(await screen.queryByText("Unidade 2")).toBe(null);
    expect(await screen.queryByText("Unidade 3")).not.toBe(null);
    expect(await screen.queryByText("Unidade 4")).toBe(null);
    expect(await screen.queryByText("Unidade 5")).toBe(null);
  });
});
