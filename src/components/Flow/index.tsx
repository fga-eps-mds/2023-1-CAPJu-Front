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
import { handleDateFormating, handleExpiration } from "utils/dates";
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
  processRecord?: string;
  refetch?: () => void;
  allowComments?: boolean;
  process?: Process;
  isNextStage?: Boolean;
}

let whiteList: number[] = [];

export function Flow({
  stages,
  sequences,
  width = "100%",
  maxWidth = "unset",
  minHeight = 350,
  currentStage = undefined,
  effectiveDate = undefined,
  isFetching = false,
  processRecord = undefined,
  refetch = () => {},
  allowComments = false,
  process,
  isNextStage,
}: FlowProps) {
  const startDate = effectiveDate ? new Date(effectiveDate) : null;

  const formattedStages = useMemo(() => {
    const value = stages;
    const curr = stages.find((item) => item.idStage === process?.idStage);
    const currIndex = curr ? stages.indexOf(curr) : -1;

    value.forEach((stage, index) => {
      const stageProgress = process?.progress?.find(
        (item) => item.idStage === stage.idStage
      );

      if (stageProgress && process?.progress) {
        stage.entrada = process?.progress[index]?.entrada;
        stage.vencimento = process?.progress[index]?.vencimento;
      }

      if (index < currIndex) whiteList.push(stage.idStage);
      else whiteList = whiteList.filter((item) => item !== stage.idStage);
    });

    return value;
  }, [stages, process, sequences, isNextStage]);

  const getStageDeadline = (item: Stage, index: number): string | null => {
    if (!startDate || !effectiveDate) return null;

    const previousDuration = formattedStages.reduce(
      (acc, curr, reduceIndex) => {
        if (index <= reduceIndex) return acc;

        return acc + curr.duration + 1;
      },
      0
    );

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

  const handleDate = (item: Stage) => {
    if (!process?.idStage) {
      return (
        <>{`Vencimento: ${item.duration} Dia${item.duration > 1 ? "s" : ""}`}</>
      );
    }
    // Processo Iniciado
    if (process?.idStage) {
      if (process?.idStage === item.idStage) {
        if (!whiteList.includes(item?.idStage))
          whiteList.push(process?.idStage);

        if (whiteList.includes(item?.idStage) && !isNextStage) whiteList.pop();

        return (
          <>
            {item?.entrada ? (
              <>
                {`Entrada: ${
                  item?.entrada && handleDateFormating(item?.entrada)
                }`}
                <br />
              </>
            ) : null}

            {item?.vencimento
              ? `Vencimento: ${
                  item?.vencimento && handleDateFormating(item?.vencimento)
                }`
              : `Vencimento: ${item.duration} Dia${
                  item.duration > 1 ? "s" : ""
                }`}
          </>
        );
      }

      if (process?.idStage !== item.idStage) {
        if (whiteList.includes(item?.idStage)) {
          return (
            <>
              {item?.entrada ? (
                <>
                  {`Entrada: ${
                    item?.entrada && handleDateFormating(item?.entrada)
                  }`}
                  <br />
                </>
              ) : null}

              {item?.vencimento
                ? `Vencimento: ${
                    item?.vencimento && handleDateFormating(item?.vencimento)
                  }`
                : `Vencimento: ${item.duration} Dia${
                    item.duration > 1 ? "s" : ""
                  }`}
            </>
          );
        }

        return (
          <>{`Vencimento: ${item.duration} Dia${
            item.duration > 1 ? "s" : ""
          }`}</>
        );
      }
    }
    return "";
  };

  const nodes = useMemo(() => {
    return formattedStages.map((item, index) => {
      const deadline = getStageDeadline(item, index);

      return {
        id: `${item.idStage}`,
        position: {
          x: 30 + index * 60,
          y: 30 + index * (currentStage ? 225 : 150),
        },
        data: {
          label: (
            <>
              {_.startCase(item.name)} <br />
              {handleDate(item)}
            </>
          ),
        },
        style: {
          ...(currentStage === item.idStage
            ? {
                color: "white",
                background:
                  item?.vencimento && handleExpiration(item.vencimento)
                    ? colors.red["500"]
                    : colors.green["500"],
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
      const to = formattedStages.find((item) => item.idStage === sequence.to);
      const current = formattedStages.find(
        (item) => item.idStage === currentStage
      );

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
          formattedStages.indexOf(to) <= formattedStages.indexOf(current) + 1
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
