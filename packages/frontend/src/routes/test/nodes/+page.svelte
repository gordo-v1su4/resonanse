<script>
  import { onMount } from 'svelte';
  import { nodeGraphStore, nodeGraphActions, nodeTemplates } from '$lib/stores/nodeGraphStore';

  let mounted = false;
  let nodes = [];
  let edges = [];
  let selectedNodeId = null;

  // Subscribe to store changes
  $: {
    const unsubscribe = nodeGraphStore.subscribe(state => {
      nodes = state.nodes;
      edges = state.edges;
      selectedNodeId = state.selectedNodeId;
    });
  }

  // Demo function to add a sample node
  function addSampleNode(nodeType) {
    const template = nodeTemplates[nodeType];
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { ...template.data }
    };
    nodeGraphActions.addNode(newNode);
  }

  // Demo function to clear all nodes
  function clearNodes() {
    nodeGraphActions.clearGraph();
  }

  // Demo function to test WASM integration
  async function testWasmIntegration() {
    try {
      const { initializeWasm } = await import('$lib/services/wasmService');
      const { logicEngine } = await initializeWasm();
      
      // Create sample graph data
      const graphData = {
        nodes: nodes.map(node => ({
          id: node.id,
          node_type: node.type,
          position: node.position,
          data: node.data
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          source_handle: edge.sourceHandle,
          target_handle: edge.targetHandle
        }))
      };

      const analysisData = {
        beat_timestamps: [1.0, 2.0, 3.0],
        transient_timestamps: [0.5, 1.5, 2.5],
        loudness_contour: [0.3, 0.7, 0.5, 0.8],
        current_time: 1.0
      };

      const result = logicEngine.run_node_graph(
        JSON.stringify(graphData),
        JSON.stringify(analysisData),
        1.0
      );

      console.log('WASM Node Graph Result:', result);
      alert(`WASM execution successful! Check console for details. Result: ${result}`);
    } catch (error) {
      console.error('WASM integration error:', error);
      alert(`WASM error: ${error.message}`);
    }
  }

  onMount(() => {
    mounted = true;
  });
</script>

<svelte:head>
  <title>Node Editor Test - Resonance</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <div class="bg-gray-800 border-b border-gray-700 p-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Node-Based Workflow Editor (Demo)</h1>
        <p class="text-gray-400 text-sm mt-1">
          Basic demonstration of node graph functionality with WASM integration
        </p>
      </div>
      <div class="flex gap-2">
        <a 
          href="/" 
          class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          ← Home
        </a>
        <a 
          href="/test/wasm" 
          class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
        >
          WASM Test
        </a>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="bg-gray-800 border-b border-gray-700 p-4">
    <div class="flex flex-wrap gap-2">
      <button 
        on:click={() => addSampleNode('input-beat-markers')}
        class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
      >
        + Beat Markers
      </button>
      <button 
        on:click={() => addSampleNode('input-audio-loudness')}
        class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
      >
        + Audio Loudness
      </button>
      <button 
        on:click={() => addSampleNode('logic-and')}
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
      >
        + AND Gate
      </button>
      <button 
        on:click={() => addSampleNode('logic-counter')}
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
      >
        + Counter
      </button>
      <button 
        on:click={() => addSampleNode('output-cut-video')}
        class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
      >
        + Cut Video
      </button>
      <button 
        on:click={clearNodes}
        class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
      >
        Clear All
      </button>
      <button 
        on:click={testWasmIntegration}
        class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded"
      >
        Test WASM
      </button>
    </div>
  </div>

  <!-- Node Display Area -->
  <div class="p-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Node List -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-4">Current Nodes ({nodes.length})</h2>
        {#if nodes.length === 0}
          <p class="text-gray-400 text-sm">No nodes created yet. Use the buttons above to add nodes.</p>
        {:else}
          <div class="space-y-2">
            {#each nodes as node}
              <div class="bg-gray-700 rounded p-3 border-l-4 {
                node.type.startsWith('input-') ? 'border-green-500' :
                node.type.startsWith('logic-') ? 'border-blue-500' :
                'border-red-500'
              }">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-medium">{node.data.label}</div>
                    <div class="text-xs text-gray-400">ID: {node.id}</div>
                    <div class="text-xs text-gray-400">Type: {node.type}</div>
                    <div class="text-xs text-gray-400">
                      Position: ({node.position.x.toFixed(0)}, {node.position.y.toFixed(0)})
                    </div>
                  </div>
                  <button 
                    on:click={() => nodeGraphActions.removeNode(node.id)}
                    class="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Graph Info -->
      <div class="bg-gray-800 rounded-lg p-4">
        <h2 class="text-lg font-semibold mb-4">Graph Information</h2>
        <div class="space-y-3">
          <div class="bg-gray-700 rounded p-3">
            <div class="text-sm text-gray-300">Total Nodes</div>
            <div class="text-xl font-bold">{nodes.length}</div>
          </div>
          <div class="bg-gray-700 rounded p-3">
            <div class="text-sm text-gray-300">Total Edges</div>
            <div class="text-xl font-bold">{edges.length}</div>
          </div>
          <div class="bg-gray-700 rounded p-3">
            <div class="text-sm text-gray-300">Selected Node</div>
            <div class="text-sm font-mono">{selectedNodeId || 'None'}</div>
          </div>
        </div>

        <!-- Node Type Breakdown -->
        <div class="mt-4">
          <h3 class="font-medium mb-2">Node Types</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-green-400">Input Nodes:</span>
              <span>{nodes.filter(n => n.type.startsWith('input-')).length}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-blue-400">Logic Nodes:</span>
              <span>{nodes.filter(n => n.type.startsWith('logic-')).length}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-red-400">Output Nodes:</span>
              <span>{nodes.filter(n => n.type.startsWith('output-')).length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-6 bg-gray-800 rounded-lg p-4">
      <h2 class="text-lg font-semibold mb-3">Implementation Status</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="bg-green-900 border border-green-700 rounded p-3">
          <h3 class="font-medium text-green-400 mb-2">✅ Completed</h3>
          <ul class="space-y-1 text-green-300">
            <li>• Node graph store with Svelte 5 runes</li>
            <li>• WASM integration for graph execution</li>
            <li>• Node templates and type system</li>
            <li>• Basic node management functions</li>
          </ul>
        </div>
        <div class="bg-yellow-900 border border-yellow-700 rounded p-3">
          <h3 class="font-medium text-yellow-400 mb-2">🚧 In Progress</h3>
          <ul class="space-y-1 text-yellow-300">
            <li>• Full Svelte Flow integration</li>
            <li>• Custom node components</li>
            <li>• Visual node editor canvas</li>
            <li>• Drag & drop functionality</li>
          </ul>
        </div>
        <div class="bg-blue-900 border border-blue-700 rounded p-3">
          <h3 class="font-medium text-blue-400 mb-2">📋 Next Steps</h3>
          <ul class="space-y-1 text-blue-300">
            <li>• Complete node palette</li>
            <li>• Real-time graph execution</li>
            <li>• Save/load functionality</li>
            <li>• Integration with audio analysis</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Custom scrollbar */
  :global(::-webkit-scrollbar) {
    width: 8px;
  }

  :global(::-webkit-scrollbar-track) {
    background: #374151;
  }

  :global(::-webkit-scrollbar-thumb) {
    background: #6b7280;
    border-radius: 4px;
  }

  :global(::-webkit-scrollbar-thumb:hover) {
    background: #9ca3af;
  }
</style>
