import { writable } from 'svelte/store';
import type { Node, Edge, Viewport } from 'svelte-flow';

// Node types for the workflow system
export type NodeType = 
  | 'input-beat-markers'
  | 'input-transient-markers' 
  | 'input-audio-loudness'
  | 'input-video-motion'
  | 'logic-and'
  | 'logic-counter'
  | 'logic-map-range'
  | 'logic-random-gate'
  | 'output-cut-video'
  | 'output-set-effect'
  | 'output-select-clip';

// Custom node data interface
export interface NodeData {
  label: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  parameters?: Record<string, any>;
}

// Extended node interface with our custom data
export interface WorkflowNode extends Node {
  type: NodeType;
  data: NodeData;
}

// Store for managing the node graph state
export interface NodeGraphState {
  nodes: WorkflowNode[];
  edges: Edge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  isExecuting: boolean;
}

// Initial state
const initialState: NodeGraphState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  isExecuting: false
};

// Create the store
export const nodeGraphStore = writable<NodeGraphState>(initialState);

// Helper functions for managing the store
export const nodeGraphActions = {
  // Add a new node to the graph
  addNode: (node: WorkflowNode) => {
    nodeGraphStore.update(state => ({
      ...state,
      nodes: [...state.nodes, node]
    }));
  },

  // Remove a node and its connected edges
  removeNode: (nodeId: string) => {
    nodeGraphStore.update(state => ({
      ...state,
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: state.edges.filter(edge => 
        edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId
    }));
  },

  // Update node data
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => {
    nodeGraphStore.update(state => ({
      ...state,
      nodes: state.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  },

  // Add an edge between nodes
  addEdge: (edge: Edge) => {
    nodeGraphStore.update(state => ({
      ...state,
      edges: [...state.edges, edge]
    }));
  },

  // Remove an edge
  removeEdge: (edgeId: string) => {
    nodeGraphStore.update(state => ({
      ...state,
      edges: state.edges.filter(edge => edge.id !== edgeId)
    }));
  },

  // Update viewport
  updateViewport: (viewport: Viewport) => {
    nodeGraphStore.update(state => ({
      ...state,
      viewport
    }));
  },

  // Select a node
  selectNode: (nodeId: string | null) => {
    nodeGraphStore.update(state => ({
      ...state,
      selectedNodeId: nodeId
    }));
  },

  // Set execution state
  setExecuting: (isExecuting: boolean) => {
    nodeGraphStore.update(state => ({
      ...state,
      isExecuting
    }));
  },

  // Clear the entire graph
  clearGraph: () => {
    nodeGraphStore.set(initialState);
  },

  // Load graph from JSON
  loadGraph: (graphData: Partial<NodeGraphState>) => {
    nodeGraphStore.update(state => ({
      ...state,
      ...graphData
    }));
  },

  // Export graph to JSON
  exportGraph: (): Promise<NodeGraphState> => {
    return new Promise((resolve) => {
      nodeGraphStore.subscribe(state => {
        resolve(state);
      })();
    });
  }
};

// Node templates for the palette
export const nodeTemplates: Record<NodeType, Omit<WorkflowNode, 'id' | 'position'>> = {
  'input-beat-markers': {
    type: 'input-beat-markers',
    data: {
      label: 'Beat Markers',
      outputs: { beats: 'array' }
    }
  },
  'input-transient-markers': {
    type: 'input-transient-markers',
    data: {
      label: 'Transient Markers',
      outputs: { transients: 'array' }
    }
  },
  'input-audio-loudness': {
    type: 'input-audio-loudness',
    data: {
      label: 'Audio Loudness',
      outputs: { loudness: 'number' }
    }
  },
  'input-video-motion': {
    type: 'input-video-motion',
    data: {
      label: 'Video Motion',
      outputs: { motion: 'number' }
    }
  },
  'logic-and': {
    type: 'logic-and',
    data: {
      label: 'AND Gate',
      inputs: { a: 'boolean', b: 'boolean' },
      outputs: { result: 'boolean' }
    }
  },
  'logic-counter': {
    type: 'logic-counter',
    data: {
      label: 'Counter',
      inputs: { trigger: 'boolean', reset: 'boolean' },
      outputs: { count: 'number' },
      parameters: { maxCount: 10 }
    }
  },
  'logic-map-range': {
    type: 'logic-map-range',
    data: {
      label: 'Map Range',
      inputs: { value: 'number' },
      outputs: { mapped: 'number' },
      parameters: { 
        inputMin: 0, 
        inputMax: 1, 
        outputMin: 0, 
        outputMax: 100 
      }
    }
  },
  'logic-random-gate': {
    type: 'logic-random-gate',
    data: {
      label: 'Random Gate',
      inputs: { trigger: 'boolean' },
      outputs: { result: 'boolean' },
      parameters: { probability: 0.5 }
    }
  },
  'output-cut-video': {
    type: 'output-cut-video',
    data: {
      label: 'Cut Video',
      inputs: { trigger: 'boolean', intensity: 'number' }
    }
  },
  'output-set-effect': {
    type: 'output-set-effect',
    data: {
      label: 'Set Effect',
      inputs: { trigger: 'boolean', value: 'number' },
      parameters: { effectName: 'glitch', parameterName: 'intensity' }
    }
  },
  'output-select-clip': {
    type: 'output-select-clip',
    data: {
      label: 'Select Clip',
      inputs: { trigger: 'boolean', clipIndex: 'number' }
    }
  }
};
