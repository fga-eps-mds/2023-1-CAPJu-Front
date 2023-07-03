import { describe, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";

import { LoadingProvider } from "hooks/useLoading";
import { AuthProvider } from "hooks/useAuth";
import About from "../About";
import { aboutCapju } from "../../utils/aboutText";

describe("About page", () => {
  beforeEach(async () => {
    await render(
      <ChakraProvider>
        <LoadingProvider>
          <AuthProvider>
            <BrowserRouter>
              <About />
            </BrowserRouter>
          </AuthProvider>
        </LoadingProvider>
      </ChakraProvider>
    );
  });

  it("renders correctly", () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows text content correctly", () => {
    expect(screen.getByText("O que é o CAPJu?")).not.toBe(null);
    expect(screen.getByText(aboutCapju)).not.toBe(null);
    expect(screen.getByText("Contribuidores")).not.toBe(null);
    expect(screen.getByText("Idealizador")).not.toBe(null);
    expect(screen.getByText("Nome: Wellington José Barbosa Carlos")).not.toBe(
      null
    );
    expect(screen.getByText("Email: wellington.carlos@trf1.jus.br")).not.toBe(
      null
    );
    expect(screen.getByText("Responsável Técnico")).not.toBe(null);
    expect(screen.getByText("Nome: Hilmer Rodrigues Neri")).not.toBe(null);
    expect(screen.getByText("Email: hilmer@unb.br")).not.toBe(null);
  });

  it("shows button correctly", () => {
    const button = screen.getByText("Veja Mais");
    expect(button).not.toBe(null);
  });
});
