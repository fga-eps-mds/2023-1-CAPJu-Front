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

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: string;
}

export function ViewModal({ isOpen, onClose, comment }: ViewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "md"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Observação completa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{comment}</Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
