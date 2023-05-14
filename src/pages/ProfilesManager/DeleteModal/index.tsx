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

import { deleteUser } from "services/user";
import { useLoading } from "hooks/useLoading";

interface DeleteModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

export function DeleteModal({
  user,
  isOpen,
  onClose,
  refetch,
}: DeleteModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  async function handleDeleteUser() {
    handleLoading(true);

    try {
      await deleteUser(user.cpf);
      toast({
        id: "delete-user-success",
        title: "Usuário removido",
        description: `O usuário ${user.fullName} foi deletado com sucesso.`,
        status: "success",
        isClosable: true,
      });
    } catch {
      toast({
        id: "delete-user-error",
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
        <ModalHeader>Deletar Usuário</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja deletar o usuário{" "}
            <strong>{user.fullName}</strong>, do perfil{" "}
            <strong>{user.role}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleDeleteUser()}
            size="sm"
          >
            Deletar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
