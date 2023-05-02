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

interface AdminsListProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function DenyModal({ user, isOpen, onClose }: AdminsListProps) {
  // const toast = useToast();
  // const { handleLoading } = useLoading();

  async function handleDenyUser() {
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Visualizar Administradores</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja recusar a solicitação do usuário{" "}
            <strong>{user.fullName}</strong> como <strong>{user.role}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={() => handleDenyUser()} size="sm">
            Recusar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
