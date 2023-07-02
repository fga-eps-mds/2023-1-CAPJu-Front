import { act, fireEvent, render, screen } from "@testing-library/react";
import { Tutorial } from "components/Tutorial";

describe("Flow components", async () => {
    beforeEach(async () => {
        await act(async () => {
            await render(
                <Tutorial />
            );
        });
    });

    it("renders correctly", async () => {
        expect(screen).toMatchSnapshot();
    })

    it("shows tutorial button correctly", async () => {
        const button = screen.getByTitle("Tutorial");
     
        expect(button).not.toBe(null);

        await act(async () => {
            await fireEvent.click(button);
        });

        const conteudo = screen.getByText("Unidades");

        expect(conteudo).not.toBe(null);

        await act(async () => {
            await fireEvent.click(conteudo);
        });

        expect(await screen.getByText("Unidades representam setores da Justiça Federal, como, por exemplo, uma Vara Judicial.")).not.toBe(null);

        const sair = screen.getByText("Fechar");

        expect(sair).not.toBe(null);

        await act(async () => {
            await fireEvent.click(sair);
        });
        
    });

});