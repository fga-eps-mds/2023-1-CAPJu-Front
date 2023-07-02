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
import { addCommentToProcess } from "services/processes";

type FormValues = {
  comment: string;
};

const validationSchema = yup.object({
  comment: yup.string().required("Escreva um comentário"),
});

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  afterSubmission: () => void;
  from: string;
  to: string;
  processRecord: string;
}

export function AddModal({
  isOpen,
  onClose,
  afterSubmission,
  from,
  to,
  processRecord,
}: AddModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });

  const onSubmit = handleSubmit(async ({ comment }) => {
    handleLoading(true);

    try {
      const res = await addCommentToProcess({
        record: processRecord,
        originStage: from,
        destinationStage: to,
        commentary: comment,
      });
      handleLoading(false);

      afterSubmission();

      if (res.type === "success") {
        toast({
          id: `comment-${comment ? "add" : "add"}-sucess`,
          title: "Sucesso!",
          description: `Seu comentário foi adicionado`,
          status: "success",
        });
        return;
      }

      throw new Error(res.error.message);
    } catch (err: any) {
      handleLoading(false);
      toast({
        id: `comment-${comment ? "add" : "add"}-error`,
        title: `Erro ao adicionar comentário`,
        description: err.message,
        status: "error",
        isClosable: true,
      });
    }

    onClose();
    afterSubmission();
  });

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "md"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar Comentário</ModalHeader>
        <ModalCloseButton />
        <chakra.form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
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
              label="Comentário"
              placeholder="Escreva um comentário"
              errors={errors.comment}
              {...register("comment")}
            />
          </ModalBody>
          <ModalFooter gap="2">
            <Button variant="ghost" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button colorScheme="blue" type="submit" size="sm">
              Comentar
            </Button>
          </ModalFooter>
        </chakra.form>
      </ModalContent>
    </Modal>
  );
}
