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

interface ReturnModalProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  handleReturnProcess: () => void;
}

export function ReturnModal({
  process,
  isOpen,
  onClose,
  handleReturnProcess,
}: ReturnModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Retroceder Processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja retroceder o processo{" "}
            <strong>{process?.nickname}</strong>? Retroceder o processo vai
            afetar permanentemente a <strong>data de vencimento</strong> da
            etapa.
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={handleReturnProcess} size="sm">
            Retroceder
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
