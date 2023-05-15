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
  
  interface DeleteModalProps {
    unit: Unit;
    isOpen: boolean;
    onClose: () => void;
    refetchUnits: () => void;
  }
  
  export function DeleteModal({
    unit,
    isOpen,
    onClose,
    refetchUnits,
  }: DeleteModalProps) {
    const toast = useToast();
    const { handleLoading } = useLoading();
  
    const handleDeleteUnit = async () => {
      handleLoading(true);
      const res = await deleteUnit(unit.idUnit.toString());
      if (res.type === "success") {
        refetchUnits();
        toast({
          id: "delete-unit-success",
          title: "Sucesso!",
          description: "Unidade deletada com sucesso!",
          status: "success",
        });
      } else {
        toast({
          id: "delete-unit-error",
          title: "Erro na deleção da unidade.",
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
  