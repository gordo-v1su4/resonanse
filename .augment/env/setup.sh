#!/bin/bash
set -e

# Update system packages
sudo apt-get update

# Install pnpm globally with sudo
sudo npm install -g pnpm

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source $HOME/.cargo/env

# Install wasm-pack for Rust to WASM compilation
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Add Rust and wasm-pack to PATH in profile
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> $HOME/.profile

# Install additional system dependencies that might be needed
sudo apt-get install -y build-essential pkg-config libssl-dev

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    git init
fi

# Create basic project structure based on the plan
mkdir -p packages/frontend
mkdir -p packages/logic-engine
mkdir -p packages/audio-stretcher
mkdir -p packages/backend

# Create pnpm workspace configuration
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'packages/*'
EOF

# Create root package.json with basic scripts
cat > package.json << 'EOF'
{
  "name": "resonance",
  "version": "1.0.0",
  "description": "Generative Audio-Reactive Video Editor",
  "private": true,
  "scripts": {
    "test": "pnpm run test:rust",
    "test:rust": "cd packages/logic-engine && cargo test && cd ../audio-stretcher && cargo test"
  }
}
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
/target/
/dist/
.svelte-kit/
build/
.env
.env.local
.env.production
packages/backend/pb_data/
packages/frontend/src/lib/wasm/
*.log
EOF

# Initialize Rust logic-engine
cd packages/logic-engine
cargo init --lib

# Configure Cargo.toml for WASM
cat > Cargo.toml << 'EOF'
[package]
name = "logic-engine"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.4"

[dependencies.web-sys]
version = "0.3"
features = [
  "console",
]
EOF

# Create basic WASM function with proper test structure
cat > src/lib.rs << 'EOF'
use wasm_bindgen::prelude::*;

// Import the `console.log` function from the browser
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

// Define a macro to make console.log easier to use
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// Pure function for testing
pub fn add_pure(a: u32, b: u32) -> u32 {
    a + b
}

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
    #[cfg(target_arch = "wasm32")]
    console_log!("Adding {} + {}", a, b);
    add_pure(a, b)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add_pure(2, 2), 4);
        assert_eq!(add_pure(0, 0), 0);
        assert_eq!(add_pure(1, 1), 2);
    }
}
EOF

cd ../..

# Initialize Rust audio-stretcher
cd packages/audio-stretcher
cargo init --lib

# Configure Cargo.toml for WASM
cat > Cargo.toml << 'EOF'
[package]
name = "audio-stretcher"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.4"

[dependencies.web-sys]
version = "0.3"
features = [
  "console",
]
EOF

# Create basic WASM function with proper test structure
cat > src/lib.rs << 'EOF'
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// Pure function for testing
pub fn process_audio_chunk_pure(data: Vec<f32>, _tempo_ratio: f64, _pitch_shift: f64) -> Vec<f32> {
    // Placeholder implementation - just return the input data for now
    data
}

#[wasm_bindgen]
pub fn process_audio_chunk(data: Vec<f32>, tempo_ratio: f64, pitch_shift: f64) -> Vec<f32> {
    #[cfg(target_arch = "wasm32")]
    console_log!("Processing audio chunk with tempo: {}, pitch: {}", tempo_ratio, pitch_shift);
    process_audio_chunk_pure(data, tempo_ratio, pitch_shift)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_audio_chunk() {
        let input = vec![0.1, 0.2, 0.3, 0.4];
        let output = process_audio_chunk_pure(input.clone(), 1.0, 0.0);
        assert_eq!(input, output);
    }
}
EOF

cd ../..

# Create README.md
cat > README.md << 'EOF'
# Resonance - Generative Audio-Reactive Video Editor

A web-based audio-reactive video editor built with SvelteKit, Rust/WASM, and Three.js.

## Tech Stack

- **Frontend**: SvelteKit with TypeScript
- **Core Logic**: Rust compiled to WebAssembly
- **Rendering**: Three.js with WebGPU
- **Backend**: PocketBase
- **Package Manager**: pnpm

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test
```

## Project Structure

- `packages/frontend/` - SvelteKit application
- `packages/logic-engine/` - Rust WASM module for audio/video analysis
- `packages/audio-stretcher/` - Rust WASM module for audio manipulation
- `packages/backend/` - PocketBase backend
EOF

# Install root dependencies
pnpm install

echo "Setup complete! Project structure initialized with basic functionality."