import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import {
    getNotesByProcessRecord,
} from "../note";

const apiMockNote = new MockAdapter(api.note);

describe("Testes para a função getNotesByProcessRecord", () => {
    afterEach(() => {
        apiMockNote.reset();
    });

    describe("Testes para a função getNotesByProcessRecord", () => {
        it("Sucesso - getNotesByProcessRecord", async () => {
            const record = '33737010920237091330';
            const mockNotes = {
                idNote:1,
                commentary: "some",
                idProcess:1,
                isStageA:1,
                idStageB:2,
            }
          
    
          apiMockNote.onGet(`/${record}`).reply(200, mockNotes)
      
          const result = await getNotesByProcessRecord(record);
      
          expect(result).toEqual({ type: "success", value: mockNotes });
        });
      
        it("Falha - getNotesByProcessRecord", async () => {
          const record = '33737010920237091330';
    
          apiMockNote.onGet(`/${record}`).reply(401, "Invalid credentials")
      
          const result = await getNotesByProcessRecord(record);
      
          expect(result).toEqual({ type: "error", error: new Error("Invalid credentials") ,value: undefined });
        });
    })

    describe("Testes para a função getNotesByProcessId", () => {
        it("Sucesso - getNotesByProcessId", async () => {
            const record = '1';
            const mockNotes = {
                idNote:1,
                commentary: "some",
                idProcess:1,
                isStageA:1,
                idStageB:2,
            }
          
    
          apiMockNote.onGet(`/${record}`).reply(200, mockNotes)
      
          const result = await getNotesByProcessRecord(record);
      
          expect(result).toEqual({ type: "success", value: mockNotes });
        });
      
        it("Falha - getNotesByProcessId", async () => {
        const record = '1';
    
          apiMockNote.onGet(`/${record}`).reply(200,  "Invalid credentials")
      
          const result = await getNotesByProcessRecord(record);
          expect(result).toEqual({ type: "error", error: new Error("Invalid credentials") ,value: undefined });
        });
    })



  });