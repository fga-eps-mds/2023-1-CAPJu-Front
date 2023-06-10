import { useMemo, useState } from "react";
import { useQuery } from "react-query";
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
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { updateFlow } from "services/flows";
import { getStages } from "services/stages";
import { getAcceptedUsers } from "services/user";
import { Input, MultiSelect } from "components/FormFields";
import { Flow } from "components/Flow";
import { useLoading } from "hooks/useLoading";

type FormValues = {
  name: string;
  stages: number[];
};

const validationSchema = yup.object({
  name: yup.string().required("Dê um nome ao fluxo."),
});

interface EditionModalProps {
  flow: Flow;
  isOpen: boolean;
  onClose: () => void;
  afterSubmission: () => void;
}

export function EditionModal({
  flow,
  isOpen,
  onClose,
  afterSubmission,
}: EditionModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { data: stagesData, isFetched: isStagesFetched } = useQuery({
    queryKey: ["stages"],
    queryFn: getStages,
  });
  const { data: usersData } = useQuery({
    queryKey: ["accepted-users"],
    queryFn: getAcceptedUsers,
  });
  const [selectedStages, setSelectedStages] = useState<Stage[]>(
    stagesData?.value?.filter((item) =>
      flow.stages.some((stageId) => stageId === item.idStage)
    ) || []
  );
  const [usersToNotify, setUsersToNotify] = useState<(number | string)[]>([]);
  const sequences = useMemo<FlowSequence[]>(() => {
    return selectedStages.reduce(
      (acc: FlowSequence[], curr: Stage, index: number) => {
        if (selectedStages.length === index + 1) return acc;

        return [
          ...acc,
          {
            from: curr.idStage,
            to: selectedStages[index + 1]?.idStage,
            commentary: "",
          },
        ];
      },
      []
    );
  }, [selectedStages]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    handleLoading(true);

    const res = await updateFlow({
      name,
      sequences,
      idFlow: flow.idFlow,
      idUsersToNotify: usersToNotify,
    });

    if (res.type === "success") {
      toast({
        id: "edit-flow-success",
        title: "Sucesso!",
        description: `Fluxo ${res.value?.name || ""} editado com sucesso.`,
        status: "success",
      });
    } else {
      toast({
        id: "edit-flow-error",
        title: "Erro ao editar fluxo",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }

    onClose();
    handleLoading(false);
    afterSubmission();
  });

  function stageToSelectOption(value: Stage[]): SelectOption[] {
    return value?.map((item: Stage) => {
      
      return {
        label: `${item.name}, (${item.duration} dia${item.duration > 1 ? "s" : ""})`,
        value: item.idStage,
      };
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={["full", "md", "2xl", "4xl"]}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Editar fluxo</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap="3"
            mt="3"
          >
            <Input
              type="text"
              label="Nome"
              placeholder="Nome do fluxo"
              errors={errors.name}
              defaultValue={flow.name}
              {...register("name")}
            />
            {isStagesFetched && stagesData?.value?.length ? (
              <MultiSelect
                label="Etapas"
                placeholder="Escolha as etapas do fluxo em sequência"
                defaultValue={stageToSelectOption(selectedStages)}
                errors={
                  selectedStages?.length < 2 && isSubmitted
                    ? { message: "Escolha ao menos duas etapas.", type: "min" }
                    : undefined
                }
                options={stageToSelectOption(stagesData?.value)}
                onChange={(value) => {
                  setSelectedStages(
                    value
                      .map((stage: SelectOption) => {
                        return stagesData.value.find(
                          (item) => item.idStage === stage.value
                        );
                      })
                      .filter(
                        (stage: Stage | undefined): stage is Stage =>
                          stage !== undefined
                      )
                  );
                }}
              />
            ) : null}
            {usersData?.value?.length ? (
              <MultiSelect
                label="Usuários notificados"
                placeholder="Escolha os usuários a serem notificados"
                options={usersData?.value?.map((item: User) => {
                  return {
                    label: item.fullName,
                    value: item.cpf,
                  };
                })}
                onChange={(value) => {
                  setUsersToNotify(value.map((item) => item.value));
                }}
              />
            ) : null}
            <Flow stages={selectedStages} sequences={sequences} />
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
