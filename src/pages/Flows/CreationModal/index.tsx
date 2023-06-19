import { useEffect, useMemo, useState } from "react";
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

import { createFlow } from "services/flows";
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

interface CreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  idUnit: number;
  afterSubmission: () => void;
}

export function CreationModal({
  isOpen,
  onClose,
  idUnit,
  afterSubmission,
}: CreationModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const [selectedStages, setSelectedStages] = useState<Stage[]>([]);
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
  const { data: stagesData } = useQuery({
    queryKey: ["stages"],
    queryFn: getStages,
  });
  const { data: usersData } = useQuery({
    queryKey: ["accepted-users"],
    queryFn: getAcceptedUsers,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
  } = useForm<FormValues>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    handleLoading(true);

    const res = await createFlow({
      name,
      sequences,
      idUnit,
      idUsersToNotify: usersToNotify,
    });

    if (res.type === "success") {
      toast({
        id: "create-flow-success",
        title: "Sucesso!",
        description: `Fluxo ${res.value?.name || ""} criado com sucesso.`,
        status: "success",
      });
    } else {
      toast({
        id: "create-flow-error",
        title: "Erro ao criar fluxo",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }

    onClose();
    handleLoading(false);
    afterSubmission();
  });

  useEffect(() => {
    setSelectedStages([]);
    setUsersToNotify([]);
    reset();
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={["full", "md", "2xl", "4xl"]}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar fluxo</ModalHeader>
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
              {...register("name")}
            />
            {stagesData?.value?.length ? (
              <MultiSelect
                label="Etapas"
                placeholder="Escolha as etapas do fluxo em sequência"
                errors={
                  selectedStages?.length < 2 && isSubmitted
                    ? { message: "Escolha ao menos duas etapas.", type: "min" }
                    : undefined
                }
                options={stagesData?.value?.map((item: Stage) => {
                  return {
                    label: `${item.name}, (${item.duration} dia${
                      item.duration > 1 ? "s" : ""
                    })`,
                    value: item.idStage,
                  };
                })}
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
            <Flow
              stages={selectedStages}
              sequences={sequences}
              showStagesDuration
            />
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button colorScheme="blue" type="submit" size="sm">
              Criar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}
