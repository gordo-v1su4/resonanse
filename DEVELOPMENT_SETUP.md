# Development Setup Guide

## 🚀 Quick Start

### Option 1: Full Setup with WASM (Recommended)

1. **Install Rust and wasm-pack**:
   ```bash
   # Install Rust
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   
   # Install wasm-pack
   cargo install wasm-pack
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Build WASM modules**:
   ```bash
   pnpm run build:wasm
   ```

4. **Start development server**:
   ```bash
   cd packages/frontend
   pnpm run dev
   ```

### Option 2: Quick Start with Mock WASM (No Rust Required)

If you want to get started quickly without installing Rust:

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start development server with mocks**:
   ```bash
   cd packages/frontend
   pnpm run dev:no-wasm
   ```

## 🔧 Troubleshooting

### WASM Build Errors

If you encounter Rust compilation errors:

1. **Check Rust installation**:
   ```bash
   rustc --version
   cargo --version
   wasm-pack --version
   ```

2. **Update Rust**:
   ```bash
   rustup update
   ```

3. **Add wasm32 target**:
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

4. **Clean and rebuild**:
   ```bash
   cd packages/logic-engine
   cargo clean
   cd ../audio-stretcher
   cargo clean
   cd ../..
   pnpm run build:wasm
   ```

### Common Issues

#### "Missing script: build:wasm"
- **Solution**: Run from the root directory: `pnpm -w run build:wasm`
- **Or**: Use the workspace flag: `pnpm run build:wasm` from root

#### "wasm-pack: command not found"
- **Solution**: Install wasm-pack: `cargo install wasm-pack`

#### Rust compilation errors
- **Solution**: Use mock mode: `cd packages/frontend && pnpm run dev:no-wasm`

## 📁 Project Structure

```
resonanse/
├── packages/
│   ├── frontend/           # Svelte frontend
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── components/     # Three.js components
│   │   │   │   ├── services/       # Audio, effects, WASM
│   │   │   │   └── shaders/        # Custom shader effects
│   │   │   └── routes/
│   │   │       ├── demo/           # Interactive demo
│   │   │       └── test/effects/   # Test suite
│   │   └── package.json
│   ├── logic-engine/       # Rust WASM audio analysis
│   ├── audio-stretcher/    # Rust WASM audio processing
│   └── backend/           # PocketBase backend
└── package.json           # Root workspace
```

## 🎯 Available Scripts

### Root Level
- `pnpm run build:wasm` - Build all WASM modules
- `pnpm run start:backend` - Start PocketBase backend

### Frontend
- `pnpm run dev` - Start dev server with WASM build
- `pnpm run dev:no-wasm` - Start dev server with mocks only
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build

## 🌐 Demo Pages

Once the development server is running, visit:

- **Main Demo**: http://localhost:5173/demo
  - Upload video files
  - Apply real-time effects
  - Audio-reactive parameters
  - Effect presets

- **Test Suite**: http://localhost:5173/test/effects
  - Automated testing
  - Generated test content
  - Performance metrics
  - Debug information

- **WASM Tests**: http://localhost:5173/test/wasm
  - WASM module validation
  - Audio analysis testing

## 🎨 Features Available

### Video Effects
- **Glitch**: Digital distortion with RGB shift
- **Bloom**: Luminance-based glow effects
- **RGB Shift**: Chromatic aberration
- **Pixelation**: Retro pixel art effect
- **Film Grain**: Cinematic noise
- **Vignette**: Radial darkening

### Audio Reactivity
- **Real-time Analysis**: Volume, frequency bands
- **Beat Detection**: Energy-based algorithm
- **Audio Sources**: Video, files, microphone
- **Parameter Mapping**: Effects respond to audio

### Technology Stack
- **Frontend**: Svelte 5 with SvelteKit
- **Rendering**: Three.js with WebGPU/WebGL
- **Audio**: Web Audio API + Rust WASM
- **UI**: Melt UI + Tailwind CSS
- **Backend**: PocketBase (optional)

## 🔄 Development Workflow

1. **Start with mocks** for quick iteration:
   ```bash
   cd packages/frontend
   pnpm run dev:no-wasm
   ```

2. **Add WASM when needed** for full functionality:
   ```bash
   # Install Rust if not already installed
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   
   # Build WASM and start with full features
   pnpm -w run build:wasm
   pnpm run dev
   ```

3. **Test your changes**:
   - Visit `/demo` for interactive testing
   - Visit `/test/effects` for automated validation
   - Check browser console for any errors

## 🐛 Getting Help

If you encounter issues:

1. **Check the console** for error messages
2. **Try mock mode** if WASM fails: `pnpm run dev:no-wasm`
3. **Clear browser cache** and restart dev server
4. **Check Node.js version** (requires Node 18+)
5. **Verify pnpm installation** (`pnpm --version`)

## 🎯 Next Steps

Once you have the development environment running:

1. **Explore the demo** to understand the features
2. **Review the code** in `packages/frontend/src/lib/`
3. **Add new effects** by extending the shader library
4. **Customize audio mappings** in the effects manager
5. **Integrate with your video editing workflow**

The system is designed to be modular and extensible, so you can easily add new effects, audio analysis features, or integrate with other parts of your application.
