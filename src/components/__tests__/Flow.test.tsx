import ResizeObserver from "resize-observer-polyfill";
import { act, render, screen } from "@testing-library/react";
import { mockedStage, mockedFlowSequence } from "utils/mocks";
import { Flow } from "../Flow";

describe("Flow components", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
  });

  beforeEach(async () => {
    await act(async () => {
      await render(
        <Flow stages={mockedStage} sequences={mockedFlowSequence} />
      );
    });
  });

  it("renders correctly", async () => {
    expect(screen).toMatchSnapshot();
  });

  it("shows text content correctly", async () => {
    expect(screen.findAllByAltText(""));
  });

  it("", async () => {});
});
