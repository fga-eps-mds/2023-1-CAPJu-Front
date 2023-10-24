import { jsPDF } from "jspdf";
import { v4 as uuidv4 } from 'uuid';
import {api} from "../../api";
import 'jspdf-autotable';
import {formatDateTimeToBrazilian} from "../../../utils/dates";
import {getUserInfo} from "../../../utils/user";
import {downloadFileFromBuffer} from "../../../utils/file";
import {registerEvent} from "../../documentAud";

const processAudUrl = 'processAud';

export const findAllPaged = async (idProcess: number, pagination?: Pagination): Promise<Result<{
    messages: string[],
    changedBy: string,
    changedAt: Date,
}>> => {

    try {
        const res = await api.processManagement.get<ProcessEvent[]>(`/${processAudUrl}/findAllPaged`, {
            params: {
                offset: pagination?.offset ?? 0,
                limit: pagination?.limit,
                idProcess,
            },
        });
        return { type: "success", value: res.data as any };
    } catch (error) {
        if (error instanceof Error)
            return {type: "error", error, value: undefined};
        return {
            type: "error",
            error: new Error("Erro desconhecido"),
            value: undefined,
        };
    }

}

export const downloadEventsPdf = async (processInfo: { record: any; idProcess: number }): Promise<void> => {

    const { record, idProcess } = processInfo;

    const response = await api.processManagement.get(`/${processAudUrl}/findAll`, {
        params: {
            idProcess,
        },
    });

    const processEvents = response.data;

    const tableHTML = constructTableHTML(processEvents);

    const container = document.createElement('div');
    container.style.display = 'none';
    container.innerHTML = tableHTML;
    document.body.appendChild(container);

    const pdf = new jsPDF();

    const uuid = uuidv4();

    const emitedAt = new Date();

    const emissionDate = formatDateTimeToBrazilian(emitedAt);

    pdf.setFontSize(12);
    pdf.text('Histórico de eventos', 105, 20, { align: 'center' });
    pdf.text(`Processo: ${record}`, 15, 30);
    pdf.text(`Data emissão: ${emissionDate}`, 15, 40);
    pdf.text(`Emissor: ${getUserInfo().fullName} (${(getUserInfo().role as any).name})`, 15, 50);
    pdf.text(`Documento: ${uuid}`, 15, 60);

    pdf.autoTable({ html: '#processEvents', useCss : true, startY: 70 })

    const spacingBetweenImages = 60;

    let tableFinalY = (pdf as any).lastAutoTable.finalY;

    if (tableFinalY > 267) {
        pdf.addPage();
        tableFinalY = 20;
    }

    pdf.addImage(await imgToBase64('/src/images/logo.png'), 'png', 15, tableFinalY + 10, 20, 12);
    pdf.addImage(await imgToBase64('/src/images/unb.png'), 'png', 30 + spacingBetweenImages, tableFinalY + 10, 20, 20);
    pdf.addImage(await imgToBase64('/src/images/justica_federal.png'), 'png', 50 + 2 * spacingBetweenImages, tableFinalY + 10, 20, 15);

    const result = await registerEvent({ emitedBy: getUserInfo().cpf, emitedAt, uuid, type: 'PROCESS_EVENTS_PDF' });

    if(result.type !== 'success') {
        document.body.removeChild(container);
        throw new Error((result as any).value)
    }

    pdf.save(`eventosProcesso${record}.pdf`);

    document.body.removeChild(container);

};

export const downloadEventsXlsx = async (record: string, idProcess: number): Promise<void> => {

    const response = await api.processManagement.get(`/${processAudUrl}/generateXlsx/${idProcess}`);

    downloadFileFromBuffer(response.data.data, `eventosProcesso${record}.xlsx`);

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

    processEvents.forEach(event => {
        const messages = event.messages.slice().reverse().join('<br>');
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

function imgToBase64(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx!.drawImage(img, 0, 0);
            const base64String = canvas.toDataURL();
            resolve(base64String);
        };
        img.onerror = reject;
        img.src = src;
    });
}