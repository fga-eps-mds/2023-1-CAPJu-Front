import { describe, it } from "vitest";
import { render } from "@testing-library/react";

import App from "../App";

describe("Renders main page correctly", async () => {
  it("Should render the page correctly", async () => {
    render(<App />);
  });
});
