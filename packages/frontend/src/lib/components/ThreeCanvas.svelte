<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import * as THREE from 'three';
  import { EffectsManager } from '../services/effectsManager.js';
  import { AudioAnalyzer } from '../services/audioAnalyzer.js';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let videoSrc = null;
  export let audioSrc = null;
  export let enableAudioAnalysis = true;
  
  // Component state
  let canvasContainer;
  let scene, camera, renderer, composer;
  let videoElement, audioElement, videoTexture, videoMesh;
  let animationId;
  let isWebGPU = false;
  let lastTime = 0;
  
  // Services
  let effectsManager = null;
  let audioAnalyzer = null;
  let currentAudioData = null;
  
  // Export services for parent components
  export { effectsManager, audioAnalyzer, currentAudioData };
  
  onMount(async () => {
    await initializeThreeJS();
    setupScene();
    
    if (videoSrc) {
      await setupVideoTexture();
    }
    
    if (enableAudioAnalysis) {
      await setupAudioAnalysis();
    }
    
    await setupPostProcessing();
    startRenderLoop();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    dispatch('initialized', { effectsManager, audioAnalyzer });
  });
  
  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', handleResize);
    
    // Cleanup services
    if (effectsManager) {
      effectsManager.dispose();
    }
    if (audioAnalyzer) {
      audioAnalyzer.dispose();
    }
    
    // Cleanup Three.js resources
    if (renderer) {
      renderer.dispose();
    }
    if (videoTexture) {
      videoTexture.dispose();
    }
    if (videoElement) {
      document.body.removeChild(videoElement);
    }
    if (audioElement) {
      document.body.removeChild(audioElement);
    }
  });
  
  async function initializeThreeJS() {
    try {
      // Try WebGPU first
      const { WebGPURenderer } = await import('three/addons/renderers/webgpu/WebGPURenderer.js');
      renderer = new WebGPURenderer({ antialias: true });
      await renderer.init();
      isWebGPU = true;
      console.log('✅ WebGPU renderer initialized');
    } catch (error) {
      // Fallback to WebGL
      renderer = new THREE.WebGLRenderer({ antialias: true });
      isWebGPU = false;
      console.log('⚠️ WebGPU not supported, using WebGL renderer');
    }
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);
  }
  
  function setupScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
  }
  
  async function setupVideoTexture() {
    // Create hidden video element
    videoElement = document.createElement('video');
    videoElement.src = videoSrc;
    videoElement.crossOrigin = 'anonymous';
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.style.display = 'none';
    document.body.appendChild(videoElement);
    
    // Wait for video to load
    await new Promise((resolve, reject) => {
      videoElement.addEventListener('loadeddata', resolve);
      videoElement.addEventListener('error', reject);
      videoElement.load();
    });
    
    // Create video texture
    videoTexture = new THREE.VideoTexture(videoElement);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    
    // Create plane geometry for video
    const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
    const geometry = new THREE.PlaneGeometry(aspectRatio * 4, 4);
    const material = new THREE.MeshBasicMaterial({ map: videoTexture });
    videoMesh = new THREE.Mesh(geometry, material);
    scene.add(videoMesh);
    
    // Start video playback
    videoElement.play();
    
    dispatch('videoLoaded', { 
      width: videoElement.videoWidth, 
      height: videoElement.videoHeight 
    });
  }
  
  async function setupAudioAnalysis() {
    audioAnalyzer = new AudioAnalyzer();
    await audioAnalyzer.initialize();
    
    // Create audio element if audioSrc is provided
    if (audioSrc) {
      audioElement = document.createElement('audio');
      audioElement.src = audioSrc;
      audioElement.crossOrigin = 'anonymous';
      audioElement.loop = true;
      audioElement.style.display = 'none';
      document.body.appendChild(audioElement);
      
      await audioAnalyzer.connectAudioElement(audioElement);
      audioElement.play();
    } else if (videoElement) {
      // Use video audio if no separate audio source
      await audioAnalyzer.connectAudioElement(videoElement);
    }
    
    console.log('✅ Audio analysis setup complete');
  }
  
  async function setupPostProcessing() {
    try {
      const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js');
      
      composer = new EffectComposer(renderer);
      
      // Add render pass
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      
      // Initialize effects manager
      effectsManager = new EffectsManager(composer);
      
      console.log('✅ Post-processing pipeline initialized');
    } catch (error) {
      console.error('❌ Failed to initialize post-processing:', error);
    }
  }
  
  function startRenderLoop() {
    function animate(currentTime) {
      animationId = requestAnimationFrame(animate);
      
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      
      // Update video texture
      if (videoTexture) {
        videoTexture.needsUpdate = true;
      }
      
      // Analyze audio
      if (audioAnalyzer) {
        currentAudioData = audioAnalyzer.analyze();
        dispatch('audioData', currentAudioData);
      }
      
      // Update effects with audio data
      if (effectsManager) {
        effectsManager.update(deltaTime, currentAudioData);
      }
      
      // Render
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    }
    animate(0);
  }
  
  function handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    if (composer) {
      composer.setSize(width, height);
    }
  }
  
  // Public methods
  export function playVideo() {
    if (videoElement) videoElement.play();
    if (audioElement) audioElement.play();
  }
  
  export function pauseVideo() {
    if (videoElement) videoElement.pause();
    if (audioElement) audioElement.pause();
  }
  
  export function setVideoTime(time) {
    if (videoElement) videoElement.currentTime = time;
    if (audioElement) audioElement.currentTime = time;
  }
  
  // Reactive statements for prop changes
  $: if (videoSrc && videoElement) {
    videoElement.src = videoSrc;
    videoElement.load();
  }
  
  $: if (audioSrc && audioElement) {
    audioElement.src = audioSrc;
    audioElement.load();
  }
</script>

<div bind:this={canvasContainer} class="w-full h-full relative">
  <!-- Canvas will be appended here -->
  
  <!-- Debug info -->
  <div class="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded text-sm">
    <div>Renderer: {isWebGPU ? 'WebGPU' : 'WebGL'}</div>
    <div>Effects: {effectsManager?.getActiveEffects().length || 0}</div>
    {#if videoElement}
      <div>Video: {videoElement.videoWidth}x{videoElement.videoHeight}</div>
    {/if}
    {#if currentAudioData}
      <div>Audio: Vol {currentAudioData.volume.toFixed(2)}</div>
    {/if}
  </div>
</div>

<style>
  div {
    overflow: hidden;
  }
</style>
