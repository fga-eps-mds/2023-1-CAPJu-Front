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
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewModal({ user, isOpen, onClose }: ViewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Visualizar Solicitação</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            <strong>Nome Completo:</strong> {user.fullName}
          </Text>
          <Text>
            <strong>CPF:</strong> {user.cpf}
          </Text>
          <Text>
            <strong>Email:</strong> {user.email}
          </Text>
          <Text>
            <strong>Perfil:</strong> {user.role}
          </Text>
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
