import { jsPDF } from "jspdf";
import { api } from "../../api";
import "jspdf-autotable";
import { formatDateTimeToBrazilian } from "../../../utils/dates";
import { getUserInfo } from "../../../utils/user";
import { downloadFileFromBuffer } from "../../../utils/file";
import { addLogos } from "../../../utils/pdf";

const processAudUrl = "processAud";

export const findAllPaged = async (
  idProcess: number,
  pagination?: Pagination
): Promise<
  Result<{
    messages: string[];
    changedBy: string;
    changedAt: Date;
  }>
> => {
  try {
    const res = await api.processManagement.get<ProcessEvent[]>(
      `/${processAudUrl}/findAllPaged`,
      {
        params: {
          offset: pagination?.offset ?? 0,
          limit: pagination?.limit,
          idProcess,
        },
      }
    );
    return { type: "success", value: res.data as any };
  } catch (error) {
    const E: Error = error as Error;
    return { type: "error", error: E, value: undefined };
  }
};

export const downloadEventsPdf = async (processInfo: {
  record: any;
  idProcess: number;
}): Promise<void> => {
  const container = document.createElement("div");

  try {
    const { record, idProcess } = processInfo;

    const response = await api.processManagement.get(
      `/${processAudUrl}/findAll`,
      {
        params: {
          idProcess,
        },
      }
    );

    const processEvents = response.data;

    const tableHTML = constructTableHTML(processEvents);

    container.style.display = "none";
    container.innerHTML = tableHTML;
    document.body.appendChild(container);

    // eslint-disable-next-line new-cap
    const pdf = new jsPDF();

    const emitedAt = new Date();

    const emissionDate = formatDateTimeToBrazilian(emitedAt);

    pdf.setFontSize(12);
    pdf.text("Histórico de eventos", 105, 20, { align: "center" });
    pdf.text(`Processo: ${record}`, 15, 30);
    pdf.text(`Data emissão: ${emissionDate}`, 15, 40);
    pdf.text(
      `Emissor: ${getUserInfo().fullName} (${
        (getUserInfo().role as any).name
      })`,
      15,
      50
    );

    // @ts-ignore
    pdf.autoTable({ html: "#processEvents", useCss: true, startY: 60 });

    let tableFinalY = (pdf as any).lastAutoTable.finalY;

    if (tableFinalY > 267) {
      pdf.addPage();
      tableFinalY = 20;
    }

    await addLogos(pdf, tableFinalY);

    pdf.save(`Eventos_Processo_${record}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
};

export const downloadEventsXlsx = async (
  record: string,
  idProcess: number
): Promise<void> => {
  const response = await api.processManagement.get(
    `/${processAudUrl}/generateXlsx/${idProcess}`
  );

  downloadFileFromBuffer(response.data.data, `Eventos_Processo_${record}.xlsx`);
};

function constructTableHTML(processEvents: any[]): string {
  let tableHTML = `
        <div class="table-wrapper" style="display: none" hidden>
            <table class="fl-table" id="processEvents">
                <style>
                    * {
                      box-sizing: border-box;
                      -webkit-box-sizing: border-box;
                      -moz-box-sizing: border-box;
                    }
                    body {
                      font-family: Helvetica;
                      -webkit-font-smoothing: antialiased;
                    }
                    h2 {
                      text-align: center;
                      font-size: 18px;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                      color: white;
                      padding: 30px 0;
                    }
                    .table-wrapper {
                      margin: 10px 70px 70px;
                      box-shadow: 0px 35px 50px rgba(0, 0, 0, 0.2);
                    }
                    .fl-table {
                      border-radius: 5px;
                      font-size: 12px;
                      font-weight: normal;
                      border: none;
                      border-collapse: collapse;
                      width: 70%;
                      max-width: 100%;
                      white-space: nowrap;
                      background-color: #f8f8f8;
                    }
                    .fl-table td,
                    .fl-table th {
                      text-align: center;
                      padding: 8px;
                    }
                    .fl-table td {
                      border-right: 1px solid #f8f8f8;
                      font-size: 12px;
                    }
                </style>
                <thead>
                    <tr>
                        <th>Evento</th>
                        <th>Autor</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
    `;

  processEvents.forEach((event) => {
    const messages = event.messages.slice().reverse().join("<br>");
    tableHTML += `
            <tr>
        <td>${messages}</td>
                <td>${event.changedBy}</td>
                <td>${formatDateTimeToBrazilian(event.changedAt)}</td>
            </tr>
        `;
  });

  tableHTML += `
                </tbody>
            </table>
        </div>
    `;

  return tableHTML;
}
