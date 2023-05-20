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
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Input } from "components/FormFields";
import { useLoading } from "hooks/useLoading";
import { createStage } from "../../../services/stages";

type FormValues = {
  name: string;
  duration: number;
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
      idUnit: user.idUnit,
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
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
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
            />
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
