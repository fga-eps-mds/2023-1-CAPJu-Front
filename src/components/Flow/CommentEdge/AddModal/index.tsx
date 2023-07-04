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
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "components/FormFields";

type FormValues = {
  comment: string;
};

const validationSchema = yup.object({
  comment: yup.string().required("Escreva uma observação"),
});

interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  handleComment: (comment: string | null) => void;
}

export function AddModal({ isOpen, onClose, handleComment }: AddModalProps) {
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
    await handleComment(comment);
    onClose();
  });

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "md"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Adicionar Observação</ModalHeader>
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
              label="Observação"
              placeholder="Escreva sua observação"
              errors={errors.comment}
              {...register("comment")}
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
