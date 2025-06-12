export class AudioAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.frequencyData = null;
    this.source = null;
    this.isInitialized = false;
    
    // Analysis parameters
    this.fftSize = 2048;
    this.smoothingTimeConstant = 0.8;
    
    // Frequency band ranges (in Hz)
    this.bassRange = [20, 250];
    this.midRange = [250, 4000];
    this.trebleRange = [4000, 20000];
    
    // Beat detection
    this.beatThreshold = 0.3;
    this.beatCooldown = 200; // ms
    this.lastBeatTime = 0;
    this.energyHistory = [];
    this.energyHistorySize = 43; // ~1 second at 60fps
    
    // Transient detection
    this.transientThreshold = 0.5;
    this.lastTransientTime = 0;
    this.transientCooldown = 100; // ms
    
    // Output data
    this.currentData = {
      volume: 0,
      bass: 0,
      mid: 0,
      treble: 0,
      beats: [],
      transients: [],
      frequencyBins: [],
      waveform: []
    };
  }

  async initialize(audioElement = null) {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
      
      // Create data arrays
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      
      // Connect audio source
      if (audioElement) {
        await this.connectAudioElement(audioElement);
      }
      
      this.isInitialized = true;
      console.log('✅ Audio analyzer initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio analyzer:', error);
      return false;
    }
  }

  async connectAudioElement(audioElement) {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      // Disconnect existing source
      if (this.source) {
        this.source.disconnect();
      }
      
      // Create media element source
      this.source = this.audioContext.createMediaElementSource(audioElement);
      
      // Connect: source -> analyser -> destination
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      console.log('✅ Audio element connected to analyzer');
    } catch (error) {
      console.error('❌ Failed to connect audio element:', error);
      throw error;
    }
  }

  async connectMicrophone() {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      
      console.log('✅ Microphone connected to analyzer');
    } catch (error) {
      console.error('❌ Failed to connect microphone:', error);
      throw error;
    }
  }

  analyze() {
    if (!this.isInitialized || !this.analyser) {
      return this.currentData;
    }

    // Get frequency and time domain data
    this.analyser.getByteFrequencyData(this.frequencyData);
    this.analyser.getByteTimeDomainData(this.dataArray);
    
    // Calculate overall volume
    const volume = this.calculateVolume();
    
    // Calculate frequency band energies
    const bass = this.calculateBandEnergy(this.bassRange);
    const mid = this.calculateBandEnergy(this.midRange);
    const treble = this.calculateBandEnergy(this.trebleRange);
    
    // Detect beats and transients
    const currentTime = Date.now();
    const beats = this.detectBeats(bass, currentTime);
    const transients = this.detectTransients(volume, currentTime);
    
    // Update current data
    this.currentData = {
      volume,
      bass,
      mid,
      treble,
      beats,
      transients,
      frequencyBins: Array.from(this.frequencyData),
      waveform: Array.from(this.dataArray)
    };
    
    return this.currentData;
  }

  calculateVolume() {
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const amplitude = (this.dataArray[i] - 128) / 128;
      sum += amplitude * amplitude;
    }
    return Math.sqrt(sum / this.dataArray.length);
  }

  calculateBandEnergy(frequencyRange) {
    const [minFreq, maxFreq] = frequencyRange;
    const nyquist = this.audioContext.sampleRate / 2;
    const binCount = this.frequencyData.length;
    
    const minBin = Math.floor((minFreq / nyquist) * binCount);
    const maxBin = Math.floor((maxFreq / nyquist) * binCount);
    
    let sum = 0;
    let count = 0;
    
    for (let i = minBin; i <= maxBin && i < binCount; i++) {
      sum += this.frequencyData[i];
      count++;
    }
    
    return count > 0 ? (sum / count) / 255 : 0;
  }

  detectBeats(bassEnergy, currentTime) {
    // Add current energy to history
    this.energyHistory.push(bassEnergy);
    if (this.energyHistory.length > this.energyHistorySize) {
      this.energyHistory.shift();
    }
    
    // Calculate average energy
    const avgEnergy = this.energyHistory.reduce((sum, energy) => sum + energy, 0) / this.energyHistory.length;
    
    // Detect beat
    const beats = [];
    if (bassEnergy > avgEnergy * (1 + this.beatThreshold) && 
        currentTime - this.lastBeatTime > this.beatCooldown) {
      beats.push({
        time: currentTime,
        energy: bassEnergy,
        confidence: Math.min((bassEnergy - avgEnergy) / avgEnergy, 1)
      });
      this.lastBeatTime = currentTime;
    }
    
    return beats;
  }

  detectTransients(volume, currentTime) {
    const transients = [];
    
    // Simple transient detection based on volume spikes
    if (volume > this.transientThreshold && 
        currentTime - this.lastTransientTime > this.transientCooldown) {
      transients.push({
        time: currentTime,
        amplitude: volume,
        confidence: Math.min(volume / this.transientThreshold, 1)
      });
      this.lastTransientTime = currentTime;
    }
    
    return transients;
  }

  getFrequencyAtBin(binIndex) {
    const nyquist = this.audioContext.sampleRate / 2;
    return (binIndex / this.frequencyData.length) * nyquist;
  }

  getBinAtFrequency(frequency) {
    const nyquist = this.audioContext.sampleRate / 2;
    return Math.floor((frequency / nyquist) * this.frequencyData.length);
  }

  setAnalysisParameters(params) {
    if (params.beatThreshold !== undefined) {
      this.beatThreshold = params.beatThreshold;
    }
    if (params.transientThreshold !== undefined) {
      this.transientThreshold = params.transientThreshold;
    }
    if (params.smoothingTimeConstant !== undefined && this.analyser) {
      this.analyser.smoothingTimeConstant = params.smoothingTimeConstant;
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      return this.audioContext.resume();
    }
  }

  suspend() {
    if (this.audioContext && this.audioContext.state === 'running') {
      return this.audioContext.suspend();
    }
  }

  dispose() {
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    console.log('🗑️ Audio analyzer disposed');
  }
}
