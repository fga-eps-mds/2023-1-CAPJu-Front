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

interface ArchivationModalProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  handleUpdateProcessStatus: () => void;
}

const getArchiveStatus = (status: string) =>
  status === "archived" ? "Desarquivar" : "Arquivar";

export function ArchivationModal({
  process,
  isOpen,
  onClose,
  handleUpdateProcessStatus,
}: ArchivationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{getArchiveStatus(process?.status)} Processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja{" "}
            {process?.status === "archived" ? "desarquivar" : "arquivar"} o
            processo <strong>{process?.nickname}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={handleUpdateProcessStatus}
            size="sm"
          >
            {getArchiveStatus(process?.status)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
