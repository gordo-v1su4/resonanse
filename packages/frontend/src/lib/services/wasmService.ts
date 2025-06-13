import { initializeWasmWithFallback } from './wasmMock';

let logicEngine;
let audioStretcher;

export async function initializeWasm() {
  if (logicEngine && audioStretcher) {
    return { logicEngine, audioStretcher };
  }

  try {
    // Try to load real WASM modules
    const initLogicEngine = await import('$lib/wasm/logic-engine/logic_engine.js');
    const initAudioStretcher = await import('$lib/wasm/audio-stretcher/audio_stretcher.js');

    const logicEnginePromise = initLogicEngine.default();
    const audioStretcherPromise = initAudioStretcher.default();

    [logicEngine, audioStretcher] = await Promise.all([
      logicEnginePromise,
      audioStretcherPromise,
    ]);

    console.log('✅ Real WASM modules loaded successfully');
    return { logicEngine, audioStretcher };
  } catch (error) {
    console.warn('⚠️ Real WASM modules not available, falling back to mocks:', error.message);

    // Fall back to mock implementation
    return await initializeWasmWithFallback();
  }
}