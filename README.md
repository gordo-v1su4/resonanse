# Resonance

This is the repository for the Resonance project, a generative audio-reactive video editor.

## Project Structure

```
.
├── .gitignore
├── package.json
├── packages
│   ├── audio-stretcher
│   │   ├── Cargo.toml
│   │   ├── build.rs
│   │   ├── package.json
│   │   ├── src
│   │   │   └── lib.rs
│   │   └── wrapper.h
│   ├── frontend
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── src
│   │   │   ├── app.css
│   │   │   ├── lib
│   │   │   │   └── services
│   │   │   │       └── wasmService.ts
│   │   │   └── routes
│   │   │       └── +layout.svelte
│   │   ├── svelte.config.js
│   │   └── tailwind.config.js
│   └── logic-engine
│       ├── Cargo.toml
│       ├── package.json
│       └── src
│           └── lib.rs
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md