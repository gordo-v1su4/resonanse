<script>
  import { onMount } from 'svelte';

  let logicEngineResult = '';
  let audioStretcherResult = '';
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      const { initializeWasm } = await import('$lib/services/wasmService');
      const { logicEngine, audioStretcher } = await initializeWasm();
      
      // Test logic engine
      const addResult = logicEngine.add(2, 2);
      logicEngineResult = `Logic Engine add(2, 2) = ${addResult}`;
      
      // Test audio stretcher
      const audioResult = audioStretcher.add(3, 3);
      audioStretcherResult = `Audio Stretcher add(3, 3) = ${audioResult}`;
      
    } catch (err) {
      error = `Error initializing WASM: ${err.message}`;
      console.error('WASM Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-900 text-white p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">WASM Module Tests</h1>
    
    <div class="mb-6">
      <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
    </div>
    
    {#if loading}
      <div class="bg-yellow-800 p-4 rounded-lg">
        <p class="text-yellow-200">Loading WASM modules...</p>
      </div>
    {:else if error}
      <div class="bg-red-800 p-4 rounded-lg">
        <p class="text-red-200">{error}</p>
      </div>
    {:else}
      <div class="space-y-6">
        <div class="bg-green-800 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">Logic Engine Test</h2>
          <p class="text-green-200">{logicEngineResult}</p>
        </div>
        
        <div class="bg-green-800 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">Audio Stretcher Test</h2>
          <p class="text-green-200">{audioStretcherResult}</p>
        </div>
        
        <div class="bg-blue-800 p-6 rounded-lg">
          <h2 class="text-xl font-semibold mb-2">Status</h2>
          <p class="text-blue-200">✅ Both WASM modules loaded successfully!</p>
        </div>
      </div>
    {/if}
  </div>
</div>