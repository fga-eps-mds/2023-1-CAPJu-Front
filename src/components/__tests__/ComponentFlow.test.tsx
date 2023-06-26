import ResizeObserver from "resize-observer-polyfill";
import { act, render, screen } from "@testing-library/react";
import { mockedStages, mockedFlowSequence } from "utils/mocks";
import { Flow } from "../Flow";

describe("Flow components", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
  });

  beforeEach(async () => {
    await act(async () => {
      await render(
        <Flow stages={mockedStages} sequences={mockedFlowSequence} />
      );
    });
  });

  it("renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows text content correctly", async () => {
    expect(
      screen.findAllByAltText(
        "Vencimento: 5 Dias úteis após a data de entrada nesta etapa"
      )
    ).not.toBe(null);
    expect(
      screen.findAllByAltText(
        "Vencimento: 3 Dias úteis após a data de entrada nesta etapa"
      )
    ).not.toBe(null);
    expect(
      screen.findAllByAltText(
        "Vencimento: 1 Dia útil após a data de entrada nesta etapa"
      )
    ).not.toBe(null);
  });

  it("shows 'stage's properties' correctly", async () => {
    await mockedStages.forEach(async (stage) => {
      expect(await screen.findAllByText(stage.name)).toBeDefined();
    });
  });

  it("shows 'flow sequence' correctly", async () => {
    await mockedFlowSequence.forEach(async (stage) => {
      expect(await screen.findByText(stage.from)).toBeDefined();
    });
    await mockedFlowSequence.forEach(async (stage) => {
      expect(await screen.findByText(stage.to)).toBeDefined();
    });
  });

  it('shows if "handledateformating" is working', async () => {
    const currentDate = new Date("2023-06-25");
    const datestring = currentDate.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(datestring).toMatch("25 de junho de 2023");
  });
});
