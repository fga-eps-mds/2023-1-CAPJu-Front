import { render, screen } from "@testing-library/react";
import InputFile from "components/FormFields/InputFile/InputFile";

describe("Componente InputFile", () => {
  it("renderiza sem erros", () => {
    render(<InputFile label="Teste" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando a propriedade de erro externo é passada", () => {
    const errorMessage = "Esta é uma mensagem de erro";
    const externalError = { type: "validação", message: errorMessage };

    render(<InputFile label="Teste" externalError={externalError} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
