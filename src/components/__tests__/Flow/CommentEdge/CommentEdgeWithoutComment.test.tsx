// @ts-nocheck
import ResizeObserver from "resize-observer-polyfill";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CommentEdge } from "components/Flow/CommentEdge";
import ReactFlow, { ReactFlowProvider } from "reactflow";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "hooks/useAuth";
import { LoadingProvider } from "hooks/useLoading";
import { ChakraProvider } from "@chakra-ui/react";
import { setupServer } from "msw/node";
import { rest } from "msw";
import { afterEach } from "vitest";

const restHandlers = [
  rest.post(
    `${import.meta.env.VITE_NOTE_SERVICE_URL}newNote`,
    async (req, res, ctx) => {
      const { commentary } = await req.json();
      if (commentary === "comentario errado")
        return res(ctx.status(400), ctx.json({}));

      return res(ctx.status(200), ctx.json({}));
    }
  ),
];

const server = setupServer(...restHandlers);

describe("Flow components > CommentEdge Without Commentary", async () => {
  beforeAll(async () => {
    global.ResizeObserver = ResizeObserver;
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
                      idNote: 1,
                      idProcess: 26,
                    }}
                    sourcePosition={
                      // @ts-ignore
                      "d:/Projetos/EPS/2023-2-CAPJu-Front/node_modules/@reactflow/core/dist/esm/types/utils"
                        .Left
                    }
                    targetPosition={
                      // @ts-ignore
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

  it("renders without commentary prop", async () => {
    expect(screen).toMatchSnapshot();
  });

  it('check button "Adicionar observação" exists and if is clickable', async () => {
    const button = screen.getByText(/Adicionar/);

    fireEvent.click(button);
    expect(button).not.toBe(null);
  });

  it("check if AddModal opens and save correct commentary", async () => {
    const user = userEvent.setup();
    const button = screen.getByText(/Adicionar/);

    fireEvent.click(button);
    expect(button).not.toBe(null);

    await user.type(
      screen.getByPlaceholderText(/Escreva sua observação/),
      "comentario certo"
    );
    await user.click(screen.getByRole("button", { name: /Salvar/i }));
  });

  it("check if AddModal opens and save wrong commentary", async () => {
    const user = userEvent.setup();
    const button = screen.getByText(/Adicionar/);

    fireEvent.click(button);
    expect(button).not.toBe(null);

    await user.type(
      screen.getByPlaceholderText(/Escreva sua observação/),
      "comentario errado"
    );
    await user.click(screen.getByRole("button", { name: /Salvar/i }));
  });
});
