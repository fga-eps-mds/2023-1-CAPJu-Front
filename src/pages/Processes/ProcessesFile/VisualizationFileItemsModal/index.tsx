import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { Icon, ViewIcon } from "@chakra-ui/icons";
import { useEffect, useMemo, useState } from "react";
import { FaEdit } from "react-icons/fa";
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
      cell: (info) => {
        return info;
      },
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
      manuallyImported: { text: "Importado manualmente", color: "green" },
    }[fileStatus] as { text: string; color: string };
  };

  const [paginationInfo, setProcessesFileTablePaginationInfo] = useState<{
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  }>();

  const [isItemsFetched, setIsItemsFetched] = useState<boolean>(false);

  const [rawItems, setRawItems] = useState<ProcessesFileItem[]>([]);

  const [tableRows, setTableRows] = useState<TableRow<ProcessesFileItem>[]>([]);

  const refetchItems = async (selectedPage?: { selected: number }) => {
    setIsItemsFetched(false);
    const offset = selectedPage ? selectedPage.selected * 10 : 0;
    const result = await findAllItemsPaged(processesFile.idProcessesFile, {
      offset,
      limit: 10,
    });
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
          status: <Text color={status.color}>{status.text}</Text>,
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
        <ModalHeader fontSize="25px">
          Itens lote - {processesFile?.name || processesFile?.fileName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DataTable
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
              recordParam={fileItemSelected?.record}
              nicknameParam={fileItemSelected?.nickname}
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
