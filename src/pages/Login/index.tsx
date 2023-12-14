import {
  Flex,
  Card,
  CardBody,
  Image,
  Button,
  chakra,
  useToast,
  Text,
  Link,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuth } from "hooks/useAuth";
import { useLoading } from "hooks/useLoading";
import { Input } from "components/FormFields";

type FormValues = {
  cpf: string;
  password: string;
};

const validationSchema = yup.object({
  cpf: yup
    .string()
    .required("Preencha seu CPF")
    .matches(/^([0-9]){3}\.([0-9]){3}\.([0-9]){3}-([0-9]){2}$/, "CPF inválido"),
  password: yup.string().required("Preencha sua Senha"),
});

function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
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
    try {
      const res = (await handleLogin(data)) as any;

      if (res.type === "success") {
        handleLoading(false);
        navigate("/", { replace: true });
        toast({
          id: "login-success",
          title: "Bem-vindo(a)!",
          description: "Login efetuado com sucesso!",
          status: "success",
        });
        return;
      }

      handleLoading(false);
      toast({
        title: "Erro no login",
        description: res.error?.message || res?.data?.message,
        status: "error",
        isClosable: true,
      });
    } catch (e) {
      console.log(e);
    }
  });

  return (
    <Flex flex="1" alignItems="center" justifyContent="center" w="100%">
      <Card p={["10", "20"]} w="90%" maxW="454" my="16">
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
            Faça Login
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
              label="CPF"
              placeholder="000.000.000-00"
              mask="999.999.999-99"
              errors={errors.cpf}
              {...register("cpf")}
            />
            <Input
              type="password"
              label="Senha"
              placeholder="********"
              errors={errors.password}
              {...register("password")}
            />
            <Button colorScheme="green" w="100%" type="submit">
              Entrar
            </Button>
            <Link href="/recuperar-senha">Esqueceu sua senha?</Link>
          </chakra.form>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default Login;
