/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-duplicates */
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  Button,
  useToast,
} from "@chakra-ui/react";
// import { useState} from "react";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { formatDateTimeToBrazilian } from "utils/dates";
import { constructTableHTMLData, imgToBase64 } from "utils/pdf";
import assets from "utils/assets";
import { Select } from "../FormFields";
import {
  getFlows,
  getHistoricFlow,
  getExpectedFlow,
} from "../../services/processManagement/flows";
import ChartTempos from "./ChartTempos";
import ExportExcel from "../ExportExcel";

export interface Data {
  Etapa: string;
  "Tempo Médio": number;
  "Tempo Previsto": number;
}

interface jsPDFCustom extends jsPDF {
  autoTable: (options: UserOptions) => void;
}

export default function StatsTimeStage() {
  const toast = useToast();
  const [idFlow, setIdFlow] = useState<number>();
  const [nameFlow, setNameFlow] = useState<string>("");
  const [chartData, setChartData] = useState<Data[]>();
  const [blankText, setBlankText] = useState<string>("");

  useEffect(() => {}, [chartData]);

  const mesclaVetores = (
    labels: Array<string>,
    medio: Array<number>,
    previsto: Array<number>
  ) => {
    const resultado = labels.map((label, index) => {
      const obj: Data = {
        Etapa: label,
        "Tempo Médio": medio[index],
        "Tempo Previsto": previsto[index],
      };
      return obj;
    });

    return resultado;
  };

  const { data: flowsData } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const res = await getFlows();

      if (res.type === "error") throw new Error(res.error.message);

      return res;
    },
    onError: () => {
      toast({
        id: "flows-error",
        title: "Erro ao carregar fluxos",
        description:
          "Houve um erro ao carregar fluxos, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
    refetchOnWindowFocus: false,
  });

  const getDataChart = async () => {
    setChartData(undefined);
    try {
      if (idFlow) {
        const historic = (await getHistoricFlow(idFlow)).value;
        const expected = (await getExpectedFlow(idFlow)).value;

        if (historic && expected) {
          const expectedArray = expected.map((item) => item.duration);
          const labels = expected.map((item) => item.name);

          const resultado = mesclaVetores(labels, historic, expectedArray);
          setChartData(resultado);
        } else {
          setBlankText("Não há dados para serem exibidos");
        }
      }
    } catch (error) {
      console.log("erro");
    }
  };

  const downloadPDF = async () => {
    const elem = document.querySelector<HTMLElement>(
      "#chart-tempo-medio-etapa"
    );

    const nameFlowReplaced = nameFlow.replace(/ /g, "_");

    if (elem) {
      const container = document.createElement("div");

      const emitedAt = new Date();

      const emissionDate = formatDateTimeToBrazilian(emitedAt);

      const pdf = new jsPDF() as jsPDFCustom;

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Tempo de Conclusão por Etapa de um Fluxo", 105, 20, {
        align: "center",
      });
      pdf.setFont("helvetica", "normal");
      pdf.text(`Fluxo: ${nameFlow}`, 15, 30);
      pdf.text(`Data emissão: ${emissionDate}`, 15, 40);

      const currentY = 60;

      pdf.text(`Etapas do fluxo ${nameFlow}`, 15, 55);
      const tableHTML = constructTableHTMLData(chartData || []);
      container.style.display = "none";
      container.innerHTML = tableHTML;
      document.body.appendChild(container);

      pdf.autoTable({
        html: "#flowStagesData",
        useCss: true,
        startY: currentY,
      });

      const spacingBetweenImages = 60;
      let tableFinalY = (pdf as any).lastAutoTable.finalY;

      if (tableFinalY + 100 > 267) {
        pdf.addPage();
        tableFinalY = 20;
      }

      await html2canvas(elem).then(async (canvas) => {
        const dataURI = canvas.toDataURL("image/jpeg");

        pdf.setFont("helvetica", "bold");
        pdf.text(
          "Tempo de Conclusão por Etapa de um Fluxo",
          105,
          tableFinalY + 8,
          { align: "center" }
        );
        pdf.addImage(dataURI, "JPEG", 30, tableFinalY + 10, 150, 0);

        canvas.remove();
      });

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

      pdf.save(
        `tempo_medio-previsto_por_etapa_do_fluxo_${nameFlowReplaced}.pdf`
      );

      document.body.removeChild(container);
    }
  };

  return (
    <Flex w="100%" flexDir="column" gap="3" mb="4">
      <Box backgroundColor="#ffffff" borderRadius="8px">
        <Flex w="100%">
          <Accordion
            allowMultiple
            style={{
              width: "100%",
            }}
          >
            <AccordionItem border="hidden">
              <h2>
                <AccordionButton>
                  <AccordionIcon />
                  <Box
                    as="span"
                    flex="1"
                    textAlign="left"
                    marginLeft="18"
                    fontSize="17px"
                    fontWeight="600"
                    fontStyle="normal"
                    lineHeight="24px"
                  >
                    Visualizar tempo médio de cada etapa
                  </Box>
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <Box display="flex" flexDirection="row">
                  <Flex width="100%" justifyContent="space-between">
                    <Flex width="80%">
                      <Select
                        id="flowSelect"
                        placeholder="Selecionar Fluxo"
                        color="gray.500"
                        onChange={(e) => {
                          setIdFlow(parseInt(e.target.value, 10));
                          setNameFlow(
                            // @ts-ignore
                            e.target.children[e.target.selectedIndex].text
                          );
                        }}
                        options={
                          flowsData?.value
                            ? flowsData?.value?.map((flow) => {
                                return {
                                  value: flow.idFlow,
                                  label: flow.name,
                                };
                              })
                            : []
                        }
                      />

                      <Button
                        aria-label="Confirmar"
                        colorScheme="green"
                        marginLeft="2"
                        justifyContent="center"
                        type="submit"
                        onClick={getDataChart}
                      >
                        Confirmar
                      </Button>
                    </Flex>
                    <Flex justifyContent="end">
                      <Button
                        hidden={!chartData}
                        colorScheme="blue"
                        size="md"
                        gap={8}
                        marginLeft="8px"
                        marginRight="8px"
                        onClick={downloadPDF}
                      >
                        PDF
                      </Button>
                      <ExportExcel
                        fileName={nameFlow}
                        excelData={chartData || []}
                      />
                    </Flex>
                  </Flex>
                </Box>
                <Flex justifyContent="center">
                  <Box width="60%" justifyContent="space-around">
                    {chartData ? (
                      <ChartTempos value={chartData} nameFlow={nameFlow} />
                    ) : (
                      <Text
                        textAlign="center"
                        fontWeight="bolder"
                        padding="10px"
                      >
                        {blankText}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Flex>
      </Box>
    </Flex>
  );
}
