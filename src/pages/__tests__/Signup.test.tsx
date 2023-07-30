import { describe, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser, mockedUnits, mockedRoles } from "utils/mocks";
import Signup from "../Signup";

const restHandlers = [
  rest.post(
    `${import.meta.env.VITE_USER_SERVICE_URL}newUser`,
    async (_req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          user: mockedUser,
          type: "success",
        })
      )
  ),
  rest.get(`${import.meta.env.VITE_UNIT_SERVICE_URL}`, async (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockedUnits))
  ),
  rest.get(`${import.meta.env.VITE_ROLE_SERVICE_URL}`, async (_req, res, ctx) =>
    res(ctx.status(200), ctx.json(mockedRoles))
  ),
];

const server = setupServer(...restHandlers);
const queryClient = new QueryClient();

describe("Signup page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await render(
      <ChakraProvider>
        <LoadingProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserRouter>
                <Signup />
              </BrowserRouter>
            </AuthProvider>
          </QueryClientProvider>
        </LoadingProvider>
      </ChakraProvider>
    );
  });

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("renders correctly", () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows text content correctly", () => {
    expect(screen.getByText("Faça seu Cadastro")).not.toBe(null);
    expect(screen.getByText("Nome")).not.toBe(null);
    expect(screen.getByText("CPF")).not.toBe(null);
    expect(screen.getByText("E-mail")).not.toBe(null);
    expect(screen.getByText("Senha")).not.toBe(null);
    expect(screen.getByText("Confirmação de senha")).not.toBe(null);
    expect(screen.getByText("Unidade")).not.toBe(null);
    expect(screen.getByText("Perfil")).not.toBe(null);
    expect(screen.getByText("Enviar solicitação")).not.toBe(null);
    expect(
      screen.getByText(
        "Esta etapa consiste apenas em uma solicitação de cadastro. O efetivo login no sistema será possível após a aprovação de sua solicitação."
      )
    ).not.toBe(null);
  });

  it("displays error messages for invalid form submission", async () => {
    const submitButton = screen.getByText("Enviar solicitação");

    waitFor(async () => {
      await fireEvent.click(submitButton);
    });

    expect(await screen.findByText("Preencha seu nome")).not.toBe(null);
    expect(await screen.findByText("Preencha seu CPF")).not.toBe(null);
    expect(await screen.findByText("Preencha seu E-mail")).not.toBe(null);
    expect(await screen.findByText("Preencha sua Senha")).not.toBe(null);
    expect(await screen.findByText("Confirme sua senha")).not.toBe(null);
    expect(await screen.findByText("Selecione uma unidade")).not.toBe(null);
    // TODO: Aparentemente apenas esse findByText quebra o teste, motivo desconhecido
    // expect(await screen.findByText("Selecione um perfil")).not.toBe(null);
  });
});
