import { Card } from "@chakra-ui/react";
import ReactFlow, {
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import { colors } from "styles/colors";

interface FlowProps {
  stages: Stage[];
  sequences: FlowSequence[];
  width?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
  currentStage?: string | number;
}

export function Flow({
  stages,
  sequences,
  width = "100%",
  maxWidth = "unset",
  minHeight = 350,
  currentStage = "",
}: FlowProps) {
  const nodes = stages.map((item, index) => {
    return {
      id: `${item.idStage}`,
      position: {
        x: 30 + index * 60,
        y: 30 + index * (currentStage ? 125 : 75),
      },
      data: {
        label: item.name,
      },
      style:
        currentStage === item.idStage
          ? {
              color: "white",
              background: colors.green["500"],
              fontWeight: "bold",
            }
          : {
              background: colors.gray["200"],
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

  return !!nodes.length && !!edges.length ? (
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
  ) : null;
}
