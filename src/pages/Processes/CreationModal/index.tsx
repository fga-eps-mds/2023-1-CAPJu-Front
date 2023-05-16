import { useEffect, useState } from "react";
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
  Select,
  Text,
  Checkbox,
  Box,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Input } from "components/FormFields";
import { useLoading } from "hooks/useLoading";
import { getPriorities } from "services/priorities";
import { getFlows } from "services/flows";
import { createProcess } from "services/processes";

type FormValues = {
  record: string;
  nickname: string;
  idFlow: number;
  idPriority: number;
};

const validationSchema = yup.object({
  name: yup.string().required("Dê um nome à etapa"),
  duration: yup.string().required("Dê uma duração para esta etapa"),
});

interface CreationModalProps {
  user: User | User;
  isOpen: boolean;
  onClose: () => void;
  afterSubmission: () => void;
}

export function CreationModal({
  user,
  isOpen,
  onClose,
  afterSubmission,
}: CreationModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const [legalPriority, setLegalPriority] = useState(false);
  const [priorities, setPriorities] = useState<Priority[]>();
  const [flows, setFlows] = useState<Flow[]>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log("ENTREI SUBMIT");
    handleLoading(true);
    const body = {
      record: formData.record,
      nickname: formData.nickname,
      idFlow: formData.idFlow,
      priority: legalPriority ? formData.idPriority : 0,
      effectiveDate: new Date(),
    };

    const res = await createProcess(body);

    onClose();
    afterSubmission();

    if (res.type === "success") {
      handleLoading(false);

      toast({
        id: "create-process-success",
        title: "Sucesso!",
        description: "O Processo foi criado.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "create-process-error",
      title: "Erro ao criar processo",
      description: res.error?.message,
      status: "error",
      isClosable: true,
    });
  });

  const handleGetPriorities = async () => {
    const res = (await getPriorities()).value;
    setPriorities(res);
  };

  const handleGetFlows = async () => {
    const res = (await getFlows()).value;
    setFlows(res);
  };

  useEffect(() => {
    handleGetFlows();
    handleGetPriorities();
  }, []);

  useEffect(() => {
    reset();
  }, [isOpen]);

  console.log("priorities", priorities);
  console.log("flows", flows);
  console.log("user", user);
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Processo</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Input
              type="text"
              label="Registro"
              placeholder="N do Registro "
              errors={errors.record}
              marginBottom={2}
              {...register("record")}
            />
            <Input
              type="text"
              label="Apelido"
              placeholder="Escolha um apelido para o registro"
              errors={errors.nickname}
              marginBottom={2}
              {...register("nickname")}
            />
            <Text fontWeight={500}>Fluxo</Text>
            <Select
              placeholder="Selecionar Fluxo"
              marginBottom={2}
              color="gray.500"
              {...register("idFlow")}
            >
              {flows &&
                flows.map((flow) => {
                  return <option value={flow.idFlow}>{flow.name}</option>;
                })}
            </Select>
            <Checkbox
              colorScheme="green"
              borderColor="gray.600"
              checked={legalPriority && true}
              onChange={() => setLegalPriority(!legalPriority)}
              marginBottom={2}
            >
              Com prioridade legal
            </Checkbox>
            {legalPriority && (
              <Box>
                <Text fontWeight={500}>Prioridade Legal</Text>
                <Select
                  placeholder="Selecionar Prioriadade"
                  marginBottom={2}
                  color="gray.500"
                  {...register("idPriority")}
                >
                  {priorities &&
                    priorities.map((priority) => {
                      return (
                        <option value={priority.idPriority}>
                          {priority.description}
                        </option>
                      );
                    })}
                </Select>
              </Box>
            )}
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
