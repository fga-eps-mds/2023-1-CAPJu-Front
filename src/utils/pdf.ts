import { Data } from "components/DropTempoEtapa"

export function constructTableHTML(flowStagesData: Data[]): string {
  let tableHTML = `
      <div class="table-wrapper" style="display: none" hidden>
          <table class="fl-table" id="flowStagesData">
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
                      <th>Etapa</th>
                      <th>Tempo Médio em dias</th>
                      <th>Tempo Previsto em dias</th>
                  </tr>
              </thead>
              <tbody>
  `;

  flowStagesData.forEach((event) => {
    const {
      Etapa,
      "Tempo Médio": medio,
      "Tempo Previsto": previsto
    } = event;
    tableHTML += `
          <tr>
              <td>${Etapa}</td>
              <td>${medio}</td>
              <td>${previsto}</td>
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