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
import { deleteStage } from "services/processManagement/stage";
import { useLoading } from "hooks/useLoading";

interface DeletionModalProps {
  stage: Stage;
  isOpen: boolean;
  onClose: () => void;
  refetchStages: () => void;
}

export function DeletionModal({
  stage,
  isOpen,
  onClose,
  refetchStages,
}: DeletionModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  const handleDeleteStage = async () => {
    handleLoading(true);
    const res = await deleteStage(stage.idStage);
    if (res.type === "success") {
      refetchStages();
      toast({
        id: "delete-stage-success",
        title: "Sucesso!",
        description: "Etapa excluída com sucesso!",
        status: "success",
      });
    } else {
      toast({
        id: "delete-stage-error",
        title: "Erro na exclusão da etapa.",
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
        <ModalHeader>Excluir etapa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja excluir a etapa{" "}
            <strong>{stage?.name}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleDeleteStage()}
            size="sm"
          >
            Excluir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
