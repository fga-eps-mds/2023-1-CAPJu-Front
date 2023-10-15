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
} from "@chakra-ui/react";

interface FinalizationModalProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  handleFinishProcess: () => void;
}

export function FinalizationModal({
  process,
  isOpen,
  onClose,
  handleFinishProcess,
}: FinalizationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent mx="auto" my="auto">
        <ModalHeader fontSize="19px">Finalizar processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="19px">
            Tem certeza que deseja finalizar o processo{" "}
            <strong>{process?.nickname}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={handleFinishProcess}>
            Finalizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
