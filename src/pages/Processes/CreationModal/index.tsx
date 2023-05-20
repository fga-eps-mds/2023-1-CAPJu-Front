import { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  chakra,
  Button,
  useToast,
  Text,
  Checkbox,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Input, Select } from "components/FormFields";
import { useLoading } from "hooks/useLoading";
import { getPriorities } from "services/priorities";
import { getFlows } from "services/flows";
import { createProcess } from "services/processes";

type FormValues = {
  record: string;
  nickname: string;
  idFlow: number;
  hasLegalPriority: boolean;
  idPriority: number;
};

const validationSchema = yup.object({
  record: yup.string().required("Digite o registro do processo."),
  nickname: yup.string().required("Dê um apelido para o processo."),
  idFlow: yup.string().required("Selecione um fluxo para o processo."),
  hasLegalPriority: yup.bool(),
  idPriority: yup.string().when("hasLegalPriority", (hasLegalPriority) => {
    return hasLegalPriority[0]
      ? yup.string().required("Escolha a prioridade legal do processo.")
      : yup.string().notRequired();
  }),
});

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  afterSubmission: () => void;
}

export function CreationModal({
  isOpen,
  onClose,
  afterSubmission,
}: CreationModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { data: prioritiesData } = useQuery({
    queryKey: ["priorities"],
    queryFn: async () => {
      const res = await getPriorities();
      return res;
    },
    onError: () => {
      toast({
        id: "priorities-error",
        title: "Erro ao carregar prioridades",
        description:
          "Houve um erro ao carregar prioriaddes, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const { data: flowsData } = useQuery({
    queryKey: ["flows"],
    queryFn: getFlows,
    onError: () => {
      toast({
        id: "flows-error",
        title: "Erro ao carregar fluxos",
        description:
          "Houve um erro ao carregar fluxos, favor tentar novamente.",
        status: "error",
        isClosable: true,
      });
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });
  const hasLegalPriority = watch("hasLegalPriority");

  const onSubmit = handleSubmit(async (formData) => {
    handleLoading(true);

    const body = {
      record: formData.record,
      nickname: formData.nickname,
      idFlow: formData.idFlow,
      priority: formData.hasLegalPriority ? formData.idPriority : 0,
      effectiveDate: new Date(),
    };

    const res = await createProcess(body);

    if (res.type === "success") {
      toast({
        id: "create-process-success",
        title: "Sucesso!",
        description: "O Processo foi criado.",
        status: "success",
      });
    } else {
      toast({
        id: "create-process-error",
        title: "Erro ao criar processo",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }

    onClose();
    afterSubmission();
    handleLoading(false);
  });

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Processo</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody display="flex" flexDir="column" gap="3">
            <Input
              type="text"
              label="Registro"
              placeholder="N do Registro "
              errors={errors.record}
              {...register("record")}
            />
            <Input
              type="text"
              label="Apelido"
              placeholder="Escolha um apelido para o registro"
              errors={errors.nickname}
              {...register("nickname")}
            />
            <Text fontWeight={500}>Fluxo</Text>
            <Select
              placeholder="Selecionar Fluxo"
              color="gray.500"
              options={
                flowsData?.value
                  ? flowsData?.value?.map((flow) => {
                      return {
                        value: flow.idFlow,
                        label: flow.name,
                      };
                    })
                  : []
              }
              errors={errors.idFlow}
              {...register("idFlow")}
            />
            <Checkbox
              colorScheme="green"
              borderColor="gray.600"
              isChecked={hasLegalPriority}
              {...register("hasLegalPriority")}
            >
              Com prioridade legal
            </Checkbox>
            {hasLegalPriority ? (
              <Select
                label="Prioridade Legal"
                placeholder="Selecionar Prioriadade"
                color="gray.500"
                options={
                  prioritiesData?.value
                    ? (prioritiesData.value as Priority[]).map(
                        (priority: Priority) => {
                          return {
                            value: priority.idPriority,
                            label: priority.description,
                          };
                        }
                      )
                    : []
                }
                errors={errors.idPriority}
                {...register("idPriority")}
              />
            ) : null}
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
