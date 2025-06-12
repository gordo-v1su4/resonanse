<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Props
  export let effectsManager = null;
  export let audioData = null;
  
  // State
  let availableEffects = {};
  let activeEffects = [];
  let selectedEffect = null;
  let showAddMenu = false;
  
  // Reactive updates
  $: if (effectsManager) {
    availableEffects = effectsManager.getAllEffectConfigs();
    activeEffects = effectsManager.getActiveEffects();
  }
  
  function addEffect(effectName) {
    if (effectsManager) {
      effectsManager.addEffect(effectName);
      activeEffects = effectsManager.getActiveEffects();
      showAddMenu = false;
      dispatch('effectAdded', { effectName });
    }
  }
  
  function removeEffect(effectName) {
    if (effectsManager) {
      effectsManager.removeEffect(effectName);
      activeEffects = effectsManager.getActiveEffects();
      if (selectedEffect === effectName) {
        selectedEffect = null;
      }
      dispatch('effectRemoved', { effectName });
    }
  }
  
  function updateUniform(effectName, uniformName, value) {
    if (effectsManager) {
      effectsManager.updateUniform(effectName, uniformName, parseFloat(value));
      dispatch('uniformUpdated', { effectName, uniformName, value });
    }
  }
  
  function moveEffect(effectName, direction) {
    if (!effectsManager) return;
    
    const currentIndex = activeEffects.indexOf(effectName);
    let newIndex = currentIndex;
    
    if (direction === 'up' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < activeEffects.length - 1) {
      newIndex = currentIndex + 1;
    }
    
    if (newIndex !== currentIndex) {
      effectsManager.reorderEffect(effectName, newIndex);
      activeEffects = effectsManager.getActiveEffects();
      dispatch('effectReordered', { effectName, newIndex });
    }
  }
  
  function exportSettings() {
    if (effectsManager) {
      const settings = effectsManager.exportSettings();
      const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'effects-preset.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  
  function importSettings(event) {
    const file = event.target.files[0];
    if (!file || !effectsManager) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        effectsManager.importSettings(settings);
        activeEffects = effectsManager.getActiveEffects();
        dispatch('settingsImported', { settings });
      } catch (error) {
        console.error('Failed to import settings:', error);
      }
    };
    reader.readAsText(file);
  }
</script>

<div class="effects-panel bg-gray-800 text-white p-4 rounded-lg">
  <!-- Header -->
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold">Effects</h2>
    <div class="flex gap-2">
      <button
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
        on:click={() => showAddMenu = !showAddMenu}
      >
        Add Effect
      </button>
      <button
        class="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
        on:click={exportSettings}
      >
        Export
      </button>
      <label class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm cursor-pointer">
        Import
        <input
          type="file"
          accept=".json"
          class="hidden"
          on:change={importSettings}
        />
      </label>
    </div>
  </div>
  
  <!-- Add Effect Menu -->
  {#if showAddMenu}
    <div class="mb-4 p-3 bg-gray-700 rounded">
      <h3 class="text-sm font-semibold mb-2">Available Effects</h3>
      <div class="grid grid-cols-2 gap-2">
        {#each Object.entries(availableEffects) as [effectKey, effectConfig]}
          <button
            class="p-2 bg-gray-600 hover:bg-gray-500 rounded text-sm text-left"
            class:opacity-50={activeEffects.includes(effectKey)}
            disabled={activeEffects.includes(effectKey)}
            on:click={() => addEffect(effectKey)}
          >
            {effectConfig.name}
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Active Effects -->
  <div class="space-y-3">
    {#each activeEffects as effectName, index}
      {@const effectConfig = availableEffects[effectName]}
      {#if effectConfig}
        <div class="effect-item bg-gray-700 p-3 rounded">
          <!-- Effect Header -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="font-semibold">{effectConfig.name}</span>
              <span class="text-xs text-gray-400">#{index + 1}</span>
            </div>
            <div class="flex gap-1">
              <button
                class="p-1 hover:bg-gray-600 rounded"
                disabled={index === 0}
                on:click={() => moveEffect(effectName, 'up')}
              >
                ↑
              </button>
              <button
                class="p-1 hover:bg-gray-600 rounded"
                disabled={index === activeEffects.length - 1}
                on:click={() => moveEffect(effectName, 'down')}
              >
                ↓
              </button>
              <button
                class="p-1 hover:bg-red-600 rounded text-red-400"
                on:click={() => removeEffect(effectName)}
              >
                ×
              </button>
            </div>
          </div>
          
          <!-- Effect Controls -->
          <div class="space-y-2">
            {#each Object.entries(effectConfig.uniforms) as [uniformName, uniformConfig]}
              {@const currentValue = effectsManager?.getUniform(effectName, uniformName) ?? uniformConfig.default}
              <div class="uniform-control">
                <div class="flex justify-between items-center mb-1">
                  <label class="text-sm capitalize">{uniformName}</label>
                  <span class="text-xs text-gray-400">{currentValue.toFixed(3)}</span>
                </div>
                
                <input
                  type="range"
                  min={uniformConfig.min}
                  max={uniformConfig.max}
                  step={uniformConfig.step}
                  value={currentValue}
                  class="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  on:input={(e) => updateUniform(effectName, uniformName, e.target.value)}
                />
              </div>
            {/each}
          </div>
          
          <!-- Audio Reactivity Indicator -->
          {#if audioData}
            <div class="mt-2 text-xs text-gray-400">
              Audio: Vol {audioData.volume.toFixed(2)} | 
              Bass {audioData.bass.toFixed(2)} | 
              Mid {audioData.mid.toFixed(2)} | 
              Treble {audioData.treble.toFixed(2)}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
    
    {#if activeEffects.length === 0}
      <div class="text-center text-gray-400 py-8">
        <p>No effects active</p>
        <p class="text-sm">Click "Add Effect" to get started</p>
      </div>
    {/if}
  </div>
  
  <!-- Audio Analysis Display -->
  {#if audioData}
    <div class="mt-4 p-3 bg-gray-700 rounded">
      <h3 class="text-sm font-semibold mb-2">Audio Analysis</h3>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>Volume: {audioData.volume.toFixed(3)}</div>
        <div>Bass: {audioData.bass.toFixed(3)}</div>
        <div>Mid: {audioData.mid.toFixed(3)}</div>
        <div>Treble: {audioData.treble.toFixed(3)}</div>
      </div>
      
      {#if audioData.beats.length > 0}
        <div class="mt-2 text-xs text-green-400">
          🥁 Beat detected (confidence: {audioData.beats[0].confidence.toFixed(2)})
        </div>
      {/if}
      
      {#if audioData.transients.length > 0}
        <div class="mt-1 text-xs text-yellow-400">
          ⚡ Transient detected (amplitude: {audioData.transients[0].amplitude.toFixed(2)})
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
  }
  
  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
  }
  
  .effect-item {
    transition: all 0.2s ease;
  }
  
  .effect-item:hover {
    background-color: rgb(55, 65, 81);
  }
</style>
