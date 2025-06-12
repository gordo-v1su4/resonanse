<script>
  import { onMount } from 'svelte';
  import { pb } from '$lib/services/pocketbase';

  let connectionStatus = '';
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      // Test PocketBase connection by checking health
      const healthData = await pb.health.check();
      
      if (healthData) {
        connectionStatus = 'Backend Connected';
      } else {
        connectionStatus = 'Backend connection failed';
      }
    } catch (err) {
      error = `Backend connection error: ${err.message}`;
      console.error('Backend Error:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-900 text-white p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Backend Connection Test</h1>
    
    <div class="mb-6">
      <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
    </div>
    
    {#if loading}
      <div class="bg-yellow-800 p-4 rounded-lg">
        <p class="text-yellow-200">Testing backend connection...</p>
      </div>
    {:else if error}
      <div class="bg-red-800 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-2">Connection Failed</h2>
        <p class="text-red-200">{error}</p>
        <p class="text-red-200 mt-2">Make sure PocketBase is running on http://127.0.0.1:8090</p>
      </div>
    {:else}
      <div class="bg-green-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-2">Connection Status</h2>
        <p class="text-green-200">✅ {connectionStatus}</p>
      </div>
    {/if}
    
    <div class="mt-6 bg-gray-800 p-6 rounded-lg">
      <h2 class="text-xl font-semibold mb-2">Instructions</h2>
      <p class="text-gray-300 mb-2">To test the backend connection:</p>
      <ol class="list-decimal list-inside text-gray-300 space-y-1">
        <li>Download PocketBase from <a href="https://pocketbase.io/docs/" class="text-blue-400 hover:text-blue-300">pocketbase.io</a></li>
        <li>Place the executable in <code class="bg-gray-700 px-1 rounded">packages/backend/</code></li>
        <li>Run: <code class="bg-gray-700 px-1 rounded">./pocketbase serve</code></li>
        <li>Refresh this page to test the connection</li>
      </ol>
    </div>
  </div>
</div>