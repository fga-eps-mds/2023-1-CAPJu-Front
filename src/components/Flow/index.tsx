import { Card, Skeleton } from "@chakra-ui/react";
import { useMemo } from "react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import _ from "lodash";

import { colors } from "styles/colors";
import { CommentEdge } from "./CommentEdge";

interface FlowProps {
  stages: Stage[];
  sequences: FlowSequence[];
  width?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  currentStage?: string | number | undefined;
  effectiveDate?: string | undefined;
  isFetching?: boolean;
  showStagesDuration?: boolean;
  processRecord?: string;
  refetch?: () => void;
  allowComments?: boolean;
}

export function Flow({
  stages,
  sequences,
  width = "100%",
  maxWidth = "unset",
  minHeight = 350,
  currentStage = undefined,
  effectiveDate = undefined,
  isFetching = false,
  showStagesDuration = false,
  processRecord = undefined,
  refetch = () => {},
  allowComments = false,
}: FlowProps) {
  const startDate = effectiveDate ? new Date(effectiveDate) : null;

  const getStageDeadline = (item: Stage, index: number): string | null => {
    if (!startDate || !effectiveDate) return null;

    const previousDuration = stages.reduce((acc, curr, reduceIndex) => {
      if (index <= reduceIndex) return acc;

      return acc + curr.duration + 1;
    }, 0);

    const stageStartDate = new Date(startDate);
    stageStartDate.setDate(startDate.getDate() + previousDuration);

    const stageEndDate = new Date(stageStartDate);
    stageEndDate.setDate(stageEndDate.getDate() + item.duration);

    return stageEndDate.toLocaleString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const nodes = useMemo(() => {
    return stages.map((item, index) => {
      const deadline = getStageDeadline(item, index);
      const stageLabel = `${_.startCase(item.name)}, ${
        showStagesDuration
          ? ` (${item.duration} dia${item.duration > 1 ? "s" : ""})`
          : ""
      }`;
      return {
        id: `${item.idStage}`,
        position: {
          x: 30 + index * 60,
          y: 30 + index * (currentStage ? 225 : 150),
        },
        data: {
          label: (
            <>
              {stageLabel}
              {deadline ? (
                <>
                  {" "}
                  <br /> {`Vencimento: ${deadline}`}{" "}
                </>
              ) : null}
            </>
          ),
        },
        style: {
          ...(currentStage === item.idStage
            ? {
                color: "white",
                background: colors.green["500"],
                fontWeight: "bold",
              }
            : {
                background: colors.gray["200"],
              }),
          width: deadline ? 280 : 200,
          minHeight: currentStage ? 80 : 60,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 13,
        },
      } as Node;
    });
  }, [stages, sequences, currentStage]);

  const edges = useMemo(() => {
    return sequences.map((sequence: FlowSequence) => {
      const to = stages.find((item) => item.idStage === sequence.to);
      const current = stages.find((item) => item.idStage === currentStage);

      return {
        id: `edge-${sequence.from}-${sequence.to}`,
        source: `${sequence.from}`,
        target: `${sequence.to}`,
        animated: currentStage === sequence.from,
        style: {
          stroke:
            currentStage === sequence.from ? "#1b9454" : colors.gray["200"],
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
        type:
          allowComments &&
          to &&
          current &&
          stages.indexOf(to) <= stages.indexOf(current) + 1
            ? "commentable"
            : null,
        data: {
          ...sequence,
          processRecord,
          refetch,
        },
      } as Edge;
    });
  }, [stages, sequences, currentStage]);

  const edgeTypes = {
    commentable: CommentEdge,
  };

  return isFetching ? (
    <Skeleton w={width} maxW={maxWidth} h={minHeight} />
  ) : (
    <>
      {!!nodes.length && !!edges.length ? (
        <Card
          variant="elevated"
          w={width}
          maxW={maxWidth}
          minH={minHeight}
          css={{ "> *": { flex: 1 } }}
        >
          <ReactFlow nodes={nodes} edges={edges} edgeTypes={edgeTypes} fitView>
            <Controls />
            <Background />
          </ReactFlow>
        </Card>
      ) : null}
    </>
  );
}
