import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import {
  Alert,
  Text,
  Button,
  Icon,
  Tooltip,
  Flex,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { MdDelete, MdEdit } from "react-icons/md";
import { ViewIcon } from "@chakra-ui/icons";

import { addNoteToProcess, deleteProcessNote } from "services/processes";
import { useLoading } from "hooks/useLoading";
import { AddModal } from "./AddModal";
import { DeletionModal } from "./DeletionModal";
import { ViewModal } from "./ViewModal";

export function CommentEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const toast = useToast();
  const { handleLoading } = useLoading();
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();
  const { from, to, processRecord, commentary, refetch, idNote } = data;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  async function handleComment(comment: string) {
    handleLoading(true);

    try {
      const res = await addNoteToProcess({
        record: processRecord,
        idStageA: from,
        idStageB: to,
        commentary: comment,
      });
      handleLoading(false);

      if (refetch) refetch();

      if (res.type === "success") {
        toast({
          id: `comment-add-success`,
          title: "Sucesso!",
          description: `Sua observação foi adicionada.`,
          status: "success",
        });
        return;
      }

      throw new Error(res.error.message);
    } catch (err: any) {
      handleLoading(false);
      toast({
        id: `comment-add-error`,
        title: `Erro ao adicionar observação`,
        description: err.message,
        status: "error",
        isClosable: true,
      });
    }
  }

  async function handleDeleteComment() {
    handleLoading(true);

    try {
      const res = await deleteProcessNote(idNote);
      handleLoading(false);

      if (refetch) refetch();

      if (res.type === "success") {
        toast({
          id: `comment-remove-sucess`,
          title: "Sucesso!",
          description: `Sua observação foi excluída.`,
          status: "success",
        });
        return;
      }

      throw new Error(res.error.message);
    } catch (err: any) {
      handleLoading(false);
      toast({
        id: `comment-remove-error`,
        title: `Erro ao excluir observação`,
        description: err.message,
        status: "error",
        isClosable: true,
      });
    }
  }

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          key={id}
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {!commentary ? (
            <Button
              colorScheme="blue"
              size="xs"
              fontSize="10"
              onClick={() => onAddOpen()}
            >
              <Icon as={MdEdit} boxSize={3} mr={1} />
              Adicionar observação
            </Button>
          ) : (
            <Alert
              status="info"
              variant="left-accent"
              minW={200}
              maxW={240}
              gap="3"
              p="2"
              flexDir="column"
              alignItems="start"
            >
              <Text noOfLines={1} fontSize="10">
                {commentary}
              </Text>
              <Flex flexDir="row" gap="1" ml="auto">
                <Tooltip label="Ler observação por completo" fontSize="xs">
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    height="4"
                    minH="4"
                    minW="4"
                    p="0"
                    borderRadius="3"
                    onClick={() => onViewOpen()}
                  >
                    <ViewIcon boxSize={2} />
                  </Button>
                </Tooltip>
                <Tooltip label="Excluir observação" fontSize="xs">
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    height="4"
                    minH="4"
                    minW="4"
                    p="0"
                    borderRadius="3"
                    onClick={() => onDeleteOpen()}
                  >
                    <Icon as={MdDelete} boxSize={2} />
                  </Button>
                </Tooltip>
              </Flex>
            </Alert>
          )}
          <AddModal
            isOpen={isAddOpen}
            onClose={onAddClose}
            handleComment={(comment: string) => handleComment(comment)}
          />
          <DeletionModal
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            handleComment={() => handleDeleteComment()}
          />
          <ViewModal
            isOpen={isViewOpen}
            onClose={onViewClose}
            comment={commentary}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
