import React from "react";
import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  chakra,
  useDisclosure,
  Button,
  Stack,
  useToast,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "components/FormFields";
import { updateUserEmailAndPassword } from "services/user";
import { useLoading } from "hooks/useLoading";
import { useAuth } from "hooks/useAuth";

type ModalProps = React.PropsWithChildren<{
  user: User;
}>;

type FormValues = {
  email: string;
  password: string;
  passwordConfirmation: string;
};

const validationSchema = yup.object({
  email: yup.string().email("E-mail inválido").required("Preencha seu E-mail"),
  password: yup
    .string()
    .required("Preencha sua Senha")
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z$*&@#]{6,}$/,
      "Senha não cumpre critérios"
    ),
  passwordConfirmation: yup
    .string()
    .required("Confirme sua senha")
    .oneOf([yup.ref("password")], "Suas senhas não batem"),
});

export function DataUpdateModal({ user }: ModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { handleLogin } = useAuth();
  const { isOpen, onClose, onOpen } = useDisclosure({
    defaultIsOpen: true,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (formData) => {
    const data = {
      email: formData.email,
      password: formData.password,
    };
    const userUpdated = await updateUserEmailAndPassword(data, user.cpf);
    if (userUpdated.type === "success") {
      handleLoading(false);
      const credentials = {
        cpf: userUpdated.value.cpf,
        password: formData.password,
      };
      await handleLogin(credentials);
      reset();
      onClose();
      toast({
        id: "update-user-success",
        title: "Sucesso!",
        description: "Dados do Administrador atualizados com sucesso.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "update-user-error",
      title: "Erro ao atualizar dados do Administrador",
      description: userUpdated.error?.message,
      status: "error",
      isClosable: true,
    });
  });

  return (
    <Modal isOpen={isOpen} onClose={onOpen} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center">Editar dados</ModalHeader>
        <chakra.form onSubmit={onSubmit}>
          <ModalBody display="flex" flexDir="column" gap="3">
            <Text>
              Por questões de segurança exigimos a alteração do email e da senha
              do usuário administrador em seu primeiro acesso.
            </Text>
            <Input
              type="text"
              label="E-mail"
              placeholder="exemplo@mail.com"
              errors={errors.email}
              {...register("email")}
            />
            <Input
              type="password"
              label="Senha"
              placeholder="Crie uma senha"
              errors={errors.password}
              infoText={
                <Stack spacing="0">
                  <Text>Deve conter ao menos um dígito;</Text>
                  <Text>Deve conter ao menos uma letra maiúscula;</Text>
                  <Text>Deve conter ao menos 6 caracteres;</Text>
                </Stack>
              }
              {...register("password")}
            />
            <Input
              type="password"
              label="Confirmação de senha"
              placeholder="Confirme uma senha"
              errors={errors.passwordConfirmation}
              {...register("passwordConfirmation")}
            />
          </ModalBody>
          <ModalFooter gap="2">
            <Button colorScheme="blue" type="submit" size="sm">
              Salvar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}

export default DataUpdateModal;
