'use client';

import { useMemo, useCallback, useEffect, type MouseEvent } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Node,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type NodeProps,
  type EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { LinkSimple, X } from '@phosphor-icons/react';

import type { FollowUpWithDeps } from '@/features/process-meeting';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
  in_progress: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  completed: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
  medium: { bg: 'rgba(249,115,22,0.15)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  high: { bg: 'rgba(244,63,94,0.15)', text: '#fb7185', border: 'rgba(244,63,94,0.3)' },
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const LAYER_GAP_Y = 140;

// ─── Custom Node ─────────────────────────────────────────────────────────────

type FollowUpNodeData = {
  label: string;
  description?: string | null;
  status: string;
  priority: string;
  isLinking: boolean;
  isLinkTarget: boolean;
  onCycleStatus: () => void;
  onStartLink: () => void;
  onCompleteLink: () => void;
};

function FollowUpNode({ data }: NodeProps<Node<FollowUpNodeData>>) {
  const status = STATUS_COLORS[data.status] ?? STATUS_COLORS.pending;
  const priority = PRIORITY_COLORS[data.priority] ?? PRIORITY_COLORS.medium;

  const handleNodeClick = useCallback(
    (e: MouseEvent) => {
      if (data.isLinkTarget) {
        e.stopPropagation();
        data.onCompleteLink();
      }
    },
    [data]
  );

  return (
    <div
      onClick={handleNodeClick}
      className="group"
      style={{
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
        background: data.isLinking
          ? 'rgba(var(--primary-rgb, 139,92,246), 0.15)'
          : 'rgba(0,0,0,0.6)',
        border: `1px solid ${
          data.isLinking
            ? 'rgba(var(--primary-rgb, 139,92,246), 0.6)'
            : data.isLinkTarget
              ? 'rgba(var(--primary-rgb, 139,92,246), 0.4)'
              : 'rgba(255,255,255,0.08)'
        }`,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: data.isLinkTarget ? 'pointer' : 'default',
        backdropFilter: 'blur(8px)',
        boxShadow: data.isLinking
          ? '0 0 20px rgba(var(--primary-rgb, 139,92,246), 0.2)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease',
        borderStyle: data.isLinkTarget ? 'dashed' : 'solid',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'rgba(var(--primary-rgb, 139,92,246), 0.6)',
          border: '2px solid rgba(var(--primary-rgb, 139,92,246), 0.3)',
          width: 8,
          height: 8,
        }}
      />

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
        <span
          onClick={(e) => {
            e.stopPropagation();
            data.onCycleStatus();
          }}
          style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
          title={data.label}
        >
          {data.label}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onStartLink();
          }}
          className="nodrag nopan"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: 4,
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'rgba(255,255,255,0.4)',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title="Link dependency"
        >
          <LinkSimple size={12} />
        </button>
      </div>

      {/* Description */}
      {data.description && (
        <p
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: 10,
            margin: '4px 0 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {data.description}
        </p>
      )}

      {/* Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <span
          style={{
            background: status.bg,
            color: status.text,
            border: `1px solid ${status.border}`,
            borderRadius: 4,
            padding: '1px 6px',
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          {STATUS_LABELS[data.status] ?? data.status}
        </span>
        <span
          style={{
            background: priority.bg,
            color: priority.text,
            border: `1px solid ${priority.border}`,
            borderRadius: 4,
            padding: '1px 6px',
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'capitalize',
          }}
        >
          {data.priority}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: 'rgba(var(--primary-rgb, 139,92,246), 0.6)',
          border: '2px solid rgba(var(--primary-rgb, 139,92,246), 0.3)',
          width: 8,
          height: 8,
        }}
      />
    </div>
  );
}

const nodeTypes: NodeTypes = { followUp: FollowUpNode };

// ─── Custom Edge ─────────────────────────────────────────────────────────────

function RemovableEdge({
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
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} className="react-flow__edge-path" />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 1000,
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data?.onRemove) {
                (data.onRemove as () => void)();
              }
            }}
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(4px)',
            }}
            title="Remove dependency"
          >
            <X size={12} weight="bold" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const edgeTypes: EdgeTypes = { removable: RemovableEdge };

// ─── Layout Computation ──────────────────────────────────────────────────────

function computeLayeredLayout(items: FollowUpWithDeps[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  if (items.length === 0) return positions;

  // Kahn's algorithm for topological layering
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const item of items) {
    inDegree.set(item.id, item.dependsOn.length);
    for (const depId of item.dependedBy) {
      const existing = adjList.get(item.id) ?? [];
      existing.push(depId);
      adjList.set(item.id, existing);
    }
  }

  const layers = new Map<string, number>();
  const queue: string[] = [];

  for (const item of items) {
    if (item.dependsOn.length === 0) {
      queue.push(item.id);
      layers.set(item.id, 0);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layers.get(current) ?? 0;
    const successors = adjList.get(current) ?? [];
    for (const succ of successors) {
      const newLayer = Math.max(layers.get(succ) ?? 0, currentLayer + 1);
      layers.set(succ, newLayer);
      const deg = (inDegree.get(succ) ?? 1) - 1;
      inDegree.set(succ, deg);
      if (deg === 0) queue.push(succ);
    }
  }

  // Handle orphans/cycles
  for (const item of items) {
    if (!layers.has(item.id)) layers.set(item.id, 0);
  }

  // Group by layer
  const layerGroups = new Map<number, string[]>();
  for (const [id, layer] of layers) {
    const group = layerGroups.get(layer) ?? [];
    group.push(id);
    layerGroups.set(layer, group);
  }

  for (const [layer, ids] of layerGroups) {
    const totalWidth = ids.length * (NODE_WIDTH + 30) - 30;
    const startX = -totalWidth / 2;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: startX + i * (NODE_WIDTH + 30),
        y: layer * LAYER_GAP_Y,
      });
    });
  }

  return positions;
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface FlowGraphViewProps {
  items: FollowUpWithDeps[];
  linkingFrom: string | null;
  onStartLink: (id: string) => void;
  onCompleteLink: (targetId: string) => void;
  onRemoveLink: (sourceId: string, targetId: string) => void;
  onCycleStatus: (id: string) => void;
}

export function FlowGraphView({
  items,
  linkingFrom,
  onStartLink,
  onCompleteLink,
  onRemoveLink,
  onCycleStatus,
}: FlowGraphViewProps) {
  const layoutPositions = useMemo(() => computeLayeredLayout(items), [items]);

  const initialNodes = useMemo<Node<FollowUpNodeData>[]>(
    () =>
      items.map((item) => {
        const pos = layoutPositions.get(item.id) ?? { x: 0, y: 0 };
        return {
          id: item.id,
          type: 'followUp',
          position: pos,
          data: {
            label: item.title,
            description: item.description,
            status: item.status,
            priority: item.priority,
            isLinking: linkingFrom === item.id,
            isLinkTarget: linkingFrom !== null && linkingFrom !== item.id,
            onCycleStatus: () => onCycleStatus(item.id),
            onStartLink: () => onStartLink(item.id),
            onCompleteLink: () => onCompleteLink(item.id),
          },
        };
      }),
    [items, linkingFrom, layoutPositions, onCycleStatus, onStartLink, onCompleteLink]
  );

  const initialEdges = useMemo<Edge[]>(() => {
    const edgeList: Edge[] = [];
    for (const item of items) {
      for (const depId of item.dependsOn) {
        edgeList.push({
          id: `e-${depId}-${item.id}`,
          source: depId,
          target: item.id,
          type: 'removable',
          animated: true,
          style: {
            stroke: 'rgba(var(--primary-rgb, 139,92,246), 0.5)',
            strokeWidth: 2,
          },
          data: { 
            onRemove: () => onRemoveLink(item.id, depId)
          },
        });
      }
    }
    return edgeList;
  }, [items, onRemoveLink]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 350 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'rgba(var(--primary-rgb, 139,92,246), 0.4)', strokeWidth: 2 },
        }}
      >
        <Controls
          showInteractive={false}
          style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            backdropFilter: 'blur(8px)',
          }}
        />
        <MiniMap
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
          }}
          maskColor="rgba(0,0,0,0.6)"
          nodeColor={() => 'rgba(var(--primary-rgb, 139,92,246), 0.5)'}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.04)" />
      </ReactFlow>
    </div>
  );
}
