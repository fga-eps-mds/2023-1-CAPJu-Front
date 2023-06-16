import { describe, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react-dom/test-utils";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import Login from "../Login";

const restHandlers = [
  rest.post(
    `${import.meta.env.VITE_USER_SERVICE_URL}login`,
    async (req, res, ctx) => {
      const { password } = await req.json();

      if (password === "123Teste") {
        return res(
          ctx.status(200),
          ctx.json({
            cpf: "12345678900",
            fullName: "User Teste",
            email: "test@test.com",
            idUnit: 1,
            token: "mocked-token",
            idRole: 1,
            expiresIn: "2023-06-19T03:26:25.050Z",
          })
        );
      }

      return res(
        ctx.status(400),
        ctx.json({
          error: "Senha incorreta",
        })
      );
    }
  ),
];

const server = setupServer(...restHandlers);

describe("Login page", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await render(
      <ChakraProvider>
        <LoadingProvider>
          <AuthProvider>
            <BrowserRouter>
              <Login />
            </BrowserRouter>
          </AuthProvider>
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
    expect(screen.getByText("Faça Login")).not.toBe(null);
    expect(screen.getByText("CPF")).not.toBe(null);
    expect(screen.getByText("Senha")).not.toBe(null);
    expect(screen.getByText("Entrar")).not.toBe(null);
    expect(screen.getByText("Esqueceu sua senha?")).not.toBe(null);
  });

  it("displays error messages for invalid form submission", async () => {
    const submitButton = screen.getByText("Entrar");
    await fireEvent.click(submitButton);

    expect(await screen.findByText("Preencha seu CPF")).not.toBe(null);
    expect(await screen.findByText("Preencha sua Senha")).not.toBe(null);
  });

  it("login", async () => {
    const cpfInput = screen.getByLabelText("CPF");
    const passwordInput = screen.getByLabelText("Senha");
    const submitButton = screen.getByText("Entrar");

    await act(async () => {
      await fireEvent.change(cpfInput, { target: { value: "123.456.789-00" } });
      await fireEvent.change(passwordInput, {
        target: { value: "123Teste" },
      });
      await fireEvent.click(submitButton);
    });

    await screen.getByText("Bem vindo!");
    await screen.getByText("Login efetuado com sucesso!");
  });

  it("login error", async () => {
    const cpfInput = screen.getByLabelText("CPF");
    const passwordInput = screen.getByLabelText("Senha");
    const submitButton = screen.getByText("Entrar");

    await act(async () => {
      await fireEvent.change(cpfInput, { target: { value: "123.456.789-00" } });
      await fireEvent.change(passwordInput, {
        target: { value: "senha-errada" },
      });
      await fireEvent.click(submitButton);
    });

    await screen.getByText("Erro no login");
    await screen.getByText("Senha incorreta");
  });
});
