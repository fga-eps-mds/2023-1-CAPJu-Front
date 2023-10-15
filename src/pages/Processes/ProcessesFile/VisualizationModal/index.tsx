import {
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text, useDisclosure,
} from '@chakra-ui/react';
import {createColumnHelper} from '@tanstack/react-table';
import {Icon, ViewIcon} from '@chakra-ui/icons';
import {useEffect, useMemo, useState} from "react";
import {FaEdit} from "react-icons/fa";
import {DataTable} from '../../../../components/DataTable';
import {findAllItemsPaged} from "../../../../services/processManagement/processesFile";
import {Pagination} from '../../../../components/Pagination';
import {CreationModal} from "../../CreationModal";

interface VisualizationItemsModalProps {
    processesFile: ProcessesFile;
    isOpen: boolean;
    onClose: () => void;
}

export function VisualizationItemsModal({ processesFile, isOpen, onClose }: VisualizationItemsModalProps) {

    const {
        isOpen: isCreationOpen,
        onOpen: onCreationOpen,
        onClose: onCreationClose,
    } = useDisclosure();

    const tableColumnHelper = createColumnHelper<TableRow<any>>();

    const [recordSelected, setRecordSelected] = useState<string>('');
    const [nicknameSelected, setNicknameSelected] = useState<string>('');

    // @ts-ignore
    const tableActions = useMemo<TableAction[]>(
        () => [
            {
                label: "Visualizar Processo",
                icon: <ViewIcon boxSize={6} />,
                isNavigate: true,
                actionName: "see-items",
                labelOnDisable: 'Item não importado',
                disabledOn: (fileItem: ProcessesFileItem) => fileItem.status !== 'imported' || !fileItem.idProcess
            },
            {
                label: "Importar manualmente",
                icon: <Icon as={FaEdit} boxSize={6} style={{ marginLeft: '8px' }}/>,
                actionName: "see-items",
                labelOnDisable: 'Item já importado',
                action: ({ processesFileItem }) => {
                    onCreationOpen();
                    setRecordSelected(processesFileItem.record);
                    setNicknameSelected(processesFileItem.nickname);
                },
                disabledOn: (fileItem: ProcessesFileItem) => fileItem.status !== 'error' || !fileItem.idProcess
            },
        ],
        [processesFile]
    )

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
                console.log(info);
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
    ]

    const getProcessesFileItemStatusPt = (fileStatus: string) => {
        return {
            error:  { text: 'Erro', color: 'red' },
            imported: { text: 'Importado', color: 'green' },
        }[fileStatus] as { text: string, color: string }
    }

    const [paginationInfo, setProcessesFileTablePaginationInfo] = useState<{ currentPage: number, totalPages: number, totalRecords: number }>();

    const [isItemsFetched, setIsItemsFetched] = useState<boolean>(false);

    const [rawItems, setRawItems] = useState<ProcessesFileItem[]>([]);

    const [tableRows, setTableRows] = useState<TableRow<ProcessesFileItem>[]>([]);

    const refetchItems = async (selectedPage?: { selected: number }) => {
        setIsItemsFetched(false);
        const offset = selectedPage ? selectedPage.selected * 10 : 0;
        const result = await findAllItemsPaged(processesFile.idProcessesFile, { offset, limit: 10 });
        const value = result.value as { data: ProcessesFileItem[], pagination: any };
        if (result && result.type === 'success') {
            const { data, pagination } = value;
            setProcessesFileTablePaginationInfo(pagination);
            setRawItems(data);
            const rows = (data || []).map(processesFileItem  => {
                // @ts-ignore
                // eslint-disable-next-line no-return-assign
                Object.keys(processesFileItem).forEach(key => !processesFileItem[key] && (processesFileItem[key] = '-'));
                const status = getProcessesFileItemStatusPt(processesFileItem.status);
                return {
                    ...processesFileItem,
                    status: <Text color={status.color}>{status.text}</Text>,
                    tableActions,
                    actionsProps: {
                        processesFileItem,
                        pathname: processesFileItem.idProcess && `/processos/${processesFileItem.idProcess}`,
                        state: {
                            process: { idProcess: processesFileItem.idProcess, idFlow: (processesFileItem as any )['generatedProcessInfo.idFlow'] }
                        }
                    },
                };
            });
            setTableRows(rows as any);
            setIsItemsFetched(true);
        }
    };

    useEffect(() => {
        if(processesFile?.idProcessesFile) {
            refetchItems().finally();
        }
    }, [processesFile]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl" colorScheme="red" >
            <ModalOverlay backdropFilter="blur(12px)" />
            <ModalContent backgroundColor="#1E2952">
                <ModalHeader color="white">Itens lote - {processesFile?.name || processesFile?.fileName}</ModalHeader>
                <ModalCloseButton color="white" />
                <ModalBody>
                    <DataTable
                        maxWidth='unset'
                        width='100%'
                        size="lg"
                        data={tableRows}
                        rawData={rawItems}
                        columns={tableColumns}
                        isDataFetching={!isItemsFetched}
                        emptyTableMessage={`Não foram itens para o lote ${processesFile.name || processesFile.fileName}.`}
                    />
                    {![undefined, 0].includes(paginationInfo?.totalPages) ? (
                        <Pagination
                            pageCount={paginationInfo?.totalPages as number}
                            onPageChange={refetchItems}
                        />
                    ) : null}
                    {
                        (recordSelected || nicknameSelected) &&
                        <CreationModal
                            isOpen={isCreationOpen}
                            onClose={onCreationClose}
                            recordParam={recordSelected}
                            nicknameParam={nicknameSelected}
                            afterSubmission={() => onCreationOpen()}
                        />
                    }
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}