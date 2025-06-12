<script>
  import { onMount } from 'svelte';

  let wasmResult = '';
  let loading = true;

  onMount(async () => {
    try {
      const { initializeWasm } = await import('$lib/services/wasmService');
      const { logicEngine } = await initializeWasm();
      
      // Test the WASM function
      const result = logicEngine.add(2, 2);
      wasmResult = `WASM Result: ${result}`;
    } catch (error) {
      wasmResult = `Error: ${error.message}`;
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-900 text-white p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-bold mb-8 text-center">Resonance - Audio-Reactive Video Editor</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold mb-4">WASM Test</h2>
        {#if loading}
          <p class="text-yellow-400">Loading WASM modules...</p>
        {:else}
          <p class="text-green-400">{wasmResult}</p>
        {/if}
      </div>
      
      <div class="bg-gray-800 p-6 rounded-lg">
        <h2 class="text-2xl font-semibold mb-4">Navigation</h2>
        <div class="space-y-2">
          <a href="/test/wasm" class="block text-blue-400 hover:text-blue-300">Test WASM Functions</a>
          <a href="/test/backend" class="block text-blue-400 hover:text-blue-300">Test Backend Connection</a>
        </div>
      </div>
    </div>
  </div>
</div>