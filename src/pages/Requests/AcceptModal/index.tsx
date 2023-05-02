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

import { acceptRequest } from "services/user";
import { useLoading } from "hooks/useLoading";

interface AcceptModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

export function AcceptModal({
  user,
  isOpen,
  onClose,
  refetch,
}: AcceptModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  async function handleAcceptUser() {
    handleLoading(true);

    try {
      await acceptRequest(user.cpf);
      toast({
        id: "accept-request-success",
        title: "Usuário aceito",
        description: `O usuário ${user.fullName} foi aceito com sucesso.`,
        status: "success",
        isClosable: true,
      });
    } catch {
      toast({
        id: "accept-request-error",
        title: `Erro ao aceitar ${user.fullName}`,
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
            Tem certeza que deseja aceitar o usuário{" "}
            <strong>{user.fullName}</strong> como <strong>{user.role}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            onClick={() => handleAcceptUser()}
            size="sm"
          >
            Aceitar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
