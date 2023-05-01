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

import { createUnit } from "services/units";
import { Input } from "components/FormFields";
import { useLoading } from "hooks/useLoading";

type FormValues = {
  name: string;
};

const validationSchema = yup.object({
  name: yup.string().required("Dê um nome à unidadee"),
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
    const res = await createUnit(formData);

    onClose();
    afterSubmission();

    if (res.type === "success") {
      handleLoading(false);

      toast({
        id: "create-unit-success",
        title: "Sucesso!",
        description: "A unidade foi criada.",
        status: "success",
        duration: 3500,
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "create-unit-error",
      title: "Erro ao criar unidade",
      description: res.error?.message,
      status: "error",
      duration: 3500,
      isClosable: true,
    });
  });

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar unidade</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Input
              type="text"
              label="Nome"
              placeholder="Nome da unidade"
              errors={errors.name}
              {...register("name")}
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
