import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
import { deleteProcess } from "services/processManagement/processes";
import { useLoading } from "hooks/useLoading";

interface DeletionModalProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  refetchStages: () => void;
}

export function DeletionModal({
  process,
  isOpen,
  onClose,
  refetchStages,
}: DeletionModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  const handleDeleteProcess = async () => {
    handleLoading(true);
    const res = await deleteProcess(process?.idProcess);
    if (res.type === "success") {
      refetchStages();
      toast({
        id: "delete-process-success",
        title: "Sucesso!",
        description: "Processo excluído com sucesso!",
        status: "success",
      });
    } else {
      toast({
        id: "delete-process-error",
        title: "Erro na exclusão do processo.",
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
            Tem certeza que deseja excluir o registro{" "}
            <strong>{process?.record}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleDeleteProcess()}
            size="sm"
          >
            Excluir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
