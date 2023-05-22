import {
  Card,
  CardBody,
  Button,
  chakra,
  useToast,
  Text,
  Stack,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";

import { Input } from "components/FormFields";
import { PrivateLayout } from "layouts/Private";
import { useLoading } from "hooks/useLoading";
import { updateUserPassword } from "services/user";
import { useAuth } from "hooks/useAuth";

type FormValues = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
};

const validationSchema = yup.object({
  oldPassword: yup.string().required("Informe sua senha atual"),
  newPassword: yup.string().required("Informe sua nova senha"),
  newPasswordConfirmation: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Suas senhas não batem.")
    .required("Confirme sua nova senha"),
});

function PasswordEdition() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();
  const { handleLoading } = useLoading();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (data) => {
    handleLoading(true);

    if (!user) {
      handleLogout();
      return;
    }

    const res = await updateUserPassword(data, user.cpf);

    if (res.type === "success") {
      handleLoading(false);
      navigate("/editar-conta");
      toast({
        id: "login-success",
        title: "Sucesso!",
        description: "Seu senha foi atualizada.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "login-error",
      title: "Erro na edição de senha",
      description: res.error?.message,
      status: "error",
      isClosable: true,
    });
  });

  return (
    <PrivateLayout>
      <Card p="10" w="90%" maxW="454" mt="16" mb={["28", 0]}>
        <CardBody
          w="100%"
          p={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="3"
        >
          <Text fontSize={["lg", "xl"]} fontWeight="semibold">
            Edite seu email
          </Text>
          <chakra.form
            w="100%"
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="start"
            gap="3"
            onSubmit={onSubmit}
          >
            <Input
              type="password"
              label="Senha atual"
              placeholder="Informe sua senha"
              errors={errors.oldPassword}
              {...register("oldPassword")}
            />
            <Input
              type="password"
              label="Nova senha"
              placeholder="Crie uma nova senha"
              errors={errors.newPassword}
              infoText={
                <Stack spacing="0">
                  <Text>Deve conter ao menos um dígito;</Text>
                  <Text>Deve conter ao menos uma letra maiúscula;</Text>
                  <Text>Deve conter ao menos 6 caracteres;</Text>
                </Stack>
              }
              {...register("newPassword")}
            />
            <Input
              type="password"
              label="Confirmação de senha"
              placeholder="Confirme sua nova senha"
              errors={errors.newPasswordConfirmation}
              {...register("newPasswordConfirmation")}
            />
            <Button colorScheme="green" w="100%" type="submit">
              Salvar
            </Button>
          </chakra.form>
          <Button
            w="100%"
            onClick={() => navigate("/editar-conta", { replace: true })}
          >
            Voltar
          </Button>
        </CardBody>
      </Card>
    </PrivateLayout>
  );
}

export default PasswordEdition;
