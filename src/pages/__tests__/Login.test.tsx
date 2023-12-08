import { describe, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { ChakraProvider } from "@chakra-ui/react";
import { act } from "react-dom/test-utils";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import { mockedUser, mockedUserDateUpdate } from "utils/mocks";
import { handleVerifyInDefaultEmail } from "utils/defaultEmails";
import { updateUserEmailAndPassword, updateUserPassword } from "services/user";
import DataUpdateModal from "components/DataUpdateModal";
import Login from "../Login";

const restHandlers = [
  rest.post(
    `${import.meta.env.VITE_USER_SERVICE_URL}login`,
    async (req, res, ctx) => {
      const { password } = await req.json();

      if (password === "senha-certa") {
        return res(ctx.status(200), ctx.json(mockedUser));
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

  it("submits form and displays login messages correctly", async () => {
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
  });

  it("updates user password correctly", async () => {
    const userCPF = "123.456.789-00";

    server.use(
      rest.put(
        `${import.meta.env.VITE_USER_SERVICE_URL}updateUserPassword/${userCPF}`,
        async (req, res, ctx) => {
          const { oldPassword } = await req.json();

          if (oldPassword === "senha-certa") {
            return res(ctx.status(200), ctx.json(mockedUser));
          }

          return res(
            ctx.status(400),
            ctx.json({
              error: "Senha incorreta",
            })
          );
        }
      )
    );

    const updateResult = await updateUserPassword(
      { oldPassword: "senha-certa", newPassword: "nova-senha" },
      userCPF
    );

    expect(updateResult.type).toBe("success");
    expect(updateResult.value).toEqual(mockedUser);
  });

  it("updates user email and password correctly", async () => {
    const userCPF = "123.456.789-00";
    const userData = {
      email: "newemail@example.com",
      password: "new-password",
    };

    server.use(
      rest.put(
        `${
          import.meta.env.VITE_USER_SERVICE_URL
        }updateUserEmailAndPassword/${userCPF}`,
        async (req, res, ctx) => {
          const { email, password } = await req.json();

          if (email === userData.email && password === userData.password) {
            return res(ctx.status(200), ctx.json(mockedUser));
          }

          return res(
            ctx.status(400),
            ctx.json({
              error: "Error updating email and password",
            })
          );
        }
      )
    );

    const updateSuccessResult = await updateUserEmailAndPassword(
      userData,
      userCPF
    );

    expect(updateSuccessResult.type).toBe("success");
    expect(updateSuccessResult.value).toEqual(mockedUser);

    // Test the error scenario
    server.use(
      rest.put(
        `${
          import.meta.env.VITE_USER_SERVICE_URL
        }updateUserEmailAndPassword/${userCPF}`,
        async (_req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              error: "Internal server error",
            })
          );
        }
      )
    );

    const updateErrorResult = await updateUserEmailAndPassword(
      userData,
      userCPF
    );

    expect(updateErrorResult.type).toBe("error");
    expect((updateErrorResult.error as Error).message).toBe(
      "Internal server error"
    );
    expect(updateErrorResult.value).toBe(undefined);
  });

  it("returns an error object for unknown errors", async () => {
    const data = {
      email: "newemail@example.com",
      password: "newpassword",
    };
    const cpf = "123.456.789-00";

    const result = await updateUserEmailAndPassword(data, cpf);

    expect(result.type).toBe("error");
    expect(result.error).toBeDefined();

    if (result.error) {
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Internal server error");
    }

    expect(result.value).toBeUndefined();
  });
});

describe("Update Modal", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  beforeEach(async () => {
    await render(
      <ChakraProvider>
        <LoadingProvider>
          <AuthProvider>
            <BrowserRouter>
              <DataUpdateModal user={mockedUserDateUpdate} />
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
});

describe("handleVerifyInDefaultEmail", () => {
  it("should return true for default emails", () => {
    expect(handleVerifyInDefaultEmail("email@emaill.com")).toBe(true);
    expect(handleVerifyInDefaultEmail("email@email.com")).toBe(true);
  });

  it("should return false for non-default emails", () => {
    expect(handleVerifyInDefaultEmail("test@example.com")).toBe(false);
    expect(handleVerifyInDefaultEmail("another@email.com")).toBe(false);
  });
});
