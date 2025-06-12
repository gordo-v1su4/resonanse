import * as THREE from 'three';
import { EFFECT_CONFIGS } from '../shaders/effects.js';

export class EffectsManager {
  constructor(composer) {
    this.composer = composer;
    this.effectPasses = new Map();
    this.effectOrder = [];
    this.time = 0;
  }

  async addEffect(effectName, config = {}) {
    if (!EFFECT_CONFIGS[effectName]) {
      console.error(`Unknown effect: ${effectName}`);
      return false;
    }

    if (this.effectPasses.has(effectName)) {
      console.warn(`Effect ${effectName} already exists`);
      return false;
    }

    try {
      const { ShaderPass } = await import('three/addons/postprocessing/ShaderPass.js');
      const effectConfig = EFFECT_CONFIGS[effectName];
      
      // Create shader pass
      const pass = new ShaderPass(effectConfig.shader);
      
      // Set initial uniform values
      Object.entries(effectConfig.uniforms).forEach(([uniformName, uniformConfig]) => {
        const value = config[uniformName] !== undefined ? config[uniformName] : uniformConfig.default;
        if (pass.uniforms[uniformName]) {
          pass.uniforms[uniformName].value = value;
        }
      });

      // Add to composer
      this.composer.addPass(pass);
      
      // Store reference
      this.effectPasses.set(effectName, pass);
      this.effectOrder.push(effectName);
      
      console.log(`✅ Added effect: ${effectName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to add effect ${effectName}:`, error);
      return false;
    }
  }

  removeEffect(effectName) {
    if (!this.effectPasses.has(effectName)) {
      console.warn(`Effect ${effectName} not found`);
      return false;
    }

    const pass = this.effectPasses.get(effectName);
    this.composer.removePass(pass);
    this.effectPasses.delete(effectName);
    
    // Remove from order array
    const index = this.effectOrder.indexOf(effectName);
    if (index > -1) {
      this.effectOrder.splice(index, 1);
    }

    console.log(`🗑️ Removed effect: ${effectName}`);
    return true;
  }

  updateUniform(effectName, uniformName, value) {
    if (!this.effectPasses.has(effectName)) {
      console.warn(`Effect ${effectName} not found`);
      return false;
    }

    const pass = this.effectPasses.get(effectName);
    if (pass.uniforms && pass.uniforms[uniformName]) {
      pass.uniforms[uniformName].value = value;
      return true;
    }

    console.warn(`Uniform ${uniformName} not found in effect ${effectName}`);
    return false;
  }

  getUniform(effectName, uniformName) {
    if (!this.effectPasses.has(effectName)) {
      return null;
    }

    const pass = this.effectPasses.get(effectName);
    if (pass.uniforms && pass.uniforms[uniformName]) {
      return pass.uniforms[uniformName].value;
    }

    return null;
  }

  reorderEffect(effectName, newIndex) {
    if (!this.effectPasses.has(effectName)) {
      console.warn(`Effect ${effectName} not found`);
      return false;
    }

    // Remove from current position
    const currentIndex = this.effectOrder.indexOf(effectName);
    if (currentIndex === -1) return false;

    this.effectOrder.splice(currentIndex, 1);
    
    // Insert at new position
    this.effectOrder.splice(newIndex, 0, effectName);
    
    // Rebuild composer passes
    this.rebuildComposer();
    
    return true;
  }

  rebuildComposer() {
    // Clear all passes except render pass
    const renderPass = this.composer.passes[0]; // Assuming first pass is render pass
    this.composer.passes = [renderPass];
    
    // Re-add effects in order
    this.effectOrder.forEach(effectName => {
      const pass = this.effectPasses.get(effectName);
      this.composer.addPass(pass);
    });
  }

  update(deltaTime, audioData = null) {
    this.time += deltaTime;
    
    // Update time-based uniforms
    this.effectPasses.forEach((pass, effectName) => {
      if (pass.uniforms.time) {
        pass.uniforms.time.value = this.time;
      }
    });

    // Update audio-reactive effects
    if (audioData) {
      this.updateAudioReactiveEffects(audioData);
    }
  }

  updateAudioReactiveEffects(audioData) {
    const { 
      volume = 0, 
      bass = 0, 
      mid = 0, 
      treble = 0, 
      beats = [], 
      transients = [] 
    } = audioData;

    // Example audio-reactive mappings
    this.effectPasses.forEach((pass, effectName) => {
      switch (effectName) {
        case 'glitch':
          // Map bass to glitch intensity
          if (pass.uniforms.intensity) {
            pass.uniforms.intensity.value = Math.min(bass * 2, 2);
          }
          break;
          
        case 'bloom':
          // Map volume to bloom intensity
          if (pass.uniforms.intensity) {
            pass.uniforms.intensity.value = 1 + volume * 2;
          }
          break;
          
        case 'rgbShift':
          // Map treble to RGB shift amount
          if (pass.uniforms.amount) {
            pass.uniforms.amount.value = treble * 0.02;
          }
          break;
          
        case 'filmGrain':
          // Map mid frequencies to film grain
          if (pass.uniforms.intensity) {
            pass.uniforms.intensity.value = mid * 0.8;
          }
          break;
      }
    });
  }

  getActiveEffects() {
    return Array.from(this.effectPasses.keys());
  }

  getEffectConfig(effectName) {
    return EFFECT_CONFIGS[effectName] || null;
  }

  getAllEffectConfigs() {
    return EFFECT_CONFIGS;
  }

  exportSettings() {
    const settings = {};
    
    this.effectPasses.forEach((pass, effectName) => {
      const config = EFFECT_CONFIGS[effectName];
      if (!config) return;
      
      settings[effectName] = {};
      Object.keys(config.uniforms).forEach(uniformName => {
        if (pass.uniforms[uniformName]) {
          settings[effectName][uniformName] = pass.uniforms[uniformName].value;
        }
      });
    });
    
    return {
      effects: settings,
      order: [...this.effectOrder]
    };
  }

  importSettings(settings) {
    // Clear existing effects
    this.effectOrder.forEach(effectName => {
      this.removeEffect(effectName);
    });
    
    // Add effects from settings
    if (settings.order) {
      settings.order.forEach(effectName => {
        if (settings.effects[effectName]) {
          this.addEffect(effectName, settings.effects[effectName]);
        }
      });
    }
  }

  dispose() {
    this.effectPasses.forEach((pass, effectName) => {
      this.removeEffect(effectName);
    });
    this.effectPasses.clear();
    this.effectOrder = [];
  }
}
