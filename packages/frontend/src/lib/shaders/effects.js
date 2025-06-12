// Shader effects library for Three.js post-processing

export const GlitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.5 },
    blockSize: { value: 0.1 },
    time: { value: 0.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float blockSize;
    uniform float time;
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Digital glitch effect
      float glitchStrength = intensity * (0.5 + 0.5 * sin(time * 10.0));
      
      // Block-based distortion
      vec2 blockUv = floor(uv / blockSize) * blockSize;
      float noise = random(blockUv + time);
      
      if (noise > 0.8) {
        uv.x += (noise - 0.8) * glitchStrength * 0.1;
      }
      
      // RGB shift
      vec4 color;
      color.r = texture2D(tDiffuse, uv + vec2(glitchStrength * 0.01, 0.0)).r;
      color.g = texture2D(tDiffuse, uv).g;
      color.b = texture2D(tDiffuse, uv - vec2(glitchStrength * 0.01, 0.0)).b;
      color.a = 1.0;
      
      gl_FragColor = color;
    }
  `
};

export const BloomShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 1.0 },
    threshold: { value: 0.8 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float threshold;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Calculate luminance
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      
      // Apply bloom threshold
      if (luminance > threshold) {
        color.rgb *= intensity * (luminance - threshold);
      }
      
      gl_FragColor = color;
    }
  `
};

export const RGBShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.005 },
    angle: { value: 0.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float angle;
    varying vec2 vUv;
    
    void main() {
      vec2 offset = amount * vec2(cos(angle), sin(angle));
      
      vec4 color;
      color.r = texture2D(tDiffuse, vUv + offset).r;
      color.g = texture2D(tDiffuse, vUv).g;
      color.b = texture2D(tDiffuse, vUv - offset).b;
      color.a = texture2D(tDiffuse, vUv).a;
      
      gl_FragColor = color;
    }
  `
};

export const PixelationShader = {
  uniforms: {
    tDiffuse: { value: null },
    pixelSize: { value: 8.0 },
    resolution: { value: { x: 1920, y: 1080 } }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float pixelSize;
    uniform vec2 resolution;
    varying vec2 vUv;
    
    void main() {
      vec2 pixelatedUv = floor(vUv * resolution / pixelSize) * pixelSize / resolution;
      gl_FragColor = texture2D(tDiffuse, pixelatedUv);
    }
  `
};

export const FilmGrainShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.5 },
    time: { value: 0.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float time;
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Generate film grain
      float grain = random(vUv + time) * 2.0 - 1.0;
      grain *= intensity;
      
      // Apply grain
      color.rgb += grain;
      
      gl_FragColor = color;
    }
  `
};

export const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.5 },
    smoothness: { value: 0.5 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float smoothness;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Calculate distance from center
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(vUv, center);
      
      // Create vignette
      float vignette = smoothstep(intensity, intensity - smoothness, dist);
      
      color.rgb *= vignette;
      
      gl_FragColor = color;
    }
  `
};

// Effect configurations
export const EFFECT_CONFIGS = {
  glitch: {
    name: 'Glitch',
    shader: GlitchShader,
    uniforms: {
      intensity: { min: 0, max: 2, default: 0.5, step: 0.01 },
      blockSize: { min: 0.01, max: 0.5, default: 0.1, step: 0.01 }
    }
  },
  bloom: {
    name: 'Bloom',
    shader: BloomShader,
    uniforms: {
      intensity: { min: 0, max: 3, default: 1.0, step: 0.01 },
      threshold: { min: 0, max: 1, default: 0.8, step: 0.01 }
    }
  },
  rgbShift: {
    name: 'RGB Shift',
    shader: RGBShiftShader,
    uniforms: {
      amount: { min: 0, max: 0.05, default: 0.005, step: 0.001 },
      angle: { min: 0, max: Math.PI * 2, default: 0, step: 0.1 }
    }
  },
  pixelation: {
    name: 'Pixelation',
    shader: PixelationShader,
    uniforms: {
      pixelSize: { min: 1, max: 50, default: 8, step: 1 }
    }
  },
  filmGrain: {
    name: 'Film Grain',
    shader: FilmGrainShader,
    uniforms: {
      intensity: { min: 0, max: 1, default: 0.5, step: 0.01 }
    }
  },
  vignette: {
    name: 'Vignette',
    shader: VignetteShader,
    uniforms: {
      intensity: { min: 0, max: 1, default: 0.5, step: 0.01 },
      smoothness: { min: 0, max: 1, default: 0.5, step: 0.01 }
    }
  }
};
