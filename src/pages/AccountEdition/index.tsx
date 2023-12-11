import {
  Flex,
  Card,
  CardBody,
  Button,
  Text,
  chakra,
  useToast,
  Stack,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { Input } from "components/FormFields";
import {
  updateUserPassword,
  updateUser,
  updateUserFullName,
  signIn,
  showUserByCpf,
} from "services/user";
import { PrivateLayout } from "layouts/Private";
import { useAuth } from "hooks/useAuth";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLoading } from "hooks/useLoading";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type FormValues = {
  email: string;
  newEmail: string | null;
  oldPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
  fullName: string;
};

const validationSchema = yup.object({
  email: yup
    .string()
    .required("Informe seu e-mail atual")
    .email("Endereço de email inválido"),
  newEmail: yup.string().email("Endereço de email inválido"),
  newPassword: yup.string(),
  newPasswordConfirmation: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Suas senhas não conferem."),
  oldPassword: yup.string().required("Informe sua senha atual"),
  fullName: yup.string().required("Informe o seu nome completo"),
});

function AccountEdition() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordOld, setShowPasswordOld] = useState(false);
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const { user, handleLogout } = useAuth();
  const toast = useToast();
  const { handleLoading } = useLoading();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    reValidateMode: "onChange",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordVisibilityOld = () => {
    setShowPasswordOld(!showPasswordOld);
  };

  const togglePasswordVisibilityValidation = () => {
    setShowPasswordValidation(!showPasswordValidation);
  };

  const onSubmit = handleSubmit(async (data) => {
    handleLoading(true);
    let hasChanges = false;

    if (!user) {
      handleLogout();
      return;
    }

    const email = await showUserByCpf(user.cpf);

    if (email.value !== null) {
      if (email.value?.email === data.newEmail) {
        handleLoading(false);
        toast({
          id: "login-error",
          title: "Erro ao comparar os endereços de email!",
          description: "O novo endereço de email deve ser diferente do atual",
          status: "error",
          isClosable: true,
        });
        return;
      }
    }

    const isOldPasswordCorrect = await signIn({
      cpf: user.cpf,
      password: data.oldPassword,
    });

    if (isOldPasswordCorrect.type === "error") {
      handleLoading(false);
      toast({
        id: "login-error",
        title: "Senha atual incorreta!",
        description:
          "A senha fornecida para confirmar as alterações está incorreta",
        status: "error",
        isClosable: true,
      });
      return;
    }

    if (data.fullName !== user?.fullName) {
      const name = await updateUserFullName(
        { fullName: data.fullName ?? user.fullName },
        user.cpf
      );
      if (name.type === "success") {
        handleLoading(false);
        hasChanges = true;
        toast({
          id: "login-success",
          title: "Sucesso!",
          description: "Seu nome foi atualizado",
          status: "success",
        });
      } else {
        handleLoading(false);
        toast({
          id: "login-error",
          title: "Erro ao editar nome!",
          description: name.error?.message,
          status: "error",
          isClosable: true,
        });
        return;
      }
    } else {
      handleLoading(false);
    }

    if (data.newEmail !== "") {
      const emailUpdateResponse = await updateUser(
        { email: data.newEmail },
        user.cpf
      );
      if (emailUpdateResponse.type === "success") {
        handleLoading(false);
        hasChanges = true;
        toast({
          id: "login-success",
          title: "Sucesso!",
          description: "Seu email foi atualizado",
          status: "success",
        });
      } else {
        handleLoading(false);
        toast({
          id: "login-error",
          title: "Erro ao editar email!",
          description: emailUpdateResponse.error?.message,
          status: "error",
          isClosable: true,
        });
      }
    }

    const newPasswordProvided = data.newPassword.trim() !== "";
    const newPasswordConfirmationProvided =
      data.newPasswordConfirmation.trim() !== "";

    if (!newPasswordProvided && !newPasswordConfirmationProvided) {
      handleLoading(false);
    } else {
      const res = await updateUserPassword(data, user.cpf);

      if (res.type === "success") {
        handleLoading(false);
        hasChanges = true;
        toast({
          id: "login-success",
          title: "Sucesso!",
          description: "Sua senha foi atualizada",
          status: "success",
        });
      } else {
        handleLoading(false);
        toast({
          id: "login-error",
          title: "Erro ao editar senha!",
          description: res.error?.message,
          status: "error",
          isClosable: true,
        });
        return;
      }
    }

    if (hasChanges) {
      handleLogout();
    } else {
      toast({
        id: "login-error",
        title: "Sem alterações!",
        description: "Altere alguma informação para salvar as alterações",
        status: "error",
        isClosable: true,
      });
    }
  });

  return (
    <PrivateLayout>
      <Flex w="90%" maxW={1120} flexDir="column" gap="3" mb="4">
        <Flex
          w="100%"
          justifyContent="space-between"
          gap="2"
          flexWrap="wrap"
          marginTop="25px"
        >
          <Text
            className="chakra-text css-115fr15"
            fontSize="25px"
            fontWeight="semibold"
          >
            Editar conta
          </Text>
        </Flex>
      </Flex>
      <Card p="2.5%" w="50%" maxW="83%" mt="2">
        <CardBody
          w="100%"
          p={0}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap="3"
        >
          <chakra.form
            w="50%"
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="start"
            gap="3"
            onSubmit={onSubmit}
          >
            <Flex display="flex" flexDirection="row" gap="5%" w="200%">
              <Flex
                display="flex"
                flexDirection="column"
                w="100%"
                p={0}
                gap="5"
              >
                <Input
                  type="text"
                  label="Nome Completo"
                  placeholder="Digite seu nome completo"
                  defaultValue={user?.fullName}
                  errors={errors.fullName}
                  {...register("fullName")}
                />
                <Input
                  type="text"
                  label="Email atual"
                  placeholder="exemplo@email.com"
                  defaultValue={user?.email}
                  errors={errors.email}
                  {...register("email")}
                />
                <Input
                  type="text"
                  label="Novo Email"
                  placeholder="exemplo@email.com"
                  errors={errors.newEmail}
                  {...register("newEmail")}
                />
              </Flex>
              <Flex
                display="flex"
                flexDirection="column"
                w="100%"
                p={0}
                gap="5"
              >
                <Input
                  type="text"
                  label="Perfil"
                  placeholder=""
                  disabled
                  backgroundColor="gray.400"
                  value={user?.role.name}
                  textColor="black"
                />
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="Nova senha"
                    placeholder="Crie uma nova senha"
                    // errors={errors.newPassword}
                    infoText={
                      <Stack spacing="0">
                        <Text>Deve conter ao menos um dígito;</Text>
                        <Text>Deve conter ao menos uma letra maiúscula;</Text>
                        <Text>Deve conter ao menos 6 caracteres;</Text>
                      </Stack>
                    }
                    {...register("newPassword")}
                  />
                  <InputRightElement>
                    <IconButton
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Esconder senha" : "Mostrar senha"
                      }
                      colorScheme="blue"
                      variant="ghost"
                      top="8"
                      icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                    />
                  </InputRightElement>
                </InputGroup>
                <InputGroup>
                  <Input
                    type={showPasswordValidation ? "text" : "password"}
                    label="Confirmação de senha"
                    placeholder="Confirme sua nova senha"
                    errors={errors.newPasswordConfirmation}
                    {...register("newPasswordConfirmation")}
                  />
                  <InputRightElement>
                    <IconButton
                      onClick={togglePasswordVisibilityValidation}
                      aria-label={
                        showPasswordValidation
                          ? "Esconder senha"
                          : "Mostrar senha"
                      }
                      colorScheme="blue"
                      variant="ghost"
                      top="8"
                      icon={showPasswordValidation ? <FaEyeSlash /> : <FaEye />}
                    />
                  </InputRightElement>
                </InputGroup>
              </Flex>
            </Flex>
            <Flex
              w="100%"
              alignItems="center"
              justifyContent="center"
              gap="2"
              marginTop="10"
              flexWrap="wrap"
            >
              <Text>Para confirmar as alterações, digite sua senha atual:</Text>
              <InputGroup>
                <Input
                  type={showPasswordOld ? "text" : "password"} // Alterna entre text e password
                  textAlign="center"
                  errors={errors.oldPassword}
                  {...register("oldPassword")}
                />
                <InputRightElement>
                  <IconButton
                    onClick={togglePasswordVisibilityOld}
                    aria-label={
                      showPasswordOld ? "Esconder senha" : "Mostrar senha"
                    }
                    colorScheme="blue"
                    variant="ghost"
                    icon={showPasswordOld ? <FaEyeSlash /> : <FaEye />}
                  />
                </InputRightElement>
              </InputGroup>
              <Button
                w={["100%", "fit-content"]}
                colorScheme="green"
                type="submit"
                size="sm"
              >
                Salvar alterações
              </Button>
            </Flex>
          </chakra.form>
        </CardBody>
      </Card>
    </PrivateLayout>
  );
}

export default AccountEdition;
