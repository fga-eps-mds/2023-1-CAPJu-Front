import { useMemo } from "react";
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
  Text,
} from "@chakra-ui/react";
import { useQuery } from "react-query";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { getAllRoles, updateUserRole } from "services/user";
import { Select } from "components/FormFields/Select";
import { useLoading } from "hooks/useLoading";

type FormValues = {
  idRole: string;
};

const validationSchema = yup.object({
  idRole: yup.string().required("Escolha um perfil"),
});

interface EditionModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  refetch: () => void;
}

export function EditionModal({
  user,
  isOpen,
  onClose,
  refetch,
}: EditionModalProps) {
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
  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: getAllRoles,
    onError: () => {
      toast({
        id: "roles-error",
        title: "Erro ao carregar perfis",
        description: "Houve um erro ao carregar perfis, tentando novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const roles = useMemo(() => {
    return (
      rolesData?.value?.map((role) => {
        return { label: role.name, value: role.idRole };
      }) || []
    );
  }, [rolesData]);

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
        <ModalHeader>Atualizar Perfil de Usuário</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Text mb="2">
              Selecione perfil para <strong>{user.fullName}</strong>{" "}
            </Text>
            <Select
              placeholder="Novo perfil de usuário"
              errors={errors.idRole}
              options={roles}
              defaultValue={user.idRole}
              {...register("idRole")}
            />
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button colorScheme="blue" type="submit" size="sm">
              Salvar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}
