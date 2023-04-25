import {
  Card,
  CardBody,
  Button,
  chakra,
  useToast,
  Text,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";

import { Input } from "components/FormFields";
import { PrivateLayout } from "layouts/Private";
import { useLoading } from "hooks/useLoading";
import { updateUser } from "services/user";
import { useAuth } from "hooks/useAuth";

type FormValues = {
  email: string;
  newEmail: string;
};

const validationSchema = yup.object({
  email: yup
    .string()
    .required("Informe seu e-mail atual")
    .email("Endereço de email inválido"),
  newEmail: yup
    .string()
    .required("Informe um novo endereço de email")
    .email("Endereço de email inválido"),
});

function EmailEdition() {
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
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

    if (user?.email !== data.email) {
      handleLoading(false);
      toast({
        id: "login-error",
        title: "Erro na edição de email",
        // @ts-ignore
        description: "O email atual informado está incorreto.",
        status: "error",
        isClosable: true,
      });
      return;
    }

    const res = await updateUser({ email: data.newEmail }, user.cpf);

    // @ts-ignore
    if (res.type === "success") {
      handleLoading(false);
      navigate("/editar-conta");
      toast({
        id: "login-success",
        title: "Sucesso!",
        description: "Seu endereço de email foi atualizado.",
        status: "success",
        duration: 7500,
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "login-error",
      title: "Erro na edição de email",
      // @ts-ignore
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
              type="text"
              label="Email atual"
              placeholder="exemplo@mail.com"
              errors={errors.email}
              {...register("email")}
            />
            <Input
              type="text"
              label="Email novo"
              placeholder="exemplo@mail.com"
              errors={errors.newEmail}
              {...register("newEmail")}
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

export default EmailEdition;
