/* eslint-disable import/no-duplicates */
import JsPDF from "jspdf";
import { Data } from "components/StatsTimeStage";
import type { UserOptions } from "jspdf-autotable";
import html2canvas from "html2canvas";
import { formatDateTimeToBrazilian } from "./dates";
import "jspdf-autotable";
import assets from "./assets";

interface jsPDFCustom extends JsPDF {
  // eslint-disable-next-line no-unused-vars
  autoTable: (options: UserOptions) => void;
}

export const downloadProcess = async (
  stage: string,
  flow: string,
  processes: Process[]
): Promise<void> => {
  try {
    const container = document.createElement("div");

    const emitedAt = new Date();

    const emissionDate = formatDateTimeToBrazilian(emitedAt);

    const pdf = new JsPDF() as jsPDFCustom;
    pdf.setFontSize(12);
    pdf.text("Processos por etapa", 105, 20, { align: "center" });
    pdf.text(`Etapa: ${stage}`, 15, 30);
    pdf.text(`Fluxo: ${flow}`, 15, 40);
    pdf.text(`Data emissão: ${emissionDate}`, 15, 50);

    const currentY = 70;

    pdf.text(`Processo da etapa ${stage}`, 15, 60);
    const tableHTML = constructTableHTML(processes);
    container.style.display = "none";
    container.innerHTML = tableHTML;
    document.body.appendChild(container);

    pdf.autoTable({ html: "#processData", useCss: true, startY: currentY });

    const spacingBetweenImages = 60;

    let tableFinalY = (pdf as any).lastAutoTable.finalY;

    if (tableFinalY > 267) {
      pdf.addPage();
      tableFinalY = 20;
    }

    pdf.addImage(
      await imgToBase64(assets.logoUnB),
      "png",
      30 + spacingBetweenImages,
      tableFinalY + 10,
      20,
      20
    );

    pdf.addImage(
      await imgToBase64(assets.justicaFederal),
      "png",
      50 + 2 * spacingBetweenImages,
      tableFinalY + 10,
      20,
      15
    );

    pdf.save(`Quantidade_Processos_Etapas`);

    document.body.removeChild(container);
  } catch (err) {
    console.log(err);
  }
};

export const downloadProcessInDue = async (
  minDate: String,
  maxDate: String,
  processes: Process[]
): Promise<void> => {
  try {
    const container = document.createElement("div");

    const emitedAt = new Date();

    const emissionDate = formatDateTimeToBrazilian(emitedAt);

    const pdf = new JsPDF() as jsPDFCustom;
    pdf.setFontSize(12);
    pdf.text(
      "Relatório de processos filtrado pela data de vencimento",
      105,
      20,
      { align: "center" }
    );
    pdf.text(`Data emissão: ${emissionDate}`, 15, 50);

    const currentY = 70;

    pdf.text(`Processos que vencem entre ${minDate} à ${maxDate}`, 15, 60);
    const tableHTML = constructTableHTMLDueDate(processes);
    container.style.display = "none";
    container.innerHTML = tableHTML;
    document.body.appendChild(container);

    pdf.autoTable({ html: "#processData", useCss: true, startY: currentY });

    const spacingBetweenImages = 60;

    let tableFinalY = (pdf as any).lastAutoTable.finalY;

    if (tableFinalY > 267) {
      pdf.addPage();
      tableFinalY = 20;
    }

    pdf.addImage(
      await imgToBase64(assets.logoUnB),
      "png",
      30 + spacingBetweenImages,
      tableFinalY + 10,
      20,
      20
    );

    pdf.addImage(
      await imgToBase64(assets.justicaFederal),
      "png",
      50 + 2 * spacingBetweenImages,
      tableFinalY + 10,
      20,
      15
    );

    pdf.save(`Processos_Filtrados_Data_Vencimento`);

    document.body.removeChild(container);
  } catch (err) {
    console.log(err);
  }
};

export const downloadPDFQuantityProcesses = async (
  fluxo: string,
  status: string,
  toDate: string,
  fromDate: string,
  processes: Process[],
  totalProcesses: number | undefined,
  totalArchived: number | undefined,
  totalFinished: number | undefined
): Promise<void> => {
  const elem = document.querySelector<HTMLElement>(
    "#chart-quantidade-de-processos"
  );

  try {
    const container = document.createElement("div");

    const emitedAt = new Date();

    const emissionDate = formatDateTimeToBrazilian(emitedAt);

    const pdf = new JsPDF() as jsPDFCustom;
    pdf.setFontSize(12);
    pdf.text("Quantidade de Processos Concluidos / Interrompidos", 105, 20, {
      align: "center",
    });
    pdf.text(`Fluxo: ${fluxo}`, 15, 35);
    pdf.text(`Status: ${status} `, 15, 40);
    pdf.text(`Período: ${toDate}  à  ${fromDate}`, 15, 45);
    pdf.text(`Data emissão: ${emissionDate}`, 15, 50);

    pdf.text(`Total de Processos: ${totalProcesses}`, 15, 60);
    pdf.text(`Processos Concluídos: ${totalFinished}`, 15, 65);
    pdf.text(`Processos Interrompidos: ${totalArchived}`, 15, 70);

    const currentY = 80;

    if (!elem) {
      const tableHTML = constructTableHTMLQuantityProcess(processes);
      container.style.display = "none";
      container.innerHTML = tableHTML;
      document.body.appendChild(container);
    }

    pdf.autoTable({ html: "#processData", useCss: true, startY: currentY });

    const spacingBetweenImages = 60;

    let tableFinalY = (pdf as any).lastAutoTable.finalY;

    if (tableFinalY > 267) {
      pdf.addPage();
      tableFinalY = 20;
    }

    if (elem) {
      await html2canvas(elem).then(async (canvas) => {
        const dataURI = canvas.toDataURL("image/jpeg");

        pdf.setFont("helvetica", "bold");
        if (tableFinalY > 230) {
          pdf.addPage();
          tableFinalY = 20;
        }
        pdf.addImage(dataURI, "JPEG", 30, tableFinalY + 10, 150, 0);

        canvas.remove();
      });
    }

    pdf.addImage(
      await imgToBase64(assets.logoUnB),
      "png",
      spacingBetweenImages - 50,
      270,
      20,
      20
    );

    pdf.addImage(
      await imgToBase64(assets.justicaFederal),
      "png",
      60 + 2 * spacingBetweenImages,
      270,
      20,
      15
    );

    pdf.save(`Quantidade_Processos_Concluidos_Interrompidos`);

    document.body.removeChild(container);
  } catch (err) {
    console.log(err);
  }
};

export function constructTableHTML(processData: Process[]): string {
  let tableHTML = `
        <div class="table-wrapper" style="display: none" hidden>
          <table class="fl-table" id="processData">
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
                      <th>Registro</th>
                      <th>Apelido</th>
                      <th>Etapa</th>
                  </tr>
              </thead>
              <tbody>
  `;

  processData.forEach((event) => {
    const { record, nickname, idStage: etapa } = event;
    tableHTML += `
          <tr>
              <td>${record}</td>
              <td>${nickname}</td>
              <td>${etapa}</td>
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

export function constructTableHTMLData(processData: Data[]): string {
  let tableHTML = `
        <div class="table-wrapper" style="display: none" hidden>
          <table class="fl-table" id="processData">
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
                      <th>Registro</th>
                      <th>Apelido</th>
                      <th>Etapa</th>
                  </tr>
              </thead>
              <tbody>
  `;

  processData.forEach((event) => {
    tableHTML += `
          <tr>
              <td>${event.Etapa}</td>
              <td>${event["Tempo Médio"]}</td>
              <td>${event["Tempo Previsto"]}</td>
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

function constructTableHTMLDueDate(processData: Process[]): string {
  let tableHTML = `
        <div class="table-wrapper" style="display: none" hidden>
          <table class="fl-table" id="processData">
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
                      <th>Registro</th>
                      <th>Apelido</th>
                      <th>Etapa</th>
                      <th>Fluxo</th>
                      <th>Data de Vencimento na Etapa</th>
                  </tr>
              </thead>
              <tbody>
  `;

  processData.forEach((event) => {
    const { record, nickname, nameFlow, nameStage, dueDate } = event;
    tableHTML += `
          <tr>
              <td>${record}</td>
              <td>${nickname}</td>
              <td>${nameStage}</td>
              <td>${nameFlow}</td>
              <td>${dueDate}</td>
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

function constructTableHTMLQuantityProcess(processData: Process[]): string {
  let tableHTML = `
        <div class="table-wrapper" style="display: none" hidden>
          <table class="fl-table" id="processData">
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
                      <th>Registro</th>
                      <th>Apelido</th>
                      <th>Fluxo</th>
                      <th>Status</th>
                  </tr>
              </thead>
              <tbody>
  `;

  processData.forEach((event) => {
    const { record, nickname, flow, status } = event;
    tableHTML += `
          <tr>
              <td>${record}</td>
              <td>${nickname}</td>
              <td>${flow?.name}</td>
              <td>${status === "archived" ? "Interrompido" : "Concluído"}</td>
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

export function imgToBase64(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
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
