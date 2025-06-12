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
    "build:wasm": "cd packages/logic-engine && wasm-pack build --target web --out-dir ../frontend/src/lib/wasm/logic-engine && cd ../audio-stretcher && wasm-pack build --target web --out-dir ../frontend/src/lib/wasm/audio-stretcher",
    "dev": "pnpm run build:wasm && cd packages/frontend && pnpm dev",
    "test": "pnpm run test:frontend && pnpm run test:rust",
    "test:frontend": "cd packages/frontend && pnpm test",
    "test:rust": "cd packages/logic-engine && cargo test && cd ../audio-stretcher && cargo test"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0"
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

# Initialize SvelteKit frontend
cd packages/frontend
pnpm create svelte@latest . --template skeleton --types typescript --no-prettier --no-eslint --no-playwright --no-vitest
pnpm install

# Add frontend dependencies mentioned in the plan
pnpm add three svelte-flow pocketbase @melt-ui/svelte svelte-splitpanes
pnpm add -D tailwindcss postcss autoprefixer @types/three vitest

# Initialize Tailwind CSS
npx tailwindcss init -p

# Configure Tailwind to scan Svelte files
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create app.css with Tailwind directives
cat > src/app.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# Update app.html to include app.css
sed -i 's|</head>|<link rel="stylesheet" href="%sveltekit.assets%/app.css" /></head>|' src/app.html

# Add vitest configuration
cat > vite.config.ts << 'EOF'
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
EOF

# Update package.json to include test script
cat > package.json << 'EOF'
{
	"name": "frontend",
	"version": "0.0.1",
	"private": true,
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"test": "vitest run",
		"test:watch": "vitest",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
	},
	"devDependencies": {
		"@sveltejs/adapter-auto": "^2.0.0",
		"@sveltejs/kit": "^1.20.4",
		"@sveltejs/vite-plugin-svelte": "^2.4.2",
		"@types/three": "^0.158.3",
		"autoprefixer": "^10.4.16",
		"postcss": "^8.4.32",
		"svelte": "^4.0.5",
		"svelte-check": "^3.4.3",
		"tailwindcss": "^3.3.6",
		"tslib": "^2.4.1",
		"typescript": "^5.0.0",
		"vite": "^4.4.2",
		"vitest": "^1.0.0"
	},
	"dependencies": {
		"@melt-ui/svelte": "^0.76.2",
		"pocketbase": "^0.19.0",
		"svelte-flow": "^0.0.39",
		"svelte-splitpanes": "^0.8.0",
		"three": "^0.158.0"
	},
	"type": "module"
}
EOF

# Create a simple test file
mkdir -p src/lib
cat > src/lib/utils.test.ts << 'EOF'
import { describe, it, expect } from 'vitest';

function add(a: number, b: number): number {
	return a + b;
}

describe('utils', () => {
	it('adds numbers correctly', () => {
		expect(add(2, 2)).toBe(4);
	});
});
EOF

cd ../..

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

# Create basic WASM function
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

#[wasm_bindgen]
pub fn add(a: u32, b: u32) -> u32 {
    console_log!("Adding {} + {}", a, b);
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 2), 4);
        assert_eq!(add(0, 0), 0);
        assert_eq!(add(1, 1), 2);
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

# Create basic WASM function
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

#[wasm_bindgen]
pub fn process_audio_chunk(data: Vec<f32>, tempo_ratio: f64, pitch_shift: f64) -> Vec<f32> {
    console_log!("Processing audio chunk with tempo: {}, pitch: {}", tempo_ratio, pitch_shift);
    // Placeholder implementation - just return the input data for now
    data
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_audio_chunk() {
        let input = vec![0.1, 0.2, 0.3, 0.4];
        let output = process_audio_chunk(input.clone(), 1.0, 0.0);
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

# Build WASM modules and start development server
pnpm dev

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