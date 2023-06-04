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

interface FlowProps {
  stages: Stage[];
  sequences: FlowSequence[];
  width?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  currentStage?: string | number | undefined;
  effectiveDate?: string | undefined;
  isFetching?: boolean;
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
}: FlowProps) {
  const startDate = effectiveDate ? new Date(effectiveDate) : null;
  const sortedStages = useMemo(
    () =>
      stages.sort((a, b) => {
        const fromA =
          sequences.find((item) => item.from === a.idStage) ||
          ({} as FlowSequence);
        const fromB =
          sequences.find((item) => item.from === b.idStage) ||
          ({} as FlowSequence);

        const indexA = sequences.indexOf(fromA);
        const indexB = sequences.indexOf(fromB);

        return indexA > indexB ? 1 : 0;
      }),
    [stages]
  );

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

  const nodes = sortedStages.map((item, index) => {
    const deadline = getStageDeadline(item, index);

    return {
      id: `${item.idStage}`,
      position: {
        x: 30 + index * 60,
        y: 30 + index * (currentStage ? 125 : 100),
      },
      data: {
        label: deadline ? (
          <>
            {_.startCase(item.name)}
            <br />
            Vencimento: {deadline}
          </>
        ) : (
          _.startCase(item.name)
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
        width: deadline ? 240 : 180,
      },
    } as Node;
  });

  const edges = sequences.map((item) => {
    return {
      id: `edge-${item.from}-${item.to}`,
      source: `${item.from}`,
      target: `${item.to}`,
      animated: currentStage === item.from,
      style: {
        stroke: currentStage === item.from ? "#1b9454" : colors.gray["200"],
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "black" },
    } as Edge;
  });

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
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <Controls />
            <Background />
          </ReactFlow>
        </Card>
      ) : null}
    </>
  );
}
