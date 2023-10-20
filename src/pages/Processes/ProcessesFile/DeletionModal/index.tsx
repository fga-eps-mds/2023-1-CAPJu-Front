import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent, ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    useToast
} from "@chakra-ui/react";
import {useLoading} from '../../../../hooks/useLoading';
import {deleteById} from '../../../../services/processManagement/processesFile';

interface DeletionModalProps {
    processesFile: ProcessesFile;
    isOpen: boolean;
    onClose: () => void;
    refetchProcessesFile: () => void;
}

export function DeletionModal({processesFile, isOpen, onClose, refetchProcessesFile }: DeletionModalProps) {

    const toast = useToast();
    const { handleLoading } = useLoading();

    const handleDeleteProcessesFile = async () => {
        handleLoading(true);
        const res = await deleteById(processesFile?.idProcessesFile);
        if (res.type === "success") {
            await refetchProcessesFile();
            toast({
                id: "delete-process-success",
                title: "Sucesso!",
                description: "Lote excluído com sucesso",
                status: "success",
            });
        } else {
            toast({
                id: "delete-process-error",
                title: "Erro na exclusão do lote",
                description: res.error?.message,
                status: "error",
                isClosable: true,
            });
        }
        onClose();
        handleLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Excluir Processo</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        Tem certeza que deseja excluir este lote e todos os itens associados?
                    </Text>
                </ModalBody>
                <ModalFooter gap="2">
                    <Button variant="ghost" onClick={onClose} size="sm">
                        Cancelar
                    </Button>
                    <Button
                        colorScheme="red"
                        onClick={() => handleDeleteProcessesFile()}
                        size="sm">
                        Excluir
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}