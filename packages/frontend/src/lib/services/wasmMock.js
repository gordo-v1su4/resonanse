// Mock WASM functions for development when Rust compilation is not available

export const mockLogicEngine = {
  add: (a, b) => a + b,
  
  analyze_audio_buffer: (audioData, sampleRate) => {
    // Mock audio analysis that simulates real WASM output
    const samples = audioData.length;
    const duration = samples / sampleRate;
    
    // Generate mock beat timestamps (every ~0.5 seconds)
    const beatTimestamps = [];
    for (let t = 0.5; t < duration; t += 0.5 + Math.random() * 0.3) {
      beatTimestamps.push(Math.floor(t * sampleRate));
    }
    
    // Generate mock transient timestamps
    const transientTimestamps = [];
    for (let i = 0; i < samples; i += Math.floor(sampleRate * 0.1)) {
      if (Math.random() > 0.7) {
        transientTimestamps.push(i);
      }
    }
    
    // Generate mock loudness contour
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms windows
    const loudnessContour = [];
    for (let i = 0; i < samples; i += windowSize) {
      const window = audioData.slice(i, i + windowSize);
      const rms = Math.sqrt(window.reduce((sum, x) => sum + x * x, 0) / window.length);
      loudnessContour.push(rms);
    }
    
    // Generate mock frequency bands (simplified FFT simulation)
    const frequencyBands = [];
    const fftSize = 1024;
    for (let i = 0; i < fftSize / 2; i++) {
      // Simulate frequency spectrum with some peaks
      const freq = (i / (fftSize / 2)) * (sampleRate / 2);
      let magnitude = Math.random() * 0.1;
      
      // Add some peaks at common frequencies
      if (freq > 60 && freq < 250) magnitude += Math.random() * 0.3; // Bass
      if (freq > 1000 && freq < 3000) magnitude += Math.random() * 0.2; // Mids
      if (freq > 5000 && freq < 10000) magnitude += Math.random() * 0.15; // Treble
      
      frequencyBands.push(magnitude);
    }
    
    // Estimate tempo from beat intervals
    let tempoEstimate = 0;
    if (beatTimestamps.length > 1) {
      const intervals = [];
      for (let i = 1; i < beatTimestamps.length; i++) {
        intervals.push((beatTimestamps[i] - beatTimestamps[i - 1]) / sampleRate);
      }
      const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      tempoEstimate = 60 / avgInterval; // Convert to BPM
    }
    
    return {
      beat_timestamps: beatTimestamps,
      transient_timestamps: transientTimestamps,
      loudness_contour: loudnessContour,
      frequency_bands: frequencyBands,
      tempo_estimate: tempoEstimate
    };
  }
};

export const mockAudioStretcher = {
  add: (a, b) => a + b,
  
  process_audio_chunk: (input, tempoRatio, pitchShiftSemitones) => {
    // Mock audio processing - just return modified input
    const output = new Float32Array(input.length);
    
    for (let i = 0; i < input.length; i++) {
      // Simple pitch shift simulation (not accurate, just for demo)
      const pitchFactor = Math.pow(2, pitchShiftSemitones / 12);
      const sourceIndex = Math.floor(i / pitchFactor);
      
      if (sourceIndex < input.length) {
        output[i] = input[sourceIndex] * 0.8; // Slight volume reduction
      } else {
        output[i] = 0;
      }
    }
    
    return Array.from(output);
  }
};

// Enhanced WASM service that falls back to mocks
export async function initializeWasmWithFallback() {
  try {
    // Try to load real WASM modules
    const { initializeWasm } = await import('./wasmService');
    const modules = await initializeWasm();
    console.log('✅ Real WASM modules loaded');
    return modules;
  } catch (error) {
    console.warn('⚠️ WASM modules not available, using mocks:', error.message);
    
    // Return mock modules
    return {
      logicEngine: mockLogicEngine,
      audioStretcher: mockAudioStretcher
    };
  }
}

// Test function to verify mock functionality
export function testMockWasm() {
  console.log('🧪 Testing mock WASM functions...');
  
  // Test basic math
  const addResult = mockLogicEngine.add(2, 3);
  console.log(`Add test: 2 + 3 = ${addResult}`);
  
  // Test audio analysis
  const sampleRate = 44100;
  const duration = 1; // 1 second
  const samples = sampleRate * duration;
  const testAudio = new Float32Array(samples);
  
  // Generate test sine wave
  for (let i = 0; i < samples; i++) {
    testAudio[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5;
  }
  
  const analysisResult = mockLogicEngine.analyze_audio_buffer(testAudio, sampleRate);
  console.log('Audio analysis test:', {
    beats: analysisResult.beat_timestamps.length,
    transients: analysisResult.transient_timestamps.length,
    loudnessPoints: analysisResult.loudness_contour.length,
    frequencyBins: analysisResult.frequency_bands.length,
    tempo: analysisResult.tempo_estimate.toFixed(1) + ' BPM'
  });
  
  // Test audio stretching
  const testChunk = new Float32Array(1024);
  for (let i = 0; i < testChunk.length; i++) {
    testChunk[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate);
  }
  
  const stretchedAudio = mockAudioStretcher.process_audio_chunk(testChunk, 1.2, 2);
  console.log(`Audio stretching test: ${testChunk.length} → ${stretchedAudio.length} samples`);
  
  console.log('✅ Mock WASM tests completed');
  
  return {
    addResult,
    analysisResult,
    stretchedLength: stretchedAudio.length
  };
}
