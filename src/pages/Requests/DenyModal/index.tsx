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
  useToast,
} from "@chakra-ui/react";

import { denyRequest } from "services/user";
import { useLoading } from "hooks/useLoading";

interface DenyModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

export function DenyModal({ user, isOpen, onClose, refetch }: DenyModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  async function handleDenyUser() {
    handleLoading(true);

    try {
      await denyRequest(user.cpf);
      toast({
        id: "deny-request-success",
        title: "Usuário recusado",
        description: `A solicitação do usuário foi recusada com sucesso.`,
        status: "success",
        isClosable: true,
      });
    } catch {
      toast({
        id: "deny-request-error",
        title: `Erro ao remover ${user.fullName}`,
        description: "Favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    }
    onClose();
    refetch();
    handleLoading(false);
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
