<<<<<<< HEAD
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
    
    <!-- Feature Highlights -->
    <div class="mb-8 bg-gray-800 p-6 rounded-lg">
      <h2 class="text-2xl font-semibold mb-4">🎨 Three.js Video Effects & Audio Reactivity</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h3 class="font-semibold text-blue-400 mb-2">Video Effects</h3>
          <ul class="space-y-1 text-gray-300">
            <li>• Glitch & Digital Distortion</li>
            <li>• Bloom & Lighting Effects</li>
            <li>• RGB Shift & Color Separation</li>
            <li>• Pixelation & Retro Filters</li>
            <li>• Film Grain & Cinematic Look</li>
            <li>• Vignette & Focus Effects</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-green-400 mb-2">Audio Reactivity</h3>
          <ul class="space-y-1 text-gray-300">
            <li>• Real-time Audio Analysis</li>
            <li>• Beat & Transient Detection</li>
            <li>• Frequency Band Separation</li>
            <li>• Volume & Loudness Tracking</li>
            <li>• Microphone Input Support</li>
            <li>• WASM-powered Processing</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-purple-400 mb-2">Technology</h3>
          <ul class="space-y-1 text-gray-300">
            <li>• Three.js with WebGPU/WebGL</li>
            <li>• Custom Shader Effects</li>
            <li>• Web Audio API Integration</li>
            <li>• Rust WASM Audio Engine</li>
            <li>• Real-time Post-processing</li>
            <li>• Svelte 5 Reactive UI</li>
          </ul>
        </div>
      </div>
    </div>

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
          <a href="/demo" class="block text-blue-400 hover:text-blue-300 font-semibold">🎬 Video Effects Demo</a>
          <a href="/test/effects" class="block text-blue-400 hover:text-blue-300 font-semibold">🧪 Effects Test Suite</a>
          <a href="/test/wasm" class="block text-blue-400 hover:text-blue-300">Test WASM Functions</a>
          <a href="/test/backend" class="block text-blue-400 hover:text-blue-300">Test Backend Connection</a>
          <a href="/test/nodes" class="block text-green-400 hover:text-green-300">🎯 Node-Based Workflow Editor</a>
        </div>
      </div>
    </div>
  </div>
</div>
=======
<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
>>>>>>> main
