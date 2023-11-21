import React, { useEffect } from "react";
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

import { Input } from "components/FormFields";
import { useLoading } from "hooks/useLoading";
import { createStage } from "../../../services/processManagement/stage";

type FormValues = {
  name: string;
  duration: number;
};

const validationSchema = yup.object({
  name: yup.string().required("Dê um nome à etapa"),
  duration: yup.number().required().typeError("Dê uma duração para esta etapa"),
});

interface CreationModalProps {
  user: User | User;
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
    handleLoading(true);
    const body = {
      name: formData.name,
      duration: formData.duration,
    };

    const res = await createStage(body);

    onClose();
    afterSubmission();

    if (res.type === "success") {
      handleLoading(false);

      toast({
        id: "create-stage-success",
        title: "Sucesso!",
        description: "A etapa foi criada.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "create-stage-error",
      title: "Erro ao criar etapa",
      description: res.error?.message,
      status: "error",
      isClosable: true,
    });
  });

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar etapa</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody display="flex" flexDir="column" gap="3">
            <Input
              type="text"
              label="Nome"
              placeholder="Nome da etapa"
              errors={errors.name}
              {...register("name")}
            />
            <Input
              type="number"
              label="Duração (em dias)"
              placeholder="Duração da etapa"
              errors={errors.duration}
              {...register("duration")}
              min={1}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;
                const numValue = parseFloat(value);
                if (value && (numValue < 1 || !Number.isInteger(numValue))) {
                  e.target.value = '';
                }
              }}
            />
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
