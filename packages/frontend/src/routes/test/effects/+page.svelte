<script>
  import { onMount } from 'svelte';
  import ThreeCanvas from '$lib/components/ThreeCanvas.svelte';
  import EffectsPanel from '$lib/components/EffectsPanel.svelte';
  import { initializeWasmWithFallback, testMockWasm } from '$lib/services/wasmMock';
  
  // Component state
  let threeCanvas;
  let effectsManager = null;
  let audioAnalyzer = null;
  let currentAudioData = null;
  let wasmModules = null;
  
  // Test state
  let testResults = {
    wasm: 'pending',
    threejs: 'pending',
    webgpu: 'pending',
    audio: 'pending',
    effects: 'pending'
  };
  
  // Demo assets
  let testVideoUrl = null;
  let isGeneratingTestVideo = false;
  
  onMount(async () => {
    await runTests();
  });
  
  async function runTests() {
    // Test 1: WASM modules (with fallback)
    try {
      wasmModules = await initializeWasmWithFallback();
      testResults.wasm = 'success';
      console.log('✅ WASM modules loaded (real or mock)');
      
      // Run mock tests
      testMockWasm();
    } catch (error) {
      testResults.wasm = 'error';
      console.error('❌ WASM modules failed:', error);
    }
    
    // Test 2: Generate test video
    await generateTestVideo();
  }
  
  async function generateTestVideo() {
    isGeneratingTestVideo = true;
    
    try {
      // Create a test video using Canvas API
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      
      // Create video stream from canvas
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8'
      });
      
      const chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        testVideoUrl = URL.createObjectURL(blob);
        isGeneratingTestVideo = false;
        console.log('✅ Test video generated');
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Animate the canvas for 3 seconds
      let frame = 0;
      const animate = () => {
        if (frame < 90) { // 3 seconds at 30 FPS
          // Clear canvas
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw animated content
          const time = frame / 30;
          
          // Animated circle
          ctx.fillStyle = `hsl(${time * 60}, 70%, 50%)`;
          ctx.beginPath();
          ctx.arc(
            canvas.width / 2 + Math.sin(time * 2) * 100,
            canvas.height / 2 + Math.cos(time * 2) * 50,
            30 + Math.sin(time * 4) * 10,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          // Animated text
          ctx.fillStyle = '#fff';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(
            `Resonance Test Video - ${time.toFixed(1)}s`,
            canvas.width / 2,
            50
          );
          
          // Audio visualization bars
          for (let i = 0; i < 20; i++) {
            const height = 50 + Math.sin(time * 5 + i * 0.5) * 30;
            ctx.fillStyle = `hsl(${i * 18}, 60%, 60%)`;
            ctx.fillRect(
              50 + i * 25,
              canvas.height - 100,
              20,
              height
            );
          }
          
          frame++;
          requestAnimationFrame(animate);
        } else {
          mediaRecorder.stop();
        }
      };
      
      animate();
      
    } catch (error) {
      console.error('❌ Failed to generate test video:', error);
      isGeneratingTestVideo = false;
    }
  }
  
  function handleCanvasInitialized(event) {
    effectsManager = event.detail.effectsManager;
    audioAnalyzer = event.detail.audioAnalyzer;
    testResults.threejs = 'success';
    console.log('✅ Three.js canvas initialized');
    
    // Test audio analysis
    if (audioAnalyzer) {
      testResults.audio = 'success';
      console.log('✅ Audio analyzer ready');
    }
  }
  
  function handleAudioData(event) {
    currentAudioData = event.detail;
  }
  
  function testAllEffects() {
    if (!effectsManager) return;
    
    const effects = ['glitch', 'bloom', 'rgbShift', 'pixelation', 'filmGrain', 'vignette'];
    
    effects.forEach((effect, index) => {
      setTimeout(() => {
        effectsManager.addEffect(effect);
        console.log(`✅ Added effect: ${effect}`);
        
        if (index === effects.length - 1) {
          testResults.effects = 'success';
        }
      }, index * 500);
    });
  }
  
  function clearAllEffects() {
    if (!effectsManager) return;
    
    effectsManager.getActiveEffects().forEach(effect => {
      effectsManager.removeEffect(effect);
    });
  }
  
  function testAudioAnalysis() {
    if (!wasmModules?.logicEngine) return;
    
    try {
      // Generate test audio data
      const sampleRate = 44100;
      const duration = 1; // 1 second
      const samples = sampleRate * duration;
      const audioData = new Float32Array(samples);
      
      // Generate a sine wave with some noise
      for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        audioData[i] = 
          Math.sin(2 * Math.PI * 440 * t) * 0.5 + // 440 Hz tone
          Math.sin(2 * Math.PI * 880 * t) * 0.3 + // 880 Hz harmonic
          (Math.random() - 0.5) * 0.1; // Noise
      }
      
      // Analyze with WASM (real or mock)
      const result = wasmModules.logicEngine.analyze_audio_buffer(audioData, sampleRate);
      console.log('✅ WASM audio analysis result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ WASM audio analysis failed:', error);
      return null;
    }
  }
  
  function getStatusIcon(status) {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '⏳';
    }
  }
  
  function getStatusColor(status) {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  }
</script>

<svelte:head>
  <title>Resonance - Effects Test Suite</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Header -->
  <div class="p-6 border-b border-gray-700">
    <h1 class="text-3xl font-bold mb-2">Three.js Video Effects Test Suite</h1>
    <p class="text-gray-400">Comprehensive testing of video effects, audio reactivity, and WASM integration</p>
    
    <div class="mt-4">
      <a href="/" class="text-blue-400 hover:text-blue-300 mr-4">← Home</a>
      <a href="/demo" class="text-blue-400 hover:text-blue-300">Demo →</a>
    </div>
  </div>
  
  <div class="flex">
    <!-- Main Content -->
    <div class="flex-1 p-6">
      <!-- Test Status -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Test Status</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
          {#each Object.entries(testResults) as [test, status]}
            <div class="bg-gray-800 p-3 rounded">
              <div class="text-center">
                <div class="text-2xl mb-1">{getStatusIcon(status)}</div>
                <div class="text-sm font-medium capitalize">{test}</div>
                <div class="text-xs {getStatusColor(status)}">{status}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Test Controls -->
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Test Controls</h2>
        <div class="flex flex-wrap gap-3">
          <button
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            on:click={testAllEffects}
            disabled={!effectsManager}
          >
            Test All Effects
          </button>
          
          <button
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            on:click={clearAllEffects}
            disabled={!effectsManager}
          >
            Clear Effects
          </button>
          
          <button
            class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            on:click={testAudioAnalysis}
            disabled={!wasmModules}
          >
            Test WASM Audio Analysis
          </button>
          
          <button
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
            on:click={generateTestVideo}
            disabled={isGeneratingTestVideo}
          >
            {isGeneratingTestVideo ? 'Generating...' : 'Regenerate Test Video'}
          </button>
        </div>
      </div>
      
      <!-- Canvas Area -->
      <div class="bg-black rounded-lg overflow-hidden" style="height: 400px;">
        {#if testVideoUrl}
          <ThreeCanvas
            bind:this={threeCanvas}
            videoSrc={testVideoUrl}
            enableAudioAnalysis={true}
            on:initialized={handleCanvasInitialized}
            on:audioData={handleAudioData}
          />
        {:else if isGeneratingTestVideo}
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p>Generating test video...</p>
            </div>
          </div>
        {:else}
          <div class="flex items-center justify-center h-full">
            <p class="text-gray-400">Waiting for test video generation...</p>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Effects Panel -->
    <div class="w-80 border-l border-gray-700">
      <EffectsPanel
        {effectsManager}
        audioData={currentAudioData}
      />
    </div>
  </div>
</div>
