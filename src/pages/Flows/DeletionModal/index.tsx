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
import { deleteFlow } from "services/processManagement/flows";
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
        description: "Fluxo excluído com sucesso!",
        status: "success",
      });
      setTimeout(() => {
        window.location.href = `${window.location.pathname}?deleteSuccess=1`;
      }, 500);
    } else {
      toast({
        id: "delete-flow-error",
        title: "Erro na exclusão do fluxo.",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }

    onClose();
    handleLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Excluir fluxo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text align="center">
            Tem certeza que deseja excluir o fluxo <strong>{flow?.name}</strong>
            ?
          </Text>
          <Text fontSize={15} fontStyle="italic" align="center">
            (esteja ciente que isto apagará todos os processos envolvidos nesse
            fluxo)
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
