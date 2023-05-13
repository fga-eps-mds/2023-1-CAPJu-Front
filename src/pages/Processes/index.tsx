import { useState, useMemo } from "react";
import { useQuery } from "react-query";
import {
  Flex,
  Text,
  Button,
  useDisclosure,
  Input,
  Checkbox,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, Icon, ViewIcon } from "@chakra-ui/icons";
import { MdDelete, MdEdit } from "react-icons/md";
import { createColumnHelper } from "@tanstack/react-table";
import { getProcesses } from "services/processes";
import { useAuth } from "hooks/useAuth";
import { PrivateLayout } from "layouts/Private";
import { DataTable } from "components/DataTable";
import { hasPermission } from "utils/permissions";

function Processes() {
  const toast = useToast();
  const { getUserData } = useAuth();
  const [selectedProcess, selectProcess] = useState<Process>();

  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
  });
  const [filter, setFilter] = useState<string>("");
  const [legalPriority, setLegalPriority] = useState(false);
  const {
    // isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    // onClose: onCreationClose,
  } = useDisclosure();
  const {
    data: processesData,
    isFetched: isProcessesFetched,
    refetch: refetchProcesses,
  } = useQuery({
    queryKey: ["processes"],
    queryFn: getProcesses,
    onError: () => {
      toast({
        id: "processes-error",
        title: "Erro ao carregar processos",
        description:
          "Houve um erro ao carregar processos, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });

  const isActionDisabled = (actionName: string) =>
    userData?.value ? !hasPermission(userData.value, actionName) : true;

  const tableActions = useMemo(
    () => [
      {
        label: "Visualizar Processo",
        icon: <ViewIcon boxSize={4} />,
        action: ({ process }: { process: Process }) => {
          selectProcess(process);
          // onAdminsListOpen();
        },
        actionName: "view-process",
        disabled: isActionDisabled("view-process"),
      },
      {
        label: "Editar Processo",
        icon: <Icon as={MdEdit} boxSize={4} />,
        action: ({ process }: { process: Process }) => {
          selectProcess(process);
          // onAdminsListOpen();
        },
        actionName: "edit-process",
        disabled: isActionDisabled("edit-process"),
      },
      {
        label: "Excluir Processo",
        icon: <Icon as={MdDelete} boxSize={5} />,
        action: async ({ process }: { process: Process }) => {
          selectProcess(process);
          // onExclusionOpen();
        },
        actionName: "delete-process",
        disabled: isActionDisabled("delete-process"),
      },
    ],
    [isProcessesFetched, isUserFetched]
  );

  const filteredProcess = useMemo<TableRow<Process>[]>(() => {
    if (!isProcessesFetched) return [];

    const value =
      filter !== ""
        ? processesData?.value?.filter((process) =>
            process.record.toLowerCase().includes(filter.toLocaleLowerCase())
          )
        : processesData?.value;

    return (
      (value?.reduce(
        (
          acc: TableRow<Process>[] | Process[],
          curr: TableRow<Process> | Process
        ) => [
          ...acc,
          { ...curr, tableActions, actionsProps: { process: curr } },
        ],
        []
      ) as TableRow<Process>[]) || []
    );
  }, [processesData, filter, isProcessesFetched]);

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
    tableColumnHelper.accessor("idStage", {
      cell: (info) => info.getValue(),
      header: "Etapa Atual",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("idStageFinal", {
      cell: (info) => info.getValue(),
      header: "Etapa Final",
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

  console.log("processesData", processesData);
  console.log(
    "selectedProcess",
    processesData,
    selectedProcess,
    refetchProcesses
  );

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Text fontSize="lg" fontWeight="semibold">
            Processos
          </Text>
          <Button
            size="xs"
            fontSize="sm"
            colorScheme="green"
            isDisabled={isActionDisabled("create-process")}
            onClick={onCreationOpen}
          >
            <AddIcon mr="2" boxSize={3} /> Adicionar Processo
          </Button>
        </Flex>
        <Flex w="100%" justifyContent="space-between" gap="2" flexWrap="wrap">
          <Input
            placeholder="Pesquisar processo (Registro ou apelido)"
            width={["100%", "100%", "60%"]}
            value={filter}
            onChange={({ target }) => setFilter(target.value)}
            variant="filled"
            css={{
              "&, &:hover, &:focus": {
                background: "white",
              },
            }}
          />
          <Checkbox
            colorScheme="green"
            borderColor="green"
            checked={legalPriority}
            onClick={() => setLegalPriority(!legalPriority)}
          >
            Mostrar processos com prioridade legal
          </Checkbox>
        </Flex>
      </Flex>
      <DataTable
        data={filteredProcess}
        columns={tableColumns}
        isDataFetching={!isProcessesFetched || !isUserFetched}
        emptyTableMessage="Não foram encontrados processos."
      />
    </PrivateLayout>
  );
}

export default Processes;
