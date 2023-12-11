import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Input } from "components/FormFields";

describe("Componente Input", () => {
  it("renderiza sem erros", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("exibe mensagem de erro quando a propriedade de erros é passada", () => {
    const errorMessage = "Esta é uma mensagem de erro";
    const error = { type: "validação", message: errorMessage };

    render(<Input errors={error} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
});
