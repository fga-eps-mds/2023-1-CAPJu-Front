import { useEffect, useMemo, useState } from "react";
import {
  Flex,
  Card,
  CardBody,
  Image,
  Button,
  chakra,
  useToast,
  Text,
  AlertIcon,
  Alert,
  Stack,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "react-query";
import _ from "lodash";

import { useLoading } from "hooks/useLoading";
import { Input } from "components/FormFields";
import { getUnits } from "services/unit";
import { Select } from "components/FormFields/Select";
import { signUp } from "services/user";
import { getAllRoles } from "services/role";
import { validateCPF } from "utils/validators";
import { FaEye, FaEyeSlash } from "react-icons/fa";

type FormValues = {
  fullName: string;
  cpf: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  idUnit: string;
  idRole: string;
};

const validationSchema = yup.object({
  fullName: yup
    .string()
    .required("Preencha seu nome")
    .matches(
      /\b[A-Za-zÀ-ú][A-Za-zÀ-ú]+,?\s[A-Za-zÀ-ú][A-Za-zÀ-ú]{2,19}\b/gi,
      "Nome inválido - Necessário nome e sobrenome"
    ),
  cpf: yup
    .string()
    .required("Preencha seu CPF")
    .matches(/^([0-9]){3}\.([0-9]){3}\.([0-9]){3}-([0-9]){2}$/, "CPF inválido")
    .test("validation", "CPF inválido", (value) => validateCPF(value)),
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
    .oneOf([yup.ref("password")], "Suas senhas não conferem."),
  idUnit: yup.string().required("Selecione uma unidade"),
  idRole: yup.string().required("Selecione um perfil"),
});

function Signup() {
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { handleLoading } = useLoading();
  const { data: unitsData } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await getUnits();
      return res;
    },
    onError: () => {
      toast({
        id: "units-error",
        title: "Erro ao carregar unidade",
        description: "Houve um erro ao carregar unidades, tentando novamente.",
        status: "error",
        isClosable: true,
      });
    },
    refetchOnWindowFocus: false,
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
    refetchOnWindowFocus: false,
  });
  const units = useMemo(() => {
    return (
      unitsData?.value?.map((unit) => {
        return { label: unit.name, value: unit.idUnit };
      }) || []
    );
  }, [unitsData]);
  const roles = useMemo(() => {
    return (
      rolesData?.value
        ?.filter((role: Role) => role.idRole !== 5)
        ?.map((role: Role) => {
          return { label: role.name, value: role.idRole };
        }) || []
    );
  }, [rolesData]);
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
    const res = await signUp({
      ...data,
      fullName: _.startCase(data.fullName.toLocaleLowerCase()),
      email: data.email.toLocaleLowerCase(),
    });

    if (res.type === "success") {
      handleLoading(false);
      navigate("/", { replace: true });
      toast({
        id: "login-success",
        title: "Solicitação enviada com sucesso!",
        description: "Sua solicitação de cadastro logo será analisada.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "login-error",
      title: "Erro no cadastro",
      description: res.error?.message,
      status: "error",

      isClosable: true,
    });
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordVisibilityValidation = () => {
    setShowPasswordValidation(!showPasswordValidation);
  };

  useEffect(() => {
    if (unitsData?.type !== "error") return;

    toast({
      id: "units-error",
      title: "Erro ao buscar unidades",
      description:
        "Houve um erro ao tentar buscar unidades, favor tentar novamente.",
      status: "error",
      isClosable: true,
    });
  }, [unitsData]);

  return (
    <Flex
      flex="1"
      alignItems="center"
      justifyContent="center"
      w="100%"
      maxW="100vw"
    >
      <Card p={["10", "20"]} w="90%" maxW="520" my="16">
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
            Faça seu Cadastro
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
              label="Nome"
              placeholder="Nome Completo"
              errors={errors.fullName}
              {...register("fullName")}
            />
            <Input
              type="text"
              label="CPF"
              placeholder="000.000.000-00"
              mask="999.999.999-99"
              errors={errors.cpf}
              {...register("cpf")}
            />
            <Input
              type="text"
              label="E-mail"
              placeholder="exemplo@mail.com"
              errors={errors.email}
              {...register("email")}
            />
            <InputGroup>
              <Input
                type={showPassword ? "text" : "password"}
                label="Senha"
                placeholder="Crie uma senha"
                errors={errors.password}
                infoText={
                  <Stack spacing="0">
                    <Text>Deve conter ao menos um dígito;</Text>
                    <Text>
                      Deve conter ao menos uma letra maiúscula e uma letra
                      minuscula;
                    </Text>
                    <Text>Deve conter ao menos 6 caracteres;</Text>
                  </Stack>
                }
                {...register("password")}
              />
              <InputRightElement>
                <IconButton
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
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
                placeholder="Confirme uma senha"
                errors={errors.passwordConfirmation}
                {...register("passwordConfirmation")}
              />
              <InputRightElement>
                <IconButton
                  onClick={togglePasswordVisibilityValidation}
                  aria-label={
                    showPasswordValidation ? "Esconder senha" : "Mostrar senha"
                  }
                  colorScheme="blue"
                  variant="ghost"
                  top="8"
                  icon={showPasswordValidation ? <FaEyeSlash /> : <FaEye />}
                />
              </InputRightElement>
            </InputGroup>
            <Select
              label="Unidade"
              placeholder="Selecione sua unidade"
              errors={errors.idUnit}
              options={units}
              disabled={unitsData?.type === "error"}
              {...register("idUnit")}
            />
            <Select
              label="Perfil"
              placeholder="Selecione seu perfil"
              errors={errors.idRole}
              options={roles}
              {...register("idRole")}
            />
            <Button
              colorScheme="green"
              w="100%"
              type="submit"
              mt="8"
              disabled={unitsData?.type === "error"}
            >
              Enviar solicitação
            </Button>
            <Alert status="info" variant="left-accent">
              <AlertIcon />
              Esta etapa consiste apenas em uma solicitação de cadastro. O
              efetivo login no sistema será possível após a aprovação de sua
              solicitação.
            </Alert>
          </chakra.form>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default Signup;
