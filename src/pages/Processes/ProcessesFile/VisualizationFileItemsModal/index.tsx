import {
  Button,
  chakra,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon, SearchIcon, ViewIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaEraser } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { DataTable } from "../../../../components/DataTable";
import {
  findAllItemsPaged,
  updateFileItemById,
} from "../../../../services/processManagement/processesFile";
import { Pagination } from "../../../../components/Pagination";
import { CreationModal } from "../../CreationModal";

interface VisualizationItemsModalProps {
  processesFile: ProcessesFile;
  isOpen: boolean;
  onClose: () => void;
}

export function VisualizationItemsModal({
  processesFile,
  isOpen,
  onClose,
}: VisualizationItemsModalProps) {
  const {
    isOpen: isCreationOpen,
    onOpen: onCreationOpen,
    onClose: onCreationClose,
  } = useDisclosure();

  const tableColumnHelper = createColumnHelper<TableRow<any>>();

  const [fileItemSelected, setFileItemSelected] =
    useState<ProcessesFileItem | null>(null);

  const [filter, setFilter] = useState<string>("");

  // @ts-ignore
  const tableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Processo",
        icon: <ViewIcon boxSize={6} />,
        isNavigate: true,
        actionName: "see-items",
        labelOnDisable: "Item não importado",
        disabledOn: (fileItem: ProcessesFileItem) => !fileItem.idProcess,
      },
      {
        label: "Importar manualmente",
        icon: <Icon as={FaEdit} boxSize={6} style={{ marginLeft: "8px" }} />,
        actionName: "see-items",
        labelOnDisable: "Item já importado",
        action: ({ processesFileItem }) => {
          onCreationOpen();
          setFileItemSelected(processesFileItem);
        },
        disabledOn: (fileItem: ProcessesFileItem) =>
          fileItem.status !== "error",
      },
    ],
    [processesFile]
  );

  const tableColumns = [
    tableColumnHelper.accessor("record", {
      cell: (info) => info.getValue(),
      header: "Número processo",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("nickname", {
      cell: (info) => info,
      header: "Apelido",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("flow", {
      cell: (info) => info.getValue(),
      header: "Fluxo",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("priority", {
      cell: (info) => info.getValue(),
      header: "Prioridade",
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
    tableColumnHelper.accessor("message", {
      cell: (info) => info.getValue(),
      header: "Mensagens",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("tableActions", {
      cell: (info) => ({
        className: "centered-cell",
        children: info.getValue(),
      }),
      header: "Ações",
      meta: {
        isTableActions: true,
        isSortable: false,
      },
    }),
  ];

  const getProcessesFileItemStatusPt = (fileStatus: string) => {
    return {
      error: { text: "Erro", color: "red" },
      imported: { text: "Importado", color: "green" },
      manuallyImported: {
        text: "Importado manualmente",
        color: "green",
      },
    }[fileStatus] as { text: string; color: string; title: string | undefined };
  };

  const [paginationInfo, setProcessesFileTablePaginationInfo] = useState<{
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  }>();

  const [isItemsFetched, setIsItemsFetched] = useState<boolean>(false);

  const [rawItems, setRawItems] = useState<ProcessesFileItem[]>([]);

  const [tableRows, setTableRows] = useState<TableRow<ProcessesFileItem>[]>([]);

  const refetchItems = async (
    selectedPage?: { selected: number },
    filterParam = filter
  ) => {
    setIsItemsFetched(false);
    const offset = selectedPage ? selectedPage.selected * 10 : 0;
    const result = await findAllItemsPaged(
      processesFile.idProcessesFile,
      filterParam,
      {
        offset,
        limit: 10,
      }
    );
    const value = result.value as {
      data: ProcessesFileItem[];
      pagination: any;
    };
    if (result && result.type === "success") {
      const { data, pagination } = value;
      setProcessesFileTablePaginationInfo(pagination);
      setRawItems(data);
      const rows = (data || []).map((item) => {
        const processesFileItem = { ...item };
        // @ts-ignore
        Object.keys(processesFileItem).forEach(
          // eslint-disable-next-line no-return-assign
          (key) =>
            // @ts-ignore
            !processesFileItem[key] && (processesFileItem[key] = "-")
        );
        const status = getProcessesFileItemStatusPt(processesFileItem.status);
        return {
          ...processesFileItem,
          message: (
            <>
              {processesFileItem.message ? (
                processesFileItem.message.split("\n").map((msg: string) => (
                  <Text key={uuidv4()} my={15} align="center">
                    {msg}
                  </Text>
                ))
              ) : (
                <Text my={15} align="center">
                  -
                </Text>
              )}
            </>
          ),
          status: (
            <Text color={status.color} title={status.title || ""}>
              {status.text}
            </Text>
          ),
          tableActions,
          actionsProps: {
            processesFileItem,
            pathname:
              processesFileItem.idProcess &&
              `/processos/${processesFileItem.idProcess}`,
            state: {
              process: {
                idProcess: processesFileItem.idProcess,
                idFlow: (processesFileItem as any)[
                  "generatedProcessInfo.idFlow"
                ],
              },
            },
          },
        };
      });
      setTableRows(rows as any);
      setIsItemsFetched(true);
    }
  };

  useEffect(() => {
    if (processesFile?.idProcessesFile) {
      refetchItems().finally();
    }
  }, [processesFile]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" colorScheme="red">
      <ModalOverlay backdropFilter="blur(12px)" />
      <ModalContent backgroundColor="#E2E8F0">
        <ModalHeader
          fontSize="25px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          marginTop="30px"
        >
          <Box flexShrink={0}>
            Itens lote - {processesFile?.name || processesFile?.fileName}
          </Box>
          <chakra.form
            onSubmit={(e) => {
              e.preventDefault();
              refetchItems().finally();
            }}
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap="2"
            width={{ base: "100%", md: "57%" }}
          >
            <Input
              color="black"
              placeholder="Pesquise itens por número de processo, apelido, fluxo ou prioridade"
              variant="filled"
              background="white"
              _focus={{
                background: "white",
              }}
              _hover={{
                background: "white",
              }}
              onChange={({ target }) => setFilter(target.value)}
              value={filter}
            />
            <Button
              aria-label="botão de limpeza"
              colorScheme="green"
              justifyContent="center"
              title={filter && "Limpar filtro"}
              isDisabled={!filter}
              onClick={() => {
                setFilter("");
                refetchItems(undefined, "").finally();
              }}
            >
              <Icon as={FaEraser} boxSize={4} />
            </Button>
            <Button
              aria-label="botão de busca"
              colorScheme="green"
              justifyContent="center"
              title="Pesquisar"
              type="submit"
            >
              <SearchIcon boxSize={4} />
            </Button>
          </chakra.form>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DataTable
            style={{ tableLayout: "fixed", maxWidth: "100%" }}
            maxWidth="unset"
            width="100%"
            size="lg"
            data={tableRows}
            rawData={rawItems}
            columns={tableColumns}
            isDataFetching={!isItemsFetched}
            emptyTableMessage={`Não foram itens para o lote ${
              processesFile.name || processesFile.fileName
            }.`}
          />
          {![undefined, 0].includes(paginationInfo?.totalPages) ? (
            <Pagination
              pageCount={paginationInfo?.totalPages as number}
              onPageChange={refetchItems}
            />
          ) : null}
          {fileItemSelected && isCreationOpen && (
            <CreationModal
              isOpen={isCreationOpen}
              onClose={onCreationClose}
              externalProcess={{
                record: fileItemSelected?.record,
                nickname: fileItemSelected?.nickname,
                flow: fileItemSelected?.flow,
                priority: fileItemSelected?.priority,
              }}
              afterSubmission={async (res) => {
                if (res.type !== "success") return;
                const createdProcess = (res.value as any)?.data;
                await updateFileItemById(fileItemSelected.idProcessesFileItem, {
                  status: "manuallyImported",
                  message: null,
                  idProcess: createdProcess?.idProcess,
                });
                await refetchItems();
                onCreationOpen();
                setFileItemSelected(null);
              }}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
