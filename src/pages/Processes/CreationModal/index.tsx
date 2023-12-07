import { useEffect } from "react";
import {
  Button,
  chakra,
  Checkbox,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useQuery } from "react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Input, Select } from "components/FormFields";
import { useLoading } from "hooks/useLoading";
import { getPriorities } from "services/processManagement/priority";
import { getFlows } from "services/processManagement/flows";
import { createProcess } from "services/processManagement/processes";

type FormValues = {
  record: string;
  nickname: string;
  idFlow: number;
  hasLegalPriority: boolean;
  idPriority: number;
};

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  afterSubmission: (createdProcess: Result<Process>) => void;
  externalProcess?: ExternalProcess;
}

interface ExternalProcess {
  record?: string;
  nickname?: string;
  flow?: string;
  priority?: string;
}

const validationSchema = yup.object({
  record: yup.string().required("Digite o registro do processo."),
  nickname: yup
    .string()
    .required("Dê um apelido para o processo.")
    .max(50, "O apelido não pode ter mais que 50 caracteres."),
  idFlow: yup
    .number()
    .required()
    .typeError("Selecione um fluxo para o processo."),
  hasLegalPriority: yup.bool(),
  idPriority: yup.number().when("hasLegalPriority", (hasLegalPriority) => {
    return hasLegalPriority[0]
      ? yup.string().required("Escolha a prioridade legal do processo.")
      : yup.string().notRequired();
  }),
});

export function CreationModal({
  isOpen,
  onClose,
  afterSubmission,
  externalProcess,
}: CreationModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<FormValues>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const hasLegalPriority = watch("hasLegalPriority");

  const { data: flowsData } = useQuery({
    queryKey: ["flows"],
    queryFn: async () => {
      const res = await getFlows();

      if (res.type === "error") throw new Error(res.error.message);
      else if (externalProcess?.flow) {
        const { value } = res;
        const externalFlow = value.find(
          (f) => f.name === externalProcess?.flow
        );
        if (externalFlow?.idFlow) setValue("idFlow", externalFlow?.idFlow);
      }
      return res;
    },
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
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  const onSubmit = handleSubmit(async (formData) => {
    handleLoading(true);

    const { record, nickname, idFlow, idPriority } = formData;

    const body = {
      record,
      nickname,
      idFlow,
      priority: formData.hasLegalPriority ? idPriority : 0,
    };

    const res = await createProcess(body);

    if (res.type === "success") {
      toast({
        id: "create-process-success",
        title: "Sucesso!",
        description: "O Processo foi criado.",
        status: "success",
      });
      onClose();
    } else {
      toast({
        id: "create-process-error",
        title: "Erro ao criar processo",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }
    afterSubmission(res);
    handleLoading(false);
  });

  useEffect(() => reset(), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const { record, nickname } = externalProcess || {};
      if (record) setValue("record", record);
      if (nickname) setValue("nickname", nickname);
    }
  }, [isOpen]);

  const { data: prioritiesData } = useQuery({
    queryKey: ["priorities"],
    queryFn: async () => {
      if (!isOpen || !hasLegalPriority) return {};
      return getPriorities();
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
    refetchOnWindowFocus: false,
    enabled: isOpen && hasLegalPriority,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar processo</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody display="flex" flexDir="column" gap="3">
            <Input
              type="text"
              label="Registro"
              placeholder="N° do registro "
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
              id="legalPriorityCheckbox"
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
                placeholder="Selecionar prioridade"
                color="gray.500"
                options={
                  // @ts-ignore
                  prioritiesData?.value
                    ? // @ts-ignore
                      (prioritiesData.value as Priority[]).map(
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
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" type="submit">
              Salvar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}
