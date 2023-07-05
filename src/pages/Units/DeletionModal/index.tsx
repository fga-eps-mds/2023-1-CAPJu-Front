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
import { deleteUnit } from "services/units";
import { useLoading } from "hooks/useLoading";

interface DeletionModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
  refetchUnits: () => void;
}

export function DeletionModal({
  unit,
  isOpen,
  onClose,
  refetchUnits,
}: DeletionModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  const handleDeleteUnit = async () => {
    handleLoading(true);
    const res = await deleteUnit(unit.idUnit);
    if (res.type === "success") {
      refetchUnits();
      toast({
        id: "delete-unit-success",
        title: "Sucesso!",
        description: "Unidade excluída com sucesso!",
        status: "success",
      });
    } else {
      toast({
        id: "delete-unit-error",
        title: "Erro na exclusão da unidade.",
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
        <ModalHeader>Excluir unidade</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja excluir a unidade{" "}
            <strong>{unit?.name}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleDeleteUnit()}
            size="sm"
          >
            Excluir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
