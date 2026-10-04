"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  BaseEdge,
  getBezierPath,
  EdgeProps
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { motion } from "framer-motion";
import { parseMermaidFlow } from "@/utils/parseMermaidFlow";

const CustomNode = ({ data }: { data: any }) => {
  const isMisconception = data.category === 'misconception';
  const isReality = data.category === 'reality';
  
  let styles = "bg-zinc-900/90 border-zinc-700/60 shadow-lg";
  if (isMisconception) {
    styles = "bg-zinc-900/90 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.2)] text-rose-100";
  } else if (isReality) {
    styles = "bg-zinc-900/90 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-100";
  }

  const delay = (data.rank || 0) * 0.2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay }}
      className={`rounded-xl border backdrop-blur-md px-4 py-3 min-w-[160px] text-center text-xs font-semibold ${styles}`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </motion.div>
  );
};

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style = {},
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <motion.path
        id={id}
        d={edgePath}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
        strokeWidth={style.strokeWidth || 2}
        stroke={style.stroke || "rgba(255,255,255,0.2)"}
        fill="none"
        markerEnd={markerEnd}
      />
      <motion.circle
        r={3}
        fill="#38bdf8"
        className="filter drop-shadow-[0_0_5px_#38bdf8]"
        animate={{
          offsetDistance: ["0%", "100%"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
          delay: 1.5
        }}
        style={{ offsetPath: `path('${edgePath}')` } as any}
      />
    </>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

function CanvasFlow({ mermaidCode }: { mermaidCode: string }) {
  const { nodes, edges } = useMemo(() => parseMermaidFlow(mermaidCode), [mermaidCode]);
  const { fitView } = useReactFlow();

  useEffect(() => {
    // wait for nodes to mount and animate
    const timer = setTimeout(() => {
      fitView({ padding: 0.2, duration: 800 });
    }, 800);
    return () => clearTimeout(timer);
  }, [fitView, nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      proOptions={{ hideAttribution: true }}
      className="bg-[#09090b]"
      nodesConnectable={false}
      nodesDraggable={true}
      elementsSelectable={false}
    >
      <Background variant={"dots" as any} gap={20} size={2} color="#27272a" />
      <Controls showInteractive={false} className="opacity-50 hover:opacity-100" />
    </ReactFlow>
  );
}

export function AnimatedArchitectureCanvas({ mermaidCode }: { mermaidCode: string }) {
  return (
    <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-zinc-800 shadow-inner relative">
      <ReactFlowProvider>
        <CanvasFlow mermaidCode={mermaidCode} />
      </ReactFlowProvider>
    </div>
  );
}
