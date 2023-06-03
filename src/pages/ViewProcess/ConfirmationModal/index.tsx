import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";
// import { updateProcessStatus } from "services/processes";
import { updateProcessStatus, getProcessByRecord } from "services/processes";
import { useLoading } from "hooks/useLoading";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";

interface ConfirmationModalProps {
  process: Process;
  isOpen: boolean;
  onClose: () => void;
  afterSubmition: () => void;
}

export function ConfirmationModal({
  process,
  isOpen,
  onClose,
  afterSubmition,
}: ConfirmationModalProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const params = useParams();
  const { data: processData, refetch: refetchProcess } = useQuery({
    queryKey: ["process", params.record],
    queryFn: async () => {
      const res = await getProcessByRecord(
        params.record || (process.record as string)
      );
      return res;
    },
  });

  const handleFinalizedProcess = async () => {
    handleLoading(true);
    // updateProcessStatus deve ser criada esta função no back
    // const res = await updateProcessStatus(process?.record as string);
    const res = await updateProcessStatus({
      record: processData?.value?.record as string,
      status: "finished",
    });
    if (res.type === "success") {
      afterSubmition();
      toast({
        id: "update-status-process-success",
        title: "Sucesso!",
        description: "Processo finalizado com sucesso!",
        status: "success",
      });
    } else {
      toast({
        id: "update-status-process-error",
        title: "Erro na finalização do processo.",
        description: res.error?.message,
        status: "error",
        isClosable: true,
      });
    }
    onClose();
    handleLoading(true);
    refetchProcess();
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={["full", "xl"]}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Finalizar Processo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja finalizar o processo{" "}
            <strong>{process?.nickname}</strong>?
          </Text>
        </ModalBody>
        <ModalFooter gap="2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={() => handleFinalizedProcess()}
            size="sm"
          >
            Finalizar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
