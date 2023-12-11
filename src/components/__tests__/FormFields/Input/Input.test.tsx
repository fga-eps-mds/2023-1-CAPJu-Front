import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { Input } from "components/FormFields";

describe("Componente Input", () => {
  it("renderiza sem erros", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});
