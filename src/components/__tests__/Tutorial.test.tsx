import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tutorial } from "components/Tutorial";

describe("Flow components", async () => {
  beforeEach(async () => {
    await act(async () => {
      await render(<Tutorial />);
    });
  });

  it("renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows tutorial button correctly", async () => {
    const tutorialButton = screen.getByTitle("Tutorial");

    await act(async () => {
      await fireEvent.click(tutorialButton);
    });

    expect(await screen.getByText("FAQ - Capju"));

    const unitContent = screen.getByText("Unidades");

    await act(async () => {
      await fireEvent.click(unitContent);
    });

    expect(
      await screen.getByText(
        "Unidades representam setores da Justiça Federal, como, por exemplo, uma Vara Judicial."
      )
    ).not.toBe(null);

    const stageContent = screen.getByText("Etapas");

    await act(async () => {
      await fireEvent.click(stageContent);
    });

    expect(
      await screen.getByText(
        "Etapas representam as fases de um Processo em um determinado Fluxo de trabalho."
      )
    ).not.toBe(null);

    const flowContent = screen.getByText("Fluxos");

    await act(async () => {
      await fireEvent.click(flowContent);
    });

    expect(
      await screen.getByText(
        "Fluxos representam a sequência de Etapas seguida por um Processo."
      )
    ).not.toBe(null);

    const processContent = screen.getByText("Processos");

    await act(async () => {
      await fireEvent.click(processContent);
    });

    expect(
      await screen.getByText(
        "Processos podem ser judiciais (tramitam no sistema PJe) ou administrativos (tramitam no sistema SEI)."
      )
    ).not.toBe(null);

    const signupContent = screen.getByText("Cadastro");

    await act(async () => {
      await fireEvent.click(signupContent);
    });

    expect(
      await screen.getByText(
        "Na página de Cadastro é possível visualizar as solicitações de acesso ao sistema e os acessos concedidos."
      )
    ).not.toBe(null);

    const editAccountContent = screen.getByText("Editar Conta");

    await act(async () => {
      await fireEvent.click(editAccountContent);
    });

    const closeTutorialButton = screen.getByText("Fechar");

    await act(async () => {
      await fireEvent.click(closeTutorialButton);
    });
    
    expect(await screen.queryByText("FAQ")).toBe(null);
  });
});
