import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Select,
  Button,
} from "@chakra-ui/react";
import { DataTable } from "components/DataTable";
import { useEffect, useState } from "react";
import { getFlows } from "services/processManagement/flows";
import { createColumnHelper } from "@tanstack/react-table";

export default function FilteringProcesses() {
  const [flows, setFlows] = useState([] as Flow[]);

  const getData = async () => {
    const data = await getFlows();
    if (data.value) setFlows(data.value);
  };

  useEffect(() => {
    getData();
  }, []);

  const tableColumnHelper = createColumnHelper<TableRow<any>>();
  const tableColumns = [
    tableColumnHelper.accessor("record", {
      cell: (info) => info.getValue(),
      header: "Registro",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("nickname", {
      cell: (info) => info.getValue(),
      header: "Apelido",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("currentState", {
      cell: (info) => info.getValue(),
      header: "Situação atual",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("status", {
      cell: (info) => info.getValue(),
      header: "Status",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("tableActions", {
      cell: (info) => info.getValue(),
      header: "Ações",
      meta: {
        isTableActions: true,
        isSortable: false,
      },
    }),
  ];

  return (
    <Box backgroundColor="#FFF" borderRadius="8px">
      <Flex justifyContent="flex-start" w="100%">
        <Accordion defaultIndex={[1]} allowMultiple w="100%">
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
                  Visualizar quantidade de processos concluídos e/ou
                  interrompidos em cada etapa
                </Box>
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Flex gap="5" w="70%">
                <Select placeholder="Selecione o Fluxo">
                  {flows?.map((flow) => {
                    return <option value={flow.idFlow}>{flow.name}</option>;
                  })}
                </Select>
                <Select placeholder="Status" w="35%">
                  <option value="archived">Concluído</option>
                  <option value="finished">Interrompido</option>
                </Select>
                <Button colorScheme="whatsapp" w="20%">
                  Confirmar
                </Button>
              </Flex>
              <Flex w="110%">
                <DataTable
                  data={[]}
                  columns={tableColumns}
                  isDataFetching={false}
                  emptyTableMessage={`Não foram encontrados processos`}
                />
              </Flex>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Flex>
    </Box>
  );
}
