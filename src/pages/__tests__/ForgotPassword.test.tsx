import { describe, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";

import { LoadingProvider } from "hooks/useLoading";
import ForgotPassword from "../ForgotPassword";

describe("ForgotPassword page", () => {
  beforeEach(async () => {
    await act(async () => {
      await render(
        <ChakraProvider>
          <LoadingProvider>
            <BrowserRouter>
              <ForgotPassword />
            </BrowserRouter>
          </LoadingProvider>
        </ChakraProvider>
      );
    });
  });

  it("renders correctly", () => {
    expect(screen).toMatchSnapshot();
  });
});
