// @ts-nocheck
import ResizeObserver from "resize-observer-polyfill";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CommentEdge } from "components/Flow/CommentEdge";
import ReactFlow, { ReactFlowProvider } from "reactflow";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "hooks/useAuth";
import { LoadingProvider } from "hooks/useLoading";
import { ChakraProvider } from "@chakra-ui/react";
import { mockedNotes, mockedUser } from "utils/mocks";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { afterEach } from "vitest";

const restHandlers = [
  rest.delete(
    `${import.meta.env.VITE_NOTE_SERVICE_URL}deleteNote/1`,
    async (req, res, ctx) =>
      res(ctx.status(200), ctx.json({ data: mockedNotes[0] }))
  ),
];

const server = setupServer(...restHandlers);

describe("Flow components > CommentEdge With Commentary", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
    localStorage.setItem("@CAPJu:user", JSON.stringify(mockedUser));
    server.listen();
  });

  beforeEach(async () => {
    await act(async () => {
      render(
        <ChakraProvider>
          <LoadingProvider>
            <AuthProvider>
              <ReactFlowProvider>
                <ReactFlow nodesDraggable={false}>
                  <CommentEdge
                    id="edge-2-3"
                    source="2"
                    sourceX={230}
                    sourceY={338}
                    target="3"
                    targetX={290}
                    targetY={477}
                    data={{
                      from: 2,
                      to: 3,
                      idProcess: 26,
                      idNote: 1,
                      commentary: "Fluxo de edge 2 para 1",
                    }}
                    sourcePosition={
                      "d:/Projetos/EPS/2023-2-CAPJu-Front/node_modules/@reactflow/core/dist/esm/types/utils"
                        .Left
                    }
                    targetPosition={
                      "d:/Projetos/EPS/2023-2-CAPJu-Front/node_modules/@reactflow/core/dist/esm/types/utils"
                        .Left
                    }
                  />
                </ReactFlow>
              </ReactFlowProvider>
            </AuthProvider>
          </LoadingProvider>
        </ChakraProvider>
      );
    });
  });

  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  it("renders with commentary prop", async () => {
    expect(screen).toMatchSnapshot();
  });

  it("check if onViewOpen opens and save commentary", async () => {
    const user = userEvent.setup();
    const button = screen.getByTestId(/read-button-comment-edge/);

    fireEvent.click(button);
    expect(button).not.toBe(null);

    await user.click(screen.getByRole("button", { name: /Fechar/i }));
  });
  it("check if onDeleteOpen opens and delete commentary correctly", async () => {
    const user = userEvent.setup();
    const button = screen.getByTestId(/delete-button-comment-edge/);

    fireEvent.click(button);
    expect(button).not.toBe(null);

    await user.click(screen.getByRole("button", { name: /Excluir/i }));
  });

  it("check if onDeleteOpen opens and delete commentary with error", async () => {
    const user = userEvent.setup();
    const button = screen.getByTestId(/delete-button-comment-edge/);

    fireEvent.click(button);
    expect(button).not.toBe(null);

    await user.click(screen.getByRole("button", { name: /Excluir/i }));
  });
});
