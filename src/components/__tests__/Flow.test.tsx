import ResizeObserver from "resize-observer-polyfill";
import { act, render, screen } from "@testing-library/react";
import _ from "lodash";

import { mockedStages, mockedFlowSequence, mockedProcess } from "utils/mocks";
import { handleDateFormating, handleExpiration } from "utils/dates";
import { Flow } from "../Flow";

describe("Flow components", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
  });

  beforeEach(async () => {
    await act(async () => {
      await render(
        <Flow
          stages={mockedStages}
          sequences={mockedFlowSequence}
          process={mockedProcess}
          effectiveDate="2023-06-27"
          currentStage={1}
          allowComments
        />
      );
    });
  });

  it("renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows stages in the flow correctly", async () => {
    await mockedFlowSequence.forEach(async (sequence) => {
      const stageFromName = mockedStages?.find(
        (item) => item.idStage === sequence.from
      )?.name;
      const stageToName = mockedStages?.find(
        (item) => item.idStage === sequence.to
      )?.name;

      if (stageFromName)
        expect(
          await screen.findByText(_.startCase(stageFromName))
        ).toBeDefined();
      if (stageToName)
        expect(await screen.findByText(_.startCase(stageToName))).toBeDefined();
    });
  });

  it("'handleDateFormating' works correctly", async () => {
    const formattedDate = handleDateFormating("2023-06-25");
    expect(formattedDate).toMatch("25 de junho de 2023");
  });

  it("shows 'handleExpiration' value as true if processDate < currentDate", async () => {
    const processDate = new Date();
    processDate.setDate(processDate.getDate() - 1);
    const result = handleExpiration(processDate);
    expect(result).toBe(true);
  });

  it("shows 'handleExpiration' value as false if processDate >= currentDate", async () => {
    const vencimento = new Date();
    const result = handleExpiration(vencimento);
    expect(result).not.toBe(true);
  });

  it("shows process notes correctly", async () => {
    await mockedFlowSequence.forEach(async (sequence) => {
      if (sequence.commentary)
        expect(await screen.findByText(sequence.commentary)).toBeDefined();
    });
  });
});
