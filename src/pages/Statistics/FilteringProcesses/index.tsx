import {
  useToast,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Select,
  Button,
  Text,
  Input,
} from "@chakra-ui/react";
import { ProcessQuantifier } from "components/ProcessQuantifier";
import {
  // ReactNode,
  useEffect,
  useState,
  useMemo,
  ChangeEvent,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { getFlows } from "services/processManagement/flows";
import { getProcesses } from "services/processManagement/processes";
import { useQuery } from "react-query";
import { useAuth } from "hooks/useAuth";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import BarChart from "./components/BarChart";
import ProcessTable from "./components/ProcessTable";
import ExportButtons from "./components/ExportButtons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Gráfico de Processos Concluídos / Interrompidos por Mês",
    },
  },
};

export default function FilteringProcesses() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const { state } = useLocation();

  const today = new Date().toISOString().split("T")[0];

  const twoYearsAgoDate = useMemo(() => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    twoYearsAgo.setDate(twoYearsAgo.getDate() + 1);
    return twoYearsAgo.toISOString().split("T")[0];
  }, []);

  const [selectedFlowValue, setSelectedFlowValue] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [processData, setProcessData] = useState<ResultSuccess<
    Process[]
  > | null>(null);

  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [filter] = useState<{ type: string; value: string } | undefined>(
    undefined
  );

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [tableVisible, setTableVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [key, setKey] = useState(Math.random());

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedFlowValue(selectedValue);
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

  const flows = flowsData?.value;

  // HOOKS
  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });

  const handleConfirmClick = async () => {
    const minDateValue = Date.parse(fromDate);
    const maxDateValue = Date.parse(toDate);

    if (
      (fromDate.length === 0 && toDate.length === 0) ||
      (fromDate.length > 0 && toDate.length > 0 && maxDateValue > minDateValue)
    ) {
      setCurrentPage(-1);
      setKey(Math.random());
      fetchProcesses();
    } else {
      toast({
        id: "date-order-error",
        title: "Ordem das datas incorreta",
        description:
          "A data de início deve ser anterior à data de fim. Por favor, ajuste as datas e tente novamente.",
        status: "error",
        isClosable: true,
      });
    }
  };

  const handlePageChange = (selectedPage: { selected: number }) => {
    setCurrentPage(selectedPage.selected);
  };

  const fetchProcesses = useCallback(async () => {
    setIsFetching(true);
    const response = await getProcesses(
      parseInt(selectedFlowValue, 10),
      !tableVisible
        ? {
            offset: 0,
            limit: 0,
          }
        : {
            offset: currentPage * 5,
            limit: 5,
          },
      filter,
      false,
      selectedStatus === "" ? ["archived", "finished"] : [selectedStatus],
      fromDate === "" ? undefined : fromDate,
      toDate === "" ? undefined : toDate
    );

    if (response.type === "success") {
      setProcessData(response);
    } else {
      setProcessData(null);
    }
    setIsFetching(false);
  }, [
    setIsFetching,
    setProcessData,
    filter,
    selectedStatus,
    fromDate,
    toDate,
    currentPage,
  ]);

  useEffect(() => {
    fetchProcesses();
  }, [currentPage]);

  const handleChartClick = async () => {
    const minDateValue = Date.parse(fromDate);
    const maxDateValue = Date.parse(toDate);
    const currentDateValue = Date.now();

    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsAgoValue = Date.parse(twoYearsAgo.toISOString());

    if (fromDate.length === 0 || toDate.length === 0) {
      if (tableVisible) {
        toast({
          id: "date-info",
          title: "Datas não especificadas",
          description:
            "Buscando todos os processos dentro do intervalo de 2 anos a partir da data atual.",
          status: "info",
          isClosable: true,
        });
      }

      setTableVisible((current) => !current);
      setCurrentPage(0);
    }
    if (
      fromDate.length > 0 &&
      toDate.length > 0 &&
      maxDateValue > minDateValue &&
      maxDateValue <= currentDateValue &&
      minDateValue >= twoYearsAgoValue
    ) {
      setTableVisible((current) => !current);
      setCurrentPage(0);
    }

    if (maxDateValue <= minDateValue) {
      toast({
        id: "date-order-error",
        title: "Ordem das datas incorreta",
        description:
          "A data de início deve ser anterior à data de fim. Por favor, ajuste as datas e tente novamente.",
        status: "error",
        isClosable: true,
      });
    }
  };

  return (
    <Box backgroundColor="#FFF" borderRadius="8px">
      <Flex justifyContent="flex-start" w="100%">
        <Accordion defaultIndex={[4]} allowMultiple w="100%">
          <AccordionItem>
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
                  Visualizar quantidade de processos concluídos / interrompidos
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex w="70%" flexDirection="column" marginBottom="4">
                <Flex gap="5">
                  <Select
                    placeholder="Selecione o Fluxo"
                    color="gray.500"
                    value={selectedFlowValue}
                    onChange={handleSelectChange}
                  >
                    {flows?.map((flow) => {
                      return <option value={flow.idFlow}>{flow.name}</option>;
                    })}
                  </Select>
                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    placeholder="Status"
                    w="35%"
                    color="gray.500"
                  >
                    <option value="finished">Concluído</option>;
                    <option value="archived">Interrompido</option>
                  </Select>
                </Flex>

                <Flex alignItems="center" gap="5" marginTop="15">
                  <Input
                    w="50%"
                    type="date"
                    color="gray.500"
                    value={fromDate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setFromDate(event.target.value);
                    }}
                    max={today} // Define a data máxima como a data atual
                    min={twoYearsAgoDate} // Define a data mínima como a data há dois anos
                  />
                  <Text>à</Text>
                  <Input
                    w="50%"
                    type="date"
                    color="gray.500"
                    value={toDate}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setToDate(event.target.value);
                    }}
                    max={today} // Define a data máxima como a data atual
                    min={twoYearsAgoDate} // Define a data mínima como a data há dois anos
                  />
                  <Button
                    colorScheme="whatsapp"
                    w="20%"
                    onClick={handleConfirmClick}
                  >
                    Confirmar
                  </Button>
                </Flex>
              </Flex>
              <Flex alignItems="flex-end" justifyContent="space-between">
                <Flex w="100%" gap="5">
                  <ProcessQuantifier
                    processQuantity={(
                      processData?.totalProcesses || "--"
                    ).toString()}
                    description="Total de Processos"
                    numberColor="#44536D"
                  />
                  <ProcessQuantifier
                    processQuantity={(
                      processData?.totalFinished || "--"
                    ).toString()}
                    description="Processos Concluídos"
                    numberColor="#208F5C"
                  />
                  <ProcessQuantifier
                    processQuantity={(processData?.totalArchived || "--")
                      .toString()
                      .toString()}
                    description="Processos Interrompidos"
                    numberColor="#AE3A33"
                  />
                </Flex>
                <Flex gap="5">
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => {
                      handleChartClick();
                    }}
                  >
                    {!tableVisible ? "Ver relatório" : "Ver Gráfico"}
                  </Button>
                  {processData?.value && flows && flows?.length > 0 && (
                    <ExportButtons
                      today={today}
                      twoYearsAgo={twoYearsAgoDate}
                      selectedFlowValue={selectedFlowValue}
                      toDate={toDate}
                      fromDate={fromDate}
                      processesData={processData}
                      selectedStatus={selectedStatus}
                      toast={toast}
                      flows={flows}
                      filter={filter}
                    />
                  )}
                </Flex>
              </Flex>

              <Flex flexDirection="column">
                <ProcessTable
                  key={key}
                  userData={userData}
                  isUserFetched={isUserFetched}
                  isFetching={isFetching}
                  processData={processData}
                  flows={flows}
                  state={state}
                  handlePageChange={handlePageChange}
                  tableVisible={tableVisible}
                />
                {processData?.value && (
                  <BarChart
                    tableVisible={tableVisible}
                    selectedStatus={selectedStatus}
                    processes={processData.value}
                    start={fromDate}
                    end={toDate}
                  />
                )}
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
}
