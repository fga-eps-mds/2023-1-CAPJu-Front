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
  Text,
} from "@chakra-ui/react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Textarea } from "components/FormFields";

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
  handleComment: (comment: string) => void;
}

export function AddModal({ isOpen, onClose, handleComment }: AddModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    // @ts-ignore
    resolver: yupResolver(validationSchema),
    reValidateMode: "onChange",
  });
  const { comment: commentValue } = watch();

  const onSubmit = handleSubmit(async ({ comment }) => {
    await handleComment(comment);
    onClose();
  });

  useEffect(() => {
    reset();
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
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
            alignItems="start"
            justifyContent="center"
            gap="2"
            mt="2"
          >
            <Textarea
              label=""
              placeholder="Escreva sua observação"
              errors={errors.comment}
              minH={150}
              maxLength={500}
              {...register("comment")}
            />
            <Text fontSize="xs">
              Caracteres restantes: {500 - commentValue?.length}
            </Text>
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
