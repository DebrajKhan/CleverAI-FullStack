import dagre from 'dagre';
import { MarkerType } from '@xyflow/react';

export type FlowNode = {
  id: string;
  type?: string;
  data: { label: string; category: 'misconception' | 'reality' | 'default'; rank?: number };
  position: { x: number; y: number };
};

export type FlowEdge = {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
  markerEnd?: any;
  style?: any;
};

export function parseMermaidFlow(mermaidCode: string): { nodes: FlowNode[], edges: FlowEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, ranker: 'tight-tree' });
  g.setDefaultEdgeLabel(() => ({}));

  const nodes: Record<string, FlowNode> = {};
  const edges: FlowEdge[] = [];

  let currentCategory: 'misconception' | 'reality' | 'default' = 'default';

  const lines = mermaidCode.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line.startsWith('subgraph ')) {
      if (line.includes('Student_Mental_Model') || line.includes('Student_Intuition')) currentCategory = 'misconception';
      else if (line.includes('Actual_Architecture') || line.includes('System_Reality')) currentCategory = 'reality';
      else currentCategory = 'default';
    } else if (line === 'end') {
      currentCategory = 'default';
    }

    const edgeMatch = line.match(/^([A-Za-z0-9_]+)\s*(?:-->|-\.->)\s*([A-Za-z0-9_]+)/);
    if (edgeMatch) {
      const sourceId = edgeMatch[1];
      const targetId = edgeMatch[2];
      edges.push({
        id: `e-${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        animated: true,
        type: 'custom',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#71717a',
        },
        style: {
          stroke: '#71717a',
          strokeWidth: 2,
        },
      });
      g.setEdge(sourceId, targetId);
    }

    const nodeMatch = line.match(/([A-Za-z0-9_]+)\[(.*?)\]/);
    if (nodeMatch) {
      const id = nodeMatch[1];
      const label = nodeMatch[2];
      
      g.setNode(id, { width: 180, height: 50 });
      
      nodes[id] = {
        id,
        type: 'custom',
        data: { label, category: currentCategory },
        position: { x: 0, y: 0 }
      };
    }
  });

  dagre.layout(g);

  const computedNodes: FlowNode[] = [];
  g.nodes().forEach(n => {
    const nodeData = g.node(n);
    if (nodes[n] && nodeData) {
      const rank = Math.floor(nodeData.y / 50);
      nodes[n].position = { x: nodeData.x - 90, y: nodeData.y - 25 }; 
      nodes[n].data.rank = rank;
      computedNodes.push(nodes[n]);
    }
  });

  return { nodes: computedNodes, edges };
}
