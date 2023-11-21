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
  status === "archived" ? "Reativar" : "Interromper";

export function ArchivationModal({
  process,
  isOpen,
  onClose,
  handleUpdateProcessStatus,
}: ArchivationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]} isCentered>
      <ModalOverlay />
      <ModalContent mx="auto" my="auto">
        <ModalHeader fontSize="19px">{getArchiveStatus(process?.status)} processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody fontSize="19px">
          <Text>
            Tem certeza que deseja{" "}
            {process?.status === "archived" ? "reativar" : "interromper"} o
            processo <strong>{process?.nickname}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={handleUpdateProcessStatus}>
            {getArchiveStatus(process?.status)}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
