import { Card } from "@chakra-ui/react";
import ReactFlow, { Controls, Background, Node, Edge } from "reactflow";

import "reactflow/dist/style.css";

interface FlowProps {
  stages: Stage[];
  sequences: FlowSequence[];
  width?: string | number;
  maxWidth?: string | number;
  minHeight?: string | number;
}

export function Flow({
  stages,
  sequences,
  width = "100%",
  maxWidth = "unset",
  minHeight = 350,
}: FlowProps) {
  const nodes = stages.map((item, index) => {
    return {
      id: `${item.idStage}`,
      position: {
        x: 30 + index * 60,
        y: 30 + index * 75,
      },
      data: {
        label: item.name,
      },
    } as Node;
  });
  const edges = sequences.map((item) => {
    return {
      id: `edge-${item.from}-${item.to}`,
      source: `${item.from}`,
      target: `${item.to}`,
      animated: true,
      style: { stroke: "#1b9454" },
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
      <ReactFlow nodes={nodes} edges={edges}>
        <Controls />
        <Background />
      </ReactFlow>
    </Card>
  ) : null;
}
