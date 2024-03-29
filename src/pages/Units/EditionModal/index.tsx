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

import { updateUnit } from "services/unit";
import { Input } from "components/FormFields";
import { useLoading } from "hooks/useLoading";

type FormValues = {
  name: string;
};

const validationSchema = yup.object({
  name: yup.string().required("Dê um nome à unidade"),
});

interface EditionModalProps {
  unit: Unit;
  isOpen: boolean;
  onClose: () => void;
  afterSubmission: () => void;
}

export function EditionModal({
  unit,
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
    const res = await updateUnit({
      ...formData,
      idUnit: unit.idUnit,
    });

    onClose();
    afterSubmission();

    if (res.type === "success") {
      handleLoading(false);

      toast({
        id: "edit-unit-success",
        title: "Sucesso!",
        description: "A unidade foi editada.",
        status: "success",
      });
      return;
    }

    handleLoading(false);
    toast({
      id: "edit-unit-error",
      title: "Erro ao editar unidade",
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
        <ModalHeader>Editar unidade</ModalHeader>
        <ModalCloseButton />
        <chakra.form onSubmit={onSubmit}>
          <ModalBody>
            <Input
              type="text"
              label="Nome"
              placeholder="Nome da unidade"
              errors={errors.name}
              defaultValue={unit.name}
              {...register("name")}
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
