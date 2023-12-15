import { createColumnHelper } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { Icon, SearchIcon, ViewIcon } from "@chakra-ui/icons";
import {
  FaEraser,
  FaFileDownload,
  FaFileUpload,
  FaFileExcel,
  FaFileCsv,
} from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {
  Button,
  chakra,
  Flex,
  Input,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import { v4 as uuidv4 } from "uuid";
import { Pagination } from "../../../components/Pagination";
import {
  findAllPaged,
  findFileById,
  generateResultingFile,
} from "../../../services/processManagement/processesFile";
import { formatDateTimeToBrazilian } from "../../../utils/dates";
import { DataTable } from "../../../components/DataTable";
import { DeletionModal } from "./DeletionModal";
import { VisualizationItemsModal } from "./VisualizationFileItemsModal";
import { ImportProcessesModal } from "../ImportProcessesModal";
import { useAuth } from "../../../hooks/useAuth";
import template from "../../../utils/templates";
import { downloadFileFromBuffer } from "../../../utils/file";

export default function ProcessesFileComponent() {
  const { getUserData } = useAuth();
  const toast = useToast();

  const tableColumnHelper = createColumnHelper<TableRow<any>>();

  const processesFileTableColumns = [
    tableColumnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      header: "Lote",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("status", {
      cell: (info) => info,
      header: "Status",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("importedItemsCount", {
      cell: (info) => info.getValue(),
      header: "Importados",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("errorItemsCount", {
      cell: (info) => info.getValue(),
      header: "Erro",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("message", {
      cell: (info) => info.getValue(),
      header: "Mensagem",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("createdAt", {
      cell: (info) => info.getValue(),
      header: "Data criação",
      meta: {
        isSortable: true,
      },
    }),
    tableColumnHelper.accessor("processesFileTableActions", {
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

  const [selectedFile, selectFile] = useState<ProcessesFile>();

  const { data: userData, isFetched: isUserFetched } = useQuery({
    queryKey: ["user-data"],
    queryFn: getUserData,
    refetchOnWindowFocus: false,
  });

  const {
    isOpen: isDeletionOpen,
    onOpen: onDeletionOpen,
    onClose: onDeletionClose,
  } = useDisclosure();

  const {
    isOpen: isImportationOpen,
    onOpen: onImportationOpen,
    onClose: onImportationClose,
  } = useDisclosure();

  const {
    isOpen: isVisualizationOpen,
    onOpen: onVisualizationOpen,
    onClose: onVisualizationClose,
  } = useDisclosure();

  const processesFileTableActions = useMemo<TableAction[]>(
    () => [
      {
        label: "Visualizar Itens",
        icon: <ViewIcon boxSize={6} style={{ marginRight: "10px" }} />,
        actionName: "see-items",
        labelOnDisable: "Arquivo não importado ",
        disabledOn: (file: ProcessesFile) => file.status !== "imported",
        action: ({ processesFile }) => {
          selectFile(processesFile);
          onVisualizationOpen();
        },
      },
      {
        label: "Download Arquivo Original",
        icon: (
          <Icon
            as={FaFileDownload}
            boxSize={6}
            style={{ marginRight: "10px" }}
          />
        ),
        actionName: "download-original-file",
        disabled: false,
        action: async ({ processesFile }) =>
          downloadProcessesFile(
            processesFile.idProcessesFile,
            "dataOriginalFile"
          ),
      },
      {
        label: "Download Arquivo Resultado ",
        icon: (
          <Icon as={FaFileExcel} boxSize={6} style={{ marginRight: "5px" }} />
        ),
        actionName: "download-resulting-file",
        labelOnDisable: " Arquivo não importado",
        disabledOn: (file: ProcessesFile) =>
          ["waiting", "inProgress", "error"].includes(file.status),
        action: async ({ processesFile }) =>
          downloadResultingFile(
            processesFile.idProcessesFile,
            processesFile.fileName
          ),
      },
      // This is not working
      // {
      //   label: "Download .CSV Resultado",
      //   icon: (
      //       <Icon as={FaFileCsv} boxSize={6} style={{ marginLeft: "8px" }} />
      //   ),
      //   actionName: "download-resulting-file",
      //   labelOnDisable: " Arquivo não importado ",
      //   disabledOn: (file: ProcessesFile) =>
      //       ["waiting", "inProgress", "error"].includes(file.status),
      //   action: async ({ processesFile }) =>
      //       downloadProcessesFile(
      //           processesFile.idProcessesFile,
      //           "dataResultingFile",
      //           true,
      //           'csv'
      //       ),
      // },
      {
        label: "Excluir",
        icon: <Icon as={MdDelete} boxSize={6} style={{ marginLeft: "8px" }} />,
        actionName: "download-resulting-file",
        labelOnDisable: "Agaurde o fim do processamento para excluir",
        disabledOn: (file: ProcessesFile) => file.status === "inProgress",
        action: ({ processesFile }) => {
          selectFile(processesFile);
          onDeletionOpen();
        },
      },
    ],
    [isUserFetched, userData]
  );

  useEffect(() => {
    refetchProcessesFile().finally();
  }, []);

  const [nameOrRecordFilter, setNameOrRecordFilter] = useState<string>("");

  const downloadProcessesFile = async (
    idProcessesFile: number,
    fileKey: string,
    resulting?: boolean,
    format: string = "xlsx"
  ) => {
    const result = (await findFileById(
      idProcessesFile,
      resulting,
      format
    )) as any;
    const bytes = result.value[fileKey].data;
    downloadFileFromBuffer(bytes, result.value.fileName);
  };

  const downloadResultingFile = async (
    idProcessesFile: number,
    originalFileName: string
  ) => {
    const result = await generateResultingFile(idProcessesFile);

    if (result.type === "error") {
      toast({
        id: "generate-result-file-error",
        title: "Erro ao gerar arquivo resultado.",
        status: "error",
        isClosable: true,
      });
      return;
    }

    downloadFileFromBuffer(
      result.value.data,
      replaceFileExtension(originalFileName, "_resultado.xlsx")
    );
  };

  const [
    processesFileTablePaginationInfo,
    setProcessesFileTablePaginationInfo,
  ] = useState<{
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  }>();

  const [processesFileTableRows, setProcessesFileTableRows] = useState<
    TableRow<ProcessesFile>[]
  >([]);

  const [rawFiles, setRawFiles] = useState<ProcessesFile[]>([]);

  const [isFetchingFiles, setIsFetchingFiles] = useState<boolean>(true);

  const refetchProcessesFile = async (
    selectedPage?: { selected: number },
    nameOrRecordFilterParam = nameOrRecordFilter
  ) => {
    const offset = selectedPage ? selectedPage.selected * 10 : 0;
    setIsFetchingFiles(true);
    const result = await findAllPaged(
      { offset, limit: 10 },
      nameOrRecordFilterParam
    );
    const value = result.value as { data: ProcessesFile[]; pagination: any };
    if (result && result.type === "success") {
      const { data, pagination } = value;
      setProcessesFileTablePaginationInfo(pagination);
      setRawFiles(data);
      const rows = (data || []).map((processesFile: any) => {
        const status = getProcessesFileStatusPt(processesFile.status);
        return {
          name: processesFile.name || processesFile.fileName,
          status: <Text color={status.color}>{status.text}</Text>,
          createdAt: formatDateTimeToBrazilian(processesFile.createdAt),
          message: (
            <>
              {processesFile.message ? (
                processesFile.message.split("\n").map((msg: string) => (
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
          importedItemsCount: (
            <Text align="center">
              {processesFile.status === "imported"
                ? processesFile.importedItemsCount
                : "-"}
            </Text>
          ),
          errorItemsCount: (
            <Text align="center">
              {processesFile.status === "imported"
                ? processesFile.errorItemsCount
                : "-"}
            </Text>
          ),
          processesFileTableActions,
          actionsProps: {
            processesFile,
          },
        };
      });
      setProcessesFileTableRows(rows as any);
    }
    setIsFetchingFiles(false);
  };

  const getProcessesFileStatusPt = (fileStatus: string) => {
    return {
      waiting: { text: "Aguardando processamento", color: "black" },
      error: { text: "Erro", color: "red" },
      inProgress: { text: "Processando", color: "#f5ad42" },
      imported: { text: "Importado", color: "green" },
      canceled: { text: "Cancelado", color: "gray" },
    }[fileStatus] as { text: string; color: string };
  };

  const replaceFileExtension = (fileName: string, newExtension: string) => {
    const fileNameParts = fileName.split(".");
    fileNameParts.pop();
    fileNameParts.push(newExtension);
    return fileNameParts.join(".");
  };

  return (
    <>
      <Flex w="50%" flexDir="column" gap="3" mb="4">
        <Flex flexDirection="column" gap="2">
          <Text fontSize="30px" fontWeight="semibold">
            Lotes
          </Text>
          <Flex
            width="200%"
            justifyContent="space-between"
            gap="2"
            flexWrap="wrap"
            mt="25px"
          >
            <Flex
              w="100%"
              justifyContent="flex-start"
              alignItems="center"
              gap="2"
              flexWrap="wrap"
            >
              <Button
                size="md"
                fontSize="md"
                colorScheme="green"
                onClick={onImportationOpen}
              >
                <Icon
                  as={FaFileUpload}
                  boxSize={4}
                  style={{ marginRight: "8px" }}
                />{" "}
                Importar lote
              </Button>
              <a
                href={template.templatexlsx}
                download="Modelo_Importacao_Capju.xlsx"
                style={{ textDecoration: "none" }}
              >
                <Button variant="outline" colorScheme="black">
                  <Icon
                    as={FaFileExcel}
                    boxSize={4}
                    style={{ marginRight: "8px" }}
                  />{" "}
                  Modelo excel
                </Button>
              </a>
              <a
                href={template.templatecsv}
                download="Modelo_Importacao_Capju.csv"
                style={{ textDecoration: "none" }}
              >
                <Button
                  variant="outline"
                  colorScheme="black"
                  style={{ marginLeft: "2px" }}
                  title="Baixar modelo csv"
                >
                  <Icon
                    as={FaFileCsv}
                    boxSize={4}
                    style={{ marginRight: "8px" }}
                  />{" "}
                  Modelo csv
                </Button>
              </a>
              <chakra.form
                onSubmit={(e) => {
                  e.preventDefault();
                  refetchProcessesFile().finally();
                }}
                width="50%"
                display="flex"
                flexDirection="row"
                alignItems="center"
                gap="2"
                ml="auto"
              >
                <Input
                  color="black"
                  placeholder="Pesquisar lotes por nome, arquivo ou processo"
                  variant="filled"
                  onChange={({ target }) => setNameOrRecordFilter(target.value)}
                  value={nameOrRecordFilter}
                  css={{
                    "&, &:hover, &:focus": {
                      background: "white",
                    },
                  }}
                />
                <Button
                  aria-label="botão de limpeza"
                  colorScheme="green"
                  justifyContent="center"
                  title={nameOrRecordFilter && "Limpar filtro"}
                  isDisabled={!nameOrRecordFilter}
                  onClick={() => {
                    setNameOrRecordFilter("");
                    refetchProcessesFile(undefined, "").finally();
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
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <DataTable
        style={{ tableLayout: "fixed", maxWidth: "100%" }}
        width="100%"
        size="lg"
        data={processesFileTableRows}
        rawData={rawFiles}
        columns={processesFileTableColumns}
        isDataFetching={!isUserFetched || isFetchingFiles}
        emptyTableMessage="Não foram encontrados lotes"
      />
      {processesFileTablePaginationInfo?.totalPages ? (
        <Pagination
          pageCount={processesFileTablePaginationInfo?.totalPages}
          onPageChange={refetchProcessesFile}
        />
      ) : null}
      {selectedFile && isDeletionOpen && (
        <DeletionModal
          processesFile={selectedFile}
          isOpen={isDeletionOpen}
          onClose={onDeletionClose}
          refetchProcessesFile={refetchProcessesFile}
        />
      )}
      {selectedFile && isVisualizationOpen && (
        <VisualizationItemsModal
          processesFile={selectedFile}
          isOpen={isVisualizationOpen}
          onClose={() => {
            onVisualizationClose();
            refetchProcessesFile().finally();
          }}
        />
      )}
      <ImportProcessesModal
        isOpen={isImportationOpen}
        onClose={onImportationClose}
        afterSubmission={refetchProcessesFile}
      />
    </>
  );
}
