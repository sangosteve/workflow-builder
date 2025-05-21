'use client'

import React, { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import { nanoid } from 'nanoid'
import TriggerNode from '@/components/nodes/TriggerNode'
import ActionNode from '@/components/nodes/ActionNode'
import ButtonEdge from '@/components/flow/button-edge'

import '@xyflow/react/dist/style.css'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'trigger',
    data: { label: 'Trigger Node' },
    position: { x: 100, y: 100 },
  },
  {
    id: '2',
    type: 'action',
    data: { label: 'Action Node 1', message: 'Hello from action 1' },
    position: { x: 100, y: 300 },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'buttonedge',
  },
]

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
}

const edgeTypes = {
  buttonedge: ButtonEdge,
}

const getAutoPositionedNodes = (nodes: Node[]) => {
  const baseX = 100
  const spacingY = 200
  return nodes.map((node, index) => ({
    ...node,
    position: { x: baseX, y: 100 + index * spacingY },
  }))
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(getAutoPositionedNodes(initialNodes))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const handleAddNode = useCallback((sourceId: string) => {
    const newNode: Node = {
      id: nanoid(),
      type: 'action',
      data: {
        label: 'New Node',
      },
      position: { x: 100, y: 100 },
    }

    const newEdge: Edge = {
      id: nanoid(),
      source: sourceId,
      target: newNode.id,
      type: 'buttonedge',
    }

    setNodes((prev) => getAutoPositionedNodes([...prev, newNode]))
    setEdges((prev) => [...prev, newEdge])
  }, [])

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      const nodeToRemove = nodes.find((n) => n.id === nodeId)
      if (!nodeToRemove || nodeToRemove.type === 'trigger') return

      setEdges((prevEdges) => {
        const incoming = prevEdges.find((e) => e.target === nodeId)
        const outgoing = prevEdges.find((e) => e.source === nodeId)

        const rest = prevEdges.filter((e) => e.source !== nodeId && e.target !== nodeId)

        if (incoming && outgoing) {
          return [
            ...rest,
            {
              id: `e${incoming.source}-${outgoing.target}`,
              source: incoming.source,
              target: outgoing.target,
              type: 'buttonedge',
            },
          ]
        }

        return rest
      })

      setNodes((prev) => getAutoPositionedNodes(prev.filter((n) => n.id !== nodeId)))
    },
    [nodes]
  )

  // Derived final nodes with dynamic flags and handlers
  const displayNodes = useMemo(() => {
    const sourcesWithEdges = new Set(edges.map((e) => e.source))

    return nodes.map((node) => {
      return {
        ...node,
        data: {
          ...node.data,
          onAdd: handleAddNode,
          onRemove: node.type === 'action' ? handleRemoveNode : undefined,
          hasChildNode: sourcesWithEdges.has(node.id),
        },
      }
    })
  }, [nodes, edges, handleAddNode, handleRemoveNode])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
