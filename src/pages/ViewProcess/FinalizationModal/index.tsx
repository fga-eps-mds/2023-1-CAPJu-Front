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
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Concluir Processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja concluir o processo{" "}
            <strong>{process?.nickname}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={() => {
              handleFinishProcess();
              onClose();
            }}
            size="sm"
          >
            Concluir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
