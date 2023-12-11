import MockAdapter from "axios-mock-adapter";
import { api } from "../api";
import { getNotesByProcessRecord,
    addNoteToProcess } from "../note";

const apiMockNote = new MockAdapter(api.note);

describe("Testes para a função getNotesByProcessRecord", () => {
  afterEach(() => {
    apiMockNote.reset();
  });

  describe("Testes para a função getNotesByProcessRecord", () => {
    it("Sucesso - getNotesByProcessRecord", async () => {
      const record = "33737010920237091330";
      const mockNotes = {
        idNote: 1,
        commentary: "some",
        idProcess: 1,
        isStageA: 1,
        idStageB: 2,
      };

      apiMockNote.onGet(`/${record}`).reply(200, mockNotes);

      const result = await getNotesByProcessRecord(record);

      expect(result).toEqual({ type: "success", value: mockNotes });
    });

    it("Falha - getNotesByProcessRecord", async () => {
      const record = "33737010920237091330";

      apiMockNote.onGet(`/${record}`).reply(401, "Invalid credentials");

      const result = await getNotesByProcessRecord(record);

      expect(result).toEqual({
        type: "error",
        error: new Error("Invalid credentials"),
        value: undefined,
      });
    });
  });

  describe("Testes para a função getNotesByProcessId", () => {
    it("Sucesso - getNotesByProcessId", async () => {
      const record = "1";
      const mockNotes = [{
        idNote: 1,
        commentary: "some",
        idProcess: 1,
        isStageA: 1,
        idStageB: 2,
      }];

      apiMockNote.onGet(`/${record}`).reply(200, mockNotes);

      const result = await getNotesByProcessRecord(record);

      expect(result).toEqual({ type: "success", value: mockNotes });
    });

    it("Falha - getNotesByProcessId", async () => {
      const idProcess = "1";

      apiMockNote.onGet(`/${idProcess}`).reply(401, "Invalid credentials");

      const result = await getNotesByProcessRecord(idProcess);
      expect(result).toEqual({
        type: "error",
        error: new Error("Invalid credentials"),
        value: undefined,
      });
    });
  });

  describe("Testes para a função addNoteToProcess", () => {
    it("Sucesso - addNoteToProcess", async () => {
      const data = {
            idProcess: 1,
            idStageA: "1",
            idStageB: "2",
            commentary: "Blue as the serpentine"
      }
      const response = {
            idNote: 1,
            commentary: "some",
            idProcess: 1,
            isStageA: 1,
            idStageB: 2,
      };

      apiMockNote.onPost(`/newNote`).reply(200, response);

      const result = await addNoteToProcess(data);

      expect(result).toEqual({ type: "success", value: response });
    });

    it("Falha - addNoteToProcess", async () => {
        const data = {
            idProcess: 1,
            idStageA: "1",
            idStageB: "2",
            commentary: "Blue as the serpentine"
      }
  
        apiMockNote.onGet(`/newNote`).reply(401, "Something went wrong");
  
        const result = await addNoteToProcess(data);
        expect(result).toEqual({
          type: "error",
          error: new Error("Something went wrong"),
          value: undefined,
        });
      });

  });
});
