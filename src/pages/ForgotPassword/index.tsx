import {
  Flex,
  Card,
  CardBody,
  Image,
  Text,
  Button,
  useToast,
  chakra,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoading } from "hooks/useLoading";
import { Input } from "components/FormFields";
import { forgotPassword } from "services/user";

type FormValues = {
  email: string;
};

const validationSchema = yup.object({
  email: yup.string().required("Preencha seu Email").email("Email inválido"),
});

function ForgotPassword() {
  const toast = useToast();
  const navigate = useNavigate();
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
    const res = await forgotPassword(data);
    if (res.type === "success") {
      handleLoading(false);
      navigate("/", { replace: true });
      toast({
        id: "login-success",
        title: "Email enviado com sucesso!",
        description: "Acesse seu email para a recuperar sua senha",
        status: "success",
        duration: 3500,
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "email-error",
      title: "Erro no envio de email",
      description: res.error?.message,
      status: "error",
      duration: 3500,
      isClosable: true,
    });
    handleLoading(false);
  });

  return (
    <Flex
      flex="1"
      alignItems="center"
      justifyContent="center"
      w="100%"
      py={["16", 0]}
    >
      <Card p={["10", "20"]} w="90%" maxW="454">
        <CardBody
          w="100%"
          p={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="3"
        >
          <Image w="100%" maxW="36" src="/assets/logo.png" m="0 auto" />
          <Text fontSize={["lg", "xl"]} fontWeight="semibold">
            Recuperação de senha
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
              type="email"
              label="Email"
              placeholder="exemplo@email.com"
              errors={errors.email}
              {...register("email")}
            />
            <Button colorScheme="green" w="100%" type="submit">
              Enviar
            </Button>
            <Button w="100%" onClick={() => navigate("/", { replace: true })}>
              Cancelar
            </Button>
          </chakra.form>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ForgotPassword;
