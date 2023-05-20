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
import { deleteFlow } from "services/flows";
import { useLoading } from "hooks/useLoading";

interface DeletionModalProps {
  flow: Flow;
  isOpen: boolean;
  onClose: () => void;
  refetchFlows: () => void;
}

export function DeletionModal({
  flow,
  isOpen,
  onClose,
  refetchFlows,
}: DeletionModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  const handleDeleteStage = async () => {
    handleLoading(true);

    const res = await deleteFlow(flow.idFlow);

    if (res.type === "success") {
      refetchFlows();
      toast({
        id: "delete-flow-success",
        title: "Sucesso!",
        description: "Fluxo deletado com sucesso!",
        status: "success",
      });
    } else {
      toast({
        id: "delete-flow-error",
        title: "Erro na deleção da fluxo.",
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
        <ModalHeader>Excluir fluxo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja excluir o fluxo <strong>{flow?.name}</strong>
            ?
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
