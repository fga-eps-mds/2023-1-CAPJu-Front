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

import { updateStage } from "services/processManagement/stage";
import { Input } from "components/FormFields";
import { useLoading } from "hooks/useLoading";

type FormValues = {
  name: string;
  duration: number;
};

const validationSchema = yup.object({
  name: yup.string().required("Dê um nome à etapa"),
  duration: yup.number().required().typeError("Dê uma duração para esta etapa"),
});

interface EditionModalProps {
  stage: Stage;
  isOpen: boolean;
  onClose: () => void;
  afterSubmission: () => void;
}

export function EditionModal({
  stage,
  isOpen,
  onClose,
  afterSubmission,
}: EditionModalProps) {
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
    const res = await updateStage({
      ...formData,
      idStage: stage.idStage,
    });

    onClose();
    afterSubmission();

    if (res.type === "success") {
      handleLoading(false);

      toast({
        id: "edit-stage-success",
        title: "Sucesso!",
        description: "A etapa foi editada.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "edit-stage-error",
      title: "Erro ao editar etapa",
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
        <ModalHeader>Editar etapa</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody display="flex" flexDir="column" gap="3">
            <Input
              type="text"
              label="Nome"
              placeholder="Nome da etapa"
              errors={errors.name}
              defaultValue={stage.name}
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
            <Button colorScheme="green" type="submit" size="sm">
              Salvar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}
