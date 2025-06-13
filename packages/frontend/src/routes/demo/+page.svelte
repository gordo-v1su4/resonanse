<script>
  import { onMount } from 'svelte';
  import ThreeCanvas from '$lib/components/ThreeCanvas.svelte';
  import EffectsPanel from '$lib/components/EffectsPanel.svelte';
  import { initializeWasmWithFallback } from '$lib/services/wasmMock';
  
  // Component state
  let threeCanvas;
  let effectsManager = null;
  let audioAnalyzer = null;
  let currentAudioData = null;
  let isPlaying = false;
  let showEffectsPanel = true;
  
  // Demo assets
  let selectedVideoFile = null;
  let selectedAudioFile = null;
  let videoUrl = null;
  let audioUrl = null;
  
  // Demo presets
  const demoPresets = {
    audioReactive: {
      name: 'Audio Reactive',
      effects: ['glitch', 'bloom', 'rgbShift'],
      description: 'Effects that respond to audio beats and frequency bands'
    },
    cinematic: {
      name: 'Cinematic',
      effects: ['vignette', 'filmGrain'],
      description: 'Film-like effects for a cinematic look'
    },
    digital: {
      name: 'Digital Glitch',
      effects: ['glitch', 'pixelation', 'rgbShift'],
      description: 'Digital distortion and glitch effects'
    },
    dreamy: {
      name: 'Dreamy',
      effects: ['bloom', 'vignette'],
      description: 'Soft, ethereal effects'
    }
  };
  
  onMount(async () => {
    // Initialize WASM modules
    try {
      await initializeWasmWithFallback();
      console.log('✅ WASM modules ready for demo');
    } catch (error) {
      console.warn('⚠️ WASM initialization failed:', error);
    }
    
    // Request microphone access for audio analysis
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log('✅ Microphone access granted'))
        .catch(() => console.log('⚠️ Microphone access denied'));
    }
  });
  
  function handleCanvasInitialized(event) {
    effectsManager = event.detail.effectsManager;
    audioAnalyzer = event.detail.audioAnalyzer;
    console.log('✅ Canvas initialized with services');
  }
  
  function handleAudioData(event) {
    currentAudioData = event.detail;
  }
  
  function handleVideoFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      selectedVideoFile = file;
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      videoUrl = URL.createObjectURL(file);
    }
  }
  
  function handleAudioFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      selectedAudioFile = file;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      audioUrl = URL.createObjectURL(file);
    }
  }
  
  function applyPreset(presetKey) {
    const preset = demoPresets[presetKey];
    if (!effectsManager || !preset) return;
    
    // Clear existing effects
    effectsManager.getActiveEffects().forEach(effectName => {
      effectsManager.removeEffect(effectName);
    });
    
    // Add preset effects
    preset.effects.forEach(effectName => {
      effectsManager.addEffect(effectName);
    });
    
    console.log(`✅ Applied preset: ${preset.name}`);
  }
  
  function togglePlayback() {
    if (threeCanvas) {
      if (isPlaying) {
        threeCanvas.pauseVideo();
      } else {
        threeCanvas.playVideo();
      }
      isPlaying = !isPlaying;
    }
  }
  
  function connectMicrophone() {
    if (audioAnalyzer) {
      audioAnalyzer.connectMicrophone()
        .then(() => {
          console.log('✅ Microphone connected for audio analysis');
        })
        .catch(error => {
          console.error('❌ Failed to connect microphone:', error);
        });
    }
  }
</script>

<svelte:head>
  <title>Resonance - Three.js Video Effects Demo</title>
</svelte:head>

<div class="demo-container h-screen bg-gray-900 text-white overflow-hidden">
  <!-- Main Canvas Area -->
  <div class="relative flex-1">
    <ThreeCanvas
      bind:this={threeCanvas}
      videoSrc={videoUrl}
      audioSrc={audioUrl}
      enableAudioAnalysis={true}
      on:initialized={handleCanvasInitialized}
      on:audioData={handleAudioData}
      on:videoLoaded={(e) => console.log('Video loaded:', e.detail)}
    />
    
    <!-- Overlay Controls -->
    <div class="absolute top-4 right-4 space-y-2">
      <button
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        on:click={togglePlayback}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      
      <button
        class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded block w-full"
        on:click={() => showEffectsPanel = !showEffectsPanel}
      >
        {showEffectsPanel ? 'Hide' : 'Show'} Effects
      </button>
      
      <button
        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded block w-full"
        on:click={connectMicrophone}
      >
        Use Microphone
      </button>
    </div>
    
    <!-- File Upload Controls -->
    <div class="absolute bottom-4 left-4 space-y-2">
      <div>
        <label class="block text-sm mb-1">Video File:</label>
        <input
          type="file"
          accept="video/*"
          class="text-sm"
          on:change={handleVideoFileSelect}
        />
      </div>
      
      <div>
        <label class="block text-sm mb-1">Audio File (optional):</label>
        <input
          type="file"
          accept="audio/*"
          class="text-sm"
          on:change={handleAudioFileSelect}
        />
      </div>
    </div>
    
    <!-- Preset Buttons -->
    <div class="absolute bottom-4 right-4 space-y-2">
      <div class="text-sm font-semibold mb-2">Effect Presets:</div>
      {#each Object.entries(demoPresets) as [presetKey, preset]}
        <button
          class="block w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-left"
          on:click={() => applyPreset(presetKey)}
          title={preset.description}
        >
          {preset.name}
        </button>
      {/each}
    </div>
  </div>
  
  <!-- Effects Panel Sidebar -->
  {#if showEffectsPanel}
    <div class="absolute top-0 right-0 w-80 h-full bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <EffectsPanel
        {effectsManager}
        audioData={currentAudioData}
        on:effectAdded={(e) => console.log('Effect added:', e.detail)}
        on:effectRemoved={(e) => console.log('Effect removed:', e.detail)}
        on:uniformUpdated={(e) => console.log('Uniform updated:', e.detail)}
      />
    </div>
  {/if}
</div>

<!-- Instructions Modal -->
{#if !videoUrl}
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-gray-800 p-8 rounded-lg max-w-md">
      <h2 class="text-2xl font-bold mb-4">Welcome to Resonance Demo</h2>
      <p class="mb-4">
        This demo showcases Three.js video effects with real-time audio reactivity.
      </p>
      
      <div class="space-y-3 text-sm">
        <div>
          <strong>To get started:</strong>
          <ol class="list-decimal list-inside mt-1 space-y-1">
            <li>Upload a video file using the file input</li>
            <li>Optionally upload a separate audio file</li>
            <li>Try different effect presets</li>
            <li>Use the effects panel to customize parameters</li>
            <li>Connect your microphone for live audio analysis</li>
          </ol>
        </div>
        
        <div>
          <strong>Features:</strong>
          <ul class="list-disc list-inside mt-1 space-y-1">
            <li>Real-time video effects with Three.js</li>
            <li>Audio-reactive parameters</li>
            <li>Beat and transient detection</li>
            <li>Frequency band analysis</li>
            <li>WebGPU/WebGL rendering</li>
            <li>Effect presets and customization</li>
          </ul>
        </div>
      </div>
      
      <div class="mt-6 text-center">
        <p class="text-gray-400 text-sm">
          Upload a video file to begin
        </p>
      </div>
    </div>
  </div>
{/if}

<style>
  .demo-container {
    display: flex;
    position: relative;
  }
  
  input[type="file"] {
    background: rgba(55, 65, 81, 0.8);
    border: 1px solid rgb(75, 85, 99);
    border-radius: 4px;
    padding: 4px 8px;
    color: white;
  }
  
  input[type="file"]::-webkit-file-upload-button {
    background: rgb(59, 130, 246);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px 8px;
    margin-right: 8px;
    cursor: pointer;
  }
</style>
