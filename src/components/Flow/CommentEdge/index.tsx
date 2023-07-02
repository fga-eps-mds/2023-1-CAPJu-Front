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

import { useLoading } from "hooks/useLoading";
import { addCommentToProcess } from "services/processes";
import { AddModal } from "./AddModal";

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
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const toast = useToast();
  const { handleLoading } = useLoading();
  const { from, to, processRecord, commentary, refetch } = data;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  async function handleClick(comment: string | null) {
    handleLoading(true);

    try {
      const res = await addCommentToProcess({
        record: processRecord,
        originStage: from,
        destinationStage: to,
        commentary: comment,
      });

      handleLoading(false);

      if (refetch) refetch();

      if (res.type === "success") {
        toast({
          id: `comment-${comment ? "add" : "add"}-sucess`,
          title: "Sucesso!",
          description: `Seu comentário foi ${
            comment ? "adicionado" : "adicionado"
          }`,
          status: "success",
        });
        return;
      }

      throw new Error(res.error.message);
    } catch (err: any) {
      handleLoading(false);
      toast({
        id: `comment-${comment ? "add" : "add"}-error`,
        title: `Erro ao ${comment ? "adicionar" : "adicionar"} comentário`,
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
              <Text noOfLines={2} fontSize="10">
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
                  >
                    <ViewIcon boxSize={2} />
                  </Button>
                </Tooltip>
                <Tooltip label="Editar observação" fontSize="xs">
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    height="4"
                    minH="4"
                    minW="4"
                    p="0"
                    borderRadius="3"
                  >
                    <Icon as={MdEdit} boxSize={2} />
                  </Button>
                </Tooltip>
                <Tooltip label="Remover observação" fontSize="xs">
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    height="4"
                    minH="4"
                    minW="4"
                    p="0"
                    borderRadius="3"
                    onClick={() => handleClick(null)}
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
            afterSubmission={() => {
              if (refetch) refetch();
            }}
            from={from}
            to={to}
            processRecord={processRecord}
          />
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
