import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import ProcessesFileComponent from "../index";

interface VisualizationFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VisualizationFilesModal({
  isOpen,
  onClose,
}: VisualizationFilesModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" colorScheme="red">
      <ModalOverlay backdropFilter="blur(12px)" />
      <ModalContent backgroundColor="#E2E8F0">
        <ModalCloseButton />
        <ModalBody>
          <ProcessesFileComponent />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
