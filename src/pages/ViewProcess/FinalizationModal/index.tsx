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
      <ModalContent>
        <ModalHeader>Finalizar Processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja finalizar o processo{" "}
            <strong>{process?.nickname}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={handleFinishProcess} size="sm">
            Finalizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
