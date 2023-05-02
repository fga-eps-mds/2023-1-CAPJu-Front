import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useToast,
  chakra,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { updateUserRole } from "services/user";
import { Select } from "components/FormFields/Select";
import { useLoading } from "hooks/useLoading";
import { roleOptions } from "utils/roles";

type FormValues = {
  idRole: string;
};

const validationSchema = yup.object({
  idRole: yup.string().required("Escolha um perfil"),
});

interface EditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

export function EditModal({ user, isOpen, onClose, refetch }: EditModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (formData) => {
    handleLoading(true);

    try {
      const res = await updateUserRole(user.cpf, Number(formData.idRole));

      if (res.type === "error") {
        throw new Error(res.error.message);
      }

      toast({
        id: "edit-user-success",
        title: "Usuário editado",
        description: `O usuário ${user.fullName} teve seu perfil atualizado.`,
        status: "success",
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        id: "edit-user-error",
        title: `Erro ao atualizar perfil de ${user.fullName}`,
        description: err?.message || "Favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    }

    onClose();
    refetch();
    handleLoading(false);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Deletar Usuário</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Select
              label="Selecione o Perfil"
              placeholder={`Novo perfil de ${user.fullName}`}
              errors={errors.idRole}
              options={roleOptions(true)}
              defaultValue={user.idRole}
              {...register("idRole")}
            />
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button colorScheme="red" type="submit" size="sm">
              Salvar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}
