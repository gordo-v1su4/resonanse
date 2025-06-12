import initLogicEngine from '$lib/wasm/logic-engine/logic_engine.js';
import initAudioStretcher from '$lib/wasm/audio-stretcher/audio_stretcher.js';

let logicEngine;
let audioStretcher;

export async function initializeWasm() {
  if (logicEngine && audioStretcher) {
    return { logicEngine, audioStretcher };
  }

  const logicEnginePromise = initLogicEngine();
  const audioStretcherPromise = initAudioStretcher();

  [logicEngine, audioStretcher] = await Promise.all([
    logicEnginePromise,
    audioStretcherPromise,
  ]);

  return { logicEngine, audioStretcher };
}