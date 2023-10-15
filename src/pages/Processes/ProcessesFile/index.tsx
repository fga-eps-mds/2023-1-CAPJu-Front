import {createColumnHelper} from '@tanstack/react-table';
import {useEffect, useMemo, useState} from 'react';
import {Icon, SearchIcon, ViewIcon} from '@chakra-ui/icons';
import {FaDownload, FaFileDownload, FaFileUpload} from 'react-icons/fa';
import { MdDelete} from 'react-icons/md';
import {Button, chakra, Flex, Input, Text, useDisclosure} from '@chakra-ui/react';
import {Pagination} from '../../../components/Pagination';
import {findAllPaged, findFileById} from '../../../services/processManagement/processesFile';
import {formatDateTimeToBrazilian} from '../../../utils/dates';
import {DataTable} from '../../../components/DataTable';
import {DeletionModal} from './DeletionModal';
import {VisualizationItemsModal} from "./VisualizationModal";
import {ImportProcessesModal} from "../ImportProcessesModal";

function ProcessesFileComponent (props: any) {

    const { isUserFetched, userData, isProcessesFileTabEnabled } = props;

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
            cell: (info) => {
                console.log(info);
                return info;
            },
            header: "Status",
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
    ]

    const [selectedFile, selectFile] = useState<ProcessesFile>();

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
                icon: <ViewIcon boxSize={6} />,
                actionName: "see-items",
                labelOnDisable: 'Arquivo não importado ',
                disabledOn: (file: ProcessesFile) => file.status !== 'imported',
                action: ({ processesFile }) => {
                    selectFile(processesFile);
                    onVisualizationOpen();
                },
            },
            {
                label: "Download Arquivo Original",
                icon: <Icon as={FaFileDownload} boxSize={6} style={{ marginLeft: '8px' }}/>,
                actionName: "download-original-file",
                disabled: false,
                action: async ({ processesFile }) => downloadProcessesFile(processesFile.idProcessesFile, 'dataOriginalFile'),
            },
            {
                label: "Download Arquivo Resultado",
                icon: <Icon as={FaDownload} boxSize={6} style={{ marginLeft: '8px' }} />,
                actionName: "download-resulting-file",
                labelOnDisable: 'Arquivo não importado',
                disabledOn: (file: ProcessesFile) => ['waiting', 'inProgress', 'error'].includes(file.status),
                action: async ({ processesFile }) => downloadProcessesFile(processesFile.idProcessesFile, 'dataResultingFile', true),
            },
            {
                label: "Excluir",
                icon: <Icon as={MdDelete} boxSize={6} style={{ marginLeft: '8px' }} />,
                actionName: "download-resulting-file",
                labelOnDisable: 'Agaurde o fim do processamento para excluir',
                disabledOn: (file: ProcessesFile) => file.status === 'inProgress',
                action: ({ processesFile }) => {
                    selectFile(processesFile);
                    onDeletionOpen();
                },
            },
        ],
        [isUserFetched, userData]
    )

    useEffect(() => {
        if(isProcessesFileTabEnabled) {
            refetchProcessesFile().finally();
        }
    }, [isProcessesFileTabEnabled]);


    const [nameOrRecordFilter, setNameOrRecordFilter] = useState<string>('');

    const downloadProcessesFile = async (idProcessesFile: number, fileKey: string, resulting?: boolean)=> {

        const result = await findFileById(idProcessesFile, resulting) as any;
        const bytes = result.value[fileKey].data;

        const ab = new ArrayBuffer(bytes.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < bytes.length; i += 1) {
            ia[i] = bytes[i];
        }

        const blob = new Blob([ia], {type: "application/octet-stream"});
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.style.display = 'none';
        a.href = url;
        a.download = result.value.fileName;

        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    }

    const [processesFileTablePaginationInfo, setProcessesFileTablePaginationInfo] = useState<{ currentPage: number, totalPages: number, totalRecords: number }>();

    const [processesFileTableRows, setProcessesFileTableRows] = useState<TableRow<ProcessesFile>[]>([]);

    const [rawFiles, setRawFiles] = useState<ProcessesFile[]>([]);

    const refetchProcessesFile = async (selectedPage?: { selected: number }) => {
        const offset = selectedPage ? selectedPage.selected * 10 : 0;
        const result = await findAllPaged({ offset, limit: 10 }, nameOrRecordFilter);
        const value = result.value as  { data: ProcessesFile[], pagination: any };
        if (result && result.type === 'success') {
            const { data, pagination } = value;
            setProcessesFileTablePaginationInfo(pagination);
            setRawFiles(data);
            const rows = (data || []).map(processesFile => {
                const status = getProcessesFileStatusPt(processesFile.status);
                return {
                    name: processesFile.name || processesFile.fileName,
                    status: <Text color={status.color}>{status.text}</Text>,
                    createdAt: formatDateTimeToBrazilian(processesFile.createdAt),
                    message: processesFile.message || '-',
                    processesFileTableActions,
                    actionsProps: {
                        processesFile,
                    },
                };
            });
            setProcessesFileTableRows(rows as any);
        }
    };

    const getProcessesFileStatusPt = (fileStatus: string) => {
        return {
            waiting: { text: 'Aguardando processamento', color: 'black' },
            error:  { text: 'Erro', color: 'red' },
            inProgress: { text: 'Processando', color: '#f5ad42' },
            imported: { text: 'Importado', color: 'green' },
            canceled: { text: 'Cancelado', color: 'gray' },
        }[fileStatus] as { text: string, color: string }
    }
    
    return (
        <>
            <Flex w="50%" flexDir="column" gap="3" mb="4" color="white">
                <Flex flexDirection="column" gap="2">
                    <Text fontSize="30px" fontWeight="semibold" color="white">
                        Lotes
                    </Text>
                    <Flex width="200%"  justifyContent="space-between" gap="2" flexWrap="wrap" mt="25px">
                        <Flex w="100%" justifyContent="flex-start" alignItems="center" gap="2" flexWrap="wrap">
                            <Button
                                size="md"
                                fontSize="md"
                                colorScheme="green"
                                onClick={onImportationOpen}>
                                <Icon as={FaFileUpload} boxSize={4} style={{ marginRight: '8px' }}/> Importar lote
                            </Button>
                            <chakra.form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    refetchProcessesFile().finally()
                                }}
                                width="50%"
                                display="flex"
                                flexDirection="row"
                                alignItems="center"
                                gap="2"
                                ml="auto">
                                <Input
                                    color="black"
                                    placeholder="Pesquisar lotes por nome, arquivo ou processo"
                                    variant="filled"
                                    onChange={({ target }) => setNameOrRecordFilter(target.value)}
                                    css={{
                                        "&, &:hover, &:focus": {
                                            background: "white",
                                        },
                                    }}
                                />
                                <Button
                                    aria-label="botão de busca"
                                    colorScheme="green"
                                    justifyContent="center"
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
                maxWidth='unset'
                width='100%'
                size="lg"
                data={processesFileTableRows}
                rawData={rawFiles}
                columns={processesFileTableColumns}
                isDataFetching={!isUserFetched}
                emptyTableMessage="Não foram encontrados lotes"
            />
            {![undefined, 0].includes(processesFileTablePaginationInfo?.totalPages) ? (
                <Pagination
                    pageCount={processesFileTablePaginationInfo?.totalPages}
                    onPageChange={refetchProcessesFile}
                />
            ) : null}
            {selectedFile && (
                <DeletionModal
                    processesFile={selectedFile}
                    isOpen={isDeletionOpen}
                    onClose={onDeletionClose}
                    refetchProcessesFile={refetchProcessesFile}
                />
            )}
            {selectedFile && (
                <VisualizationItemsModal
                    processesFile={selectedFile}
                    isOpen={isVisualizationOpen}
                    onClose={onVisualizationClose}
                />
            )}
            <ImportProcessesModal
                isOpen={isImportationOpen}
                onClose={onImportationClose}
                afterSubmission={refetchProcessesFile} />
        </>
    )

}

export default ProcessesFileComponent;