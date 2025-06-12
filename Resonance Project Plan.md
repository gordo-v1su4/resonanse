[ ] **1. Project: "Resonance" - The Generative Audio-Reactive Video Editor**

[ ]
    [ ] **1.1 Finalized Tech Stack (June 2025)**
    [ ]
        [ ] **1.1.1 Frontend:** SvelteKit (using Svelte 5 Runes for reactivity)
        [ ] **1.1.2 Core Logic Engine:** Rust compiled to WebAssembly (WASM)
        [ ] **1.1.3 Audio Decoding:** `symphonia` crate
        [ ] **1.1.4 Audio & Video Analysis:** `rustfft`, custom algorithms, and Rust bindings to `ffmpeg` compiled to WASM
        [ ] **1.1.5 Real-Time Audio Manipulation:** WASM module using `rubberband` library for pitch/tempo shifting
        [ ] **1.1.6 Stem Splitting:** `tract` ONNX inference crate with "Hybrid Transformer Demucs (HT-Demucs)" model
        [ ] **1.1.7 Rendering & Effects:** Three.js with WebGPU Renderer
        [ ] **1.1.8 Node-Based UI:** Svelte Flow
        [ ] **1.1.9 UI Components:** `Melt UI` (headless) with `Tailwind CSS` for styling
        [ ] **1.1.10 Backend & DB:** PocketBase (single-binary server)

[ ] **2. Epic: Project Foundation & Environment Setup**

[ ]
    [ ] **2.1 Story: Initialize Project Monorepo and Tooling**
    [ ]
        [ ] **2.1.1** Initialize a new project directory with `git init`
        [ ] **2.1.2** Create a `pnpm-workspace.yaml` file to configure the pnpm workspace
        [ ] **2.1.3** Create a root `.gitignore` file with entries for `node_modules`, `/target`, `/dist`, SvelteKit build artifacts, and PocketBase data directories
        [ ] **2.1.4** Create a root `README.md` file with project title and tech stack summary
    [ ]
    [ ] **2.2 Story: Scaffold SvelteKit Frontend**
    [ ]
        [ ] **2.2.1** Create a `packages/frontend` directory for the SvelteKit application
        [ ] **2.2.2** Scaffold a SvelteKit project in `packages/frontend` using "Skeleton project" and TypeScript options
        [ ] **2.2.3** Install frontend dependencies: `pnpm add three svelte-flow pocketbase melt-ui svelte-splitpanes`
        [ ] **2.2.4** Install dev dependencies: `pnpm add -D tailwindcss postcss autoprefixer @types/three`
        [ ] **2.2.5** Initialize Tailwind CSS with `npx tailwindcss init -p`
        [ ] **2.2.6** Configure `tailwind.config.js` to scan `.svelte`, `.html`, and `.ts` files in `src`
        [ ] **2.2.7** Create `src/app.css` and import Tailwind base, components, and utilities
        [ ] **2.2.8** Create a root `+layout.svelte` and import `src/app.css`
        [ ] **2.2.9** Add `melt-ui` preprocessor to `svelte.config.js` for accessibility
    [ ]
    [ ] **2.3 Story: Scaffold Rust/WASM Engines**
    [ ]
        [ ] **2.3.1** Create a `packages/logic-engine` directory and initialize a Rust library with `cargo init --lib`
        [ ] **2.3.2** Create a `packages/audio-stretcher` directory and initialize a Rust library
        [ ] **2.3.3** Add `wasm-bindgen`, `serde`, `serde-wasm-bindgen` to both Rust projects’ `Cargo.toml`
        [ ] **2.3.4** Add `symphonia`, `rustfft`, `tract-onnx`, and `ffmpeg`-related crates to `logic-engine`’s `Cargo.toml`
        [ ] **2.3.5** Configure `audio-stretcher` to compile and bind to the `rubberband` C++ library
        [ ] **2.3.6** Configure both projects’ `Cargo.toml` with a `[lib]` section for `cdylib` output
        [ ] **2.3.7** Create a placeholder `add(a: u32, b: u32)` function in `logic-engine/src/lib.rs` with `#[wasm_bindgen]`
    [ ]
    [ ] **2.4 Story: Establish Frontend-WASM Communication**
    [ ]
        [ ] **2.4.1** Create a `build:wasm` script in root `package.json` to run `wasm-pack build` for both Rust packages, outputting to `packages/frontend/src/lib/wasm/`
        [ ] **2.4.2** Modify frontend `dev` script to run `build:wasm` first
        [ ] **2.4.3** Create `src/lib/services/wasmService.ts` in SvelteKit to initialize both WASM modules
        [ ] **2.4.4** Create a `/test/wasm` route that calls `add(2, 2)` and displays "WASM Result: 4"
    [ ]
    [ ] **2.5 Story: Establish Backend and Frontend-Backend Communication**
    [ ]
        [ ] **2.5.1** Create a `packages/backend` directory and place the PocketBase executable in it
        [ ] **2.5.2** Add a `start:backend` script in root `package.json` to launch PocketBase
        [ ] **2.5.3** Create `src/lib/services/pocketbase.ts` in SvelteKit to initialize the PocketBase SDK
        [ ] **2.5.4** Create a "health" collection in PocketBase admin UI
        [ ] **2.5.5** Create a `/test/backend` route that queries the "health" collection and displays "Backend Connected"
    [ ]
    [ ] **2.6 Story: Test Foundation Setup**
    [ ]
        [ ] **2.6.1** Verify `git init` and `.gitignore` by committing initial files and checking ignored directories
        [ ] **2.6.2** Run `pnpm install` to ensure workspace configuration works
        [ ] **2.6.3** Start SvelteKit dev server and confirm Tailwind CSS styles apply to a test page
        [ ] **2.6.4** Build and run WASM test route to confirm `add(2, 2)` returns 4
        [ ] **2.6.5** Start PocketBase and test backend route to confirm "Backend Connected" message

[ ] **3. Epic: Core Analysis Engines (Rust/WASM)**

[ ]
    [ ] **3.1 Story: Implement Audio & Video Analysis in `logic-engine`**
    [ ]
        [ ] **3.1.1** Implement `analyze_project_assets` WASM function to process audio and video buffers
        [ ] **3.1.2** Use `symphonia` and `rustfft` for audio analysis, producing beats, transients, and loudness contours as `u64` sample indices
        [ ] **3.1.3** Use `ffmpeg` bindings for video analysis, generating a `Vec<f32>` of optical flow motion scores per clip
        [ ] **3.1.4** Return a comprehensive analysis object mapping asset IDs to their data
        [ ] **3.1.5** Profile JS-WASM data transfer for `analyze_project_assets`, minimizing copying by using typed arrays
    [ ]
    [ ] **3.2 Story: Implement Real-Time Audio Manipulation in `audio-stretcher`**
    [ ]
        [ ] **3.2.1** Expose a `process_audio_chunk` function via `wasm_bindgen`
        [ ] **3.2.2** Accept `f32` PCM data, `tempo_ratio: f64`, and `pitch_shift_semitones: f64`
        [ ] **3.2.3** Use `rubberband` bindings for time-stretching and pitch-shifting
        [ ] **3.2.4** Return processed PCM data as `Vec<f32>`
        [ ] **3.2.5** Optimize `process_audio_chunk` input/output to use SharedArrayBuffer or typed arrays for PCM data
    [ ]
    [ ] **3.3 Story: Test Analysis Engines**
    [ ]
        [ ] **3.3.1** Create a test audio file and video clip, pass to `analyze_project_assets`, and verify output contains correct beat and motion data
        [ ] **3.3.2** Pass a sample PCM chunk to `process_audio_chunk` with tempo and pitch adjustments, and verify output audio length and pitch
        [ ] **3.3.3** Use a Rust unit test in `logic-engine` to validate analysis accuracy against known inputs
        [ ] **3.3.4** Add Rust unit tests for `analyze_project_assets` to validate beat detection and motion scores

[ ] **4. Epic: Core Rendering Engine (Svelte + Three.js)**

[ ]
    [ ] **4.1 Story: Setup WebGPU-Powered Three.js Canvas**
    [ ]
        [ ] **4.1.1** Create `ThreeCanvas.svelte` component
        [ ] **4.1.2** Initialize Three.js `Scene`, `PerspectiveCamera`, and `WebGPURenderer` on mount
        [ ] **4.1.3** Append renderer’s DOM element to component container
        [ ] **4.1.4** Set up async `requestAnimationFrame` loop for WebGPU rendering
        [ ] **4.1.5** Implement resize handler to update camera aspect ratio and renderer size
        [ ] **4.1.6** Implement a fallback to WebGL Renderer if WebGPU is unsupported, logging the renderer type for debugging
    [ ]
    [ ] **4.2 Story: Video Texture Playback on 3D Plane**
    [ ]
        [ ] **4.2.1** Add hidden `<video>` element to `ThreeCanvas.svelte` with `display: none`
        [ ] **4.2.2** Create `PlaneGeometry`, `VideoTexture` linked to video, and `MeshBasicMaterial` using the texture
        [ ] **4.2.3** Add `Mesh` with this material to the scene
    [ ]
    [ ] **4.3 Story: Implement Post-Processing Shader System**
    [ ]
        [ ] **4.3.1** Initialize `EffectComposer` and required passes from Three.js WebGPU addons
        [ ] **4.3.2** Add `RenderPass` as the first pass
        [ ] **4.3.3** Create a system to manage multiple `ShaderPass` instances, supporting toggle and order
        [ ] **4.3.4** Implement a vignette `ShaderPass` with `intensity` uniform controllable from Svelte UI
    [ ]
    [ ] **4.4 Story: Test Rendering Engine**
    [ ]
        [ ] **4.4.1** Load a test video into `ThreeCanvas.svelte` and verify it displays on the 3D plane
        [ ] **4.4.2** Toggle vignette shader and adjust intensity via UI, confirming visual changes
        [ ] **4.4.3** Resize browser window and verify canvas and camera adjust correctly
        [ ] **4.4.4** Use Playwright to automate UI tests for video playback and shader application

[ ] **5. Epic: Main Application UI Shell & Layout**

[ ]
    [ ] **5.1 Story: Implement Top-Level Layout and Structure**
    [ ]
        [ ] **5.1.1** In `+layout.svelte`, implement UI structure using CSS Grid or Flexbox
        [ ] **5.1.2** Create `Header.svelte` with project title, user auth status, and action buttons (Save, Export)
        [ ] **5.1.3** Use `svelte-splitpanes` for a three-panel layout: left sidebar, main content, right sidebar
        [ ] **5.1.4** Ensure panels are resizable and save sizes to `localStorage`
    [ ]
    [ ] **5.2 Story: Implement Panel and Component Scaffolding**
    [ ]
        [ ] **5.2.1** Create placeholder files for `VideoPool.svelte`, `AssetProperties.svelte`, `TimelineEditor.svelte`, `NodeEditor.svelte`, `PlaybackRules.svelte`, `EffectsPanel.svelte`
        [ ] **5.2.2** Place `VideoPool.svelte` and `AssetProperties.svelte` in left sidebar
        [ ] **5.2.3** Implement `Melt UI` tabbed interface in main content area
        [ ] **5.2.4** Place `TimelineEditor.svelte` in first tab, `NodeEditor.svelte` in second tab
        [ ] **5.2.5** Place `PlaybackRules.svelte` and `EffectsPanel.svelte` in right sidebar
    [ ]
    [ ] **5.3 Story: Test UI Shell and Layout**
    [ ]
        [ ] **5.3.1** Use Playwright to verify all panels render and are resizable
        [ ] **5.3.2** Test tab switching between Timeline and Node Editor views
        [ ] **5.3.3** Confirm panel sizes persist across page reloads via `localStorage`
        [ ] **5.3.4** Verify `Header.svelte` displays title and buttons correctly

[ ] **6. Epic: Advanced Playback & Performance Capture**

[ ]
    [ ] **6.1 Story: Implement State Management for Rules and Performance**
    [ ]
        [ ] **6.1.1** Create `src/lib/stores/playbackRulesStore.ts` for `transient_skips`, `jump_cut_intensity`, `speed_ramp_intensity`, `smart_linking`, `tempo_ratio`, `pitch_shift_semitones`
        [ ] **6.1.2** Create `src/lib/stores/performanceStore.ts` for automation events (`{ timestamp_samples: u64, rule: string, value: any }`)
    [ ]
    [ ] **6.2 Story: Implement Real-Time Audio Pitch/Tempo Shifting**
    [ ]
        [ ] **6.2.1** Refactor audio playback to use Web Audio API `AudioContext` with `AudioWorkletNode`
        [ ] **6.2.2** Send audio chunks to `audio-stretcher` WASM module for processing
        [ ] **6.2.3** Create UI sliders in `PlaybackRules.svelte` bound to `tempo_ratio` and `pitch_shift_semitones`
        [ ] **6.2.4** Use sample-based time for playback, calculating playhead as `(current_sample / original_sample_rate)`
    [ ]
    [ ] **6.3 Story: Implement Rule-Based Playback Logic**
    [ ]
        [ ] **6.3.1 Marker Skipping Logic (`transient_skips`)**
        [ ]
            [ ] **6.3.1.1** Maintain a `transient_counter` in `playbackEngine`
            [ ] **6.3.1.2** Increment counter on each transient
            [ ] **6.3.1.3** Trigger video cut if `transient_counter >= rules.transient_skips.count`
            [ ] **6.3.1.4** Reset `transient_counter` to 0 after a cut
        [ ]
        [ ] **6.3.2 Jump Cut Logic**
        [ ]
            [ ] **6.3.2.1** On cut, check `Math.random() < rules.jump_cut_intensity.probability`
            [ ] **6.3.2.2** If true, seek current video forward by a small random amount
        [ ]
        [ ] **6.3.3 Speed Ramping Logic**
        [ ]
            [ ] **6.3.3.1** Control `playbackRate` of hidden `<video>` element
            [ ] **6.3.3.2** Check upcoming transient density in `playbackEngine`
            [ ] **6.3.3.3** Increase `playbackRate` to `rules.max_ramp` for high density
            [ ] **6.3.3.4** Smoothly return `playbackRate` to 1.0 for low density
    [ ]
    [ ] **6.4 Story: Implement Smart Editing Logic**
    [ ]
        [ ] **6.4.1** Implement `find_best_clip` in `playbackEngine`
        [ ] **6.4.2** When `smart_linking` is active, match audio energy to video motion scores
        [ ] **6.4.3** Select and seek to high-motion clip for the next cut
    [ ]
    [ ] **6.5 Story: Implement Performance Recording & Playback**
    [ ]
        [ ] **6.5.1** Create "Record Automation" toggle button
        [ ] **6.5.2** Subscribe to `playbackRulesStore` changes and record events to `performanceStore`
        [ ] **6.5.3** Implement "Playback Mode" toggle: "Live" vs. "Replay"
        [ ] **6.5.4** In "Replay" mode, use `performanceStore` events to drive rule changes
    [ ]
    [ ] **6.6 Story: Test Playback and Performance**
    [ ]
        [ ] **6.6.1** Test sliders in `PlaybackRules.svelte` to verify tempo and pitch changes in real-time
        [ ] **6.6.2** Enable `transient_skips` and verify video cuts align with expected transients
        [ ] **6.6.3** Test jump cut and speed ramping logic with sample audio and video
        [ ] **6.6.4** Record a performance, switch to "Replay" mode, and verify rules replay accurately
        [ ] **6.6.5** Use Playwright to automate UI tests for playback controls and performance recording

[ ] **7. Epic: Timeline Editor**

[ ]
    [ ] **7.1 Story: Implement Waveform and Marker Visualization**
    [ ]
        [ ] **7.1.1** Create `TimelineEditor.svelte` as a container
        [ ] **7.1.2** Create `Timeline.svelte` subscribing to `projectStore`
        [ ] **7.1.3** Render audio waveform as SVG path from loudness contour
        [ ] **7.1.4** Render `beat_timestamps` as vertical lines, `transient_timestamps` as dots
        [ ] **7.1.5** Implement zoom and pan for timeline view
        [ ] **7.1.6** Create `Playhead.svelte` with `left` CSS property bound to `playbackStore` sample time
    [ ]
    [ ] **7.2 Story: Implement Video Track and Clip Management**
    [ ]
        [ ] **7.2.1** Create `VideoTrack.svelte` below `Timeline.svelte`
        [ ] **7.2.2** Make video thumbnails in `VideoPool.svelte` draggable with `Melt UI`
        [ ] **7.2.3** Make `VideoTrack.svelte` a dropzone
        [ ] **7.2.4** Add dropped video IDs to `timelineState` store sequence array
        [ ] **7.2.5** Render visual blocks for clips, with widths based on marker durations
        [ ] **7.2.6** Enable drag-and-drop reordering of clips, updating `timelineState`
        [ ] **7.2.7** Implement clip removal via right-click context menu
    [ ]
    [ ] **7.3 Story: Implement Automation Lane Visualization**
    [ ]
        [ ] **7.3.1** Create `AutomationLane.svelte` below `VideoTrack.svelte`
        [ ] **7.3.2** Subscribe to `performanceStore` and render keyframes for events
        [ ] **7.3.3** Add `Melt UI` tooltip on keyframe hover to show event details
    [ ]
    [ ] **7.4 Story: Test Timeline Editor**
    [ ]
        [ ] **7.4.1** Upload test audio and verify waveform and markers render correctly
        [ ] **7.4.2** Drag videos to `VideoTrack`, confirm sequence updates and blocks render
        [ ] **7.4.3** Reorder and remove clips, verifying `timelineState` updates
        [ ] **7.4.4** Record automation events and confirm keyframes appear in `AutomationLane`
        [ ] **7.4.5** Use Playwright to test drag-and-drop, zoom, and tooltip functionality

[ ] **8. Epic: Node-Based Logic Editor**

[ ]
    [ ] **8.1 Story: Implement Node Editor Canvas**
    [ ]
        [ ] **8.1.1** Set up `SvelteFlow` provider and renderer in `NodeEditor.svelte`
        [ ] **8.1.2** Implement panning with middle-mouse-drag and zooming with scroll wheel
        [ ] **8.1.3** Create `nodeGraphStore.ts` for nodes, edges, and viewport state
        [ ] **8.1.4** Implement "Save Graph" and "Load Graph" to sync with `projectStore`
        [ ] **8.1.5** Evaluate `rete.js` vs. Svelte Flow for node editor features, selecting the one with better custom node support
    [ ]
    [ ] **8.2 Story: Implement Custom Node Library**
    [ ]
        [ ] **8.2.1** Create `src/lib/components/nodes/` for custom node components
        [ ] **8.2.2 Input Nodes:** Create `InputBeatMarkersNode`, `InputTransientMarkersNode`, `InputAudioLoudnessNode`, `InputVideoMotionNode` with output handles
        [ ] **8.2.3 Logic Nodes:** Create `LogicAndNode`, `LogicCounterNode`, `LogicMapRangeNode`, `LogicRandomGateNode` with input/output handles
        [ ] **8.2.4 Output Nodes:** Create `OutputCutVideoNode`, `OutputSetEffectNode`, `OutputSelectClipNode` with input handles
        [ ] **8.2.5** Create `NodePalette.svelte` to list and drag nodes onto canvas
    [ ]
    [ ] **8.3 Story: Implement Node Graph Execution**
    [ ]
        [ ] **8.3.1** Add toggle to switch `playbackEngine` between "Timeline Mode" and "Node Graph Mode"
        [ ] **8.3.2** In "Node Graph Mode", serialize graph to JSON each frame
        [ ] **8.3.3** Pass JSON, playback time, and analysis data to `run_node_graph` WASM function
        [ ] **8.3.4** Implement `run_node_graph` in Rust to traverse graph and return `Action` objects
        [ ] **8.3.5** Execute returned actions in `playbackEngine` for real-time visuals
    [ ]
    [ ] **8.4 Story: Test Node-Based Logic Editor**
    [ ]
        [ ] **8.4.1** Create a simple node graph (e.g., `InputBeatMarkersNode` to `OutputCutVideoNode`) and verify video cuts on beats
        [ ] **8.4.2** Test dragging nodes from `NodePalette` and connecting them
        [ ] **8.4.3** Save and reload graph, confirming state persists
        [ ] **8.4.4** Use Playwright to automate node creation, connection, and playback tests
        [ ] **8.4.5** Add Rust unit tests for `run_node_graph` to verify action outputs for sample graphs

[ ] **9. Epic: Audio-Reactive Effects**

[ ]
    [ ] **9.1 Story: Build Effects Library**
    [ ]
        [ ] **9.1.1** Implement five post-processing shaders: `Glitch`, `Bloom`, `RGB Shift`, `Pixelation`, `Film Grain`
        [ ] **9.1.2** Expose at least two uniforms per shader (e.g., `intensity`, `block_size` for `Glitch`)
    [ ]
    [ ] **9.2 Story: Implement Effects Panel UI**
    [ ]
        [ ] **9.2.1** In `EffectsPanel.svelte`, render a dynamic list of available effects
        [ ] **9.2.2** Allow adding, removing, and reordering effects in a stack
        [ ] **9.2.3** Display `Melt UI` sliders for each active effect’s uniforms
    [ ]
    [ ] **9.3 Story: Connect Node Graph to Effects**
    [ ]
        [ ] **9.3.1** Add dropdowns to `OutputSetEffectNode` for selecting effect and uniform
        [ ] **9.3.2** Dispatch actions from `playbackEngine` to update shader uniforms in `EffectComposer`
    [ ]
    [ ] **9.4 Story: Test Audio-Reactive Effects**
    [ ]
        [ ] **9.4.1** Apply each shader via `EffectsPanel` and verify visual changes
        [ ] **9.4.2** Create a node graph to drive effect uniforms (e.g., loudness to `Bloom` intensity) and confirm reactivity
        [ ] **9.4.3** Use Playwright to test effect stacking, reordering, and uniform adjustments

[ ] **10. Epic: Stem Splitting Integration**

[ ]
    [ ] **10.1 Story: Implement Stem Separation in WASM**
    [ ]
        [ ] **10.1.1** Implement `separate_stems` WASM function using `tract` and HT-Demucs model
        [ ] **10.1.2** Return four PCM vectors: `vocals`, `drums`, `bass`, `other`
    [ ]
    [ ] **10.2 Story: Analyze and Visualize Stems**
    [ ]
        [ ] **10.2.1** Run audio analysis on each stem individually
        [ ] **10.2.2** Update `Timeline.svelte` to render selectable stem lanes
        [ ] **10.2.3** Update Input Nodes to select stem data sources (e.g., `drums` transients)
    [ ]
    [ ] **10.3 Story: Test Stem Splitting**
    [ ]
        [ ] **10.3.1** Upload a test audio file, run `separate_stems`, and verify four stems are generated
        [ ] **10.3.2** Confirm stem waveforms render in `Timeline.svelte` and are selectable
        [ ] **10.3.3** Create a node graph using stem-specific data and verify correct behavior
        [ ] **10.3.4** Use Playwright to test stem selection and visualization

[ ] **11. Epic: User Management & Data Persistence**

[ ]
    [ ] **11.1 Story: Implement Authentication**
    [ ]
        [ ] **11.1.1** Create Login and Registration pages with PocketBase email/password auth
        [ ] **11.1.2** Implement SvelteKit hooks to manage auth state and protect routes
    [ ]
    [ ] **11.2 Story: Implement Project Saving and Loading**
    [ ]
        [ ] **11.2.1** Create `projects` and `project_assets` collections in PocketBase
        [ ] **11.2.2** Implement "Save Project" to serialize `projectStore`, `playbackRulesStore`, `performanceStore`, `timelineState`, and node graphs to JSON
        [ ] **11.2.3** Implement "Load Project" to deserialize JSON and hydrate stores
        [ ] **11.2.4** Create a dashboard to list and load user projects
    [ ]
    [ ] **11.3 Story: Test User Management and Persistence**
    [ ]
        [ ] **11.3.1** Use Playwright to test login, registration, and route protection
        [ ] **11.3.2** Save a project with sample data, reload, and verify state is restored
        [ ] **11.3.3** Test dashboard functionality for listing and loading projects
        [ ] **11.3.4** Verify only authenticated users can access their projects

[ ] **12. Epic: Final Output - Export & Rendering**

[ ]
    [ ] **12.1 Story: Implement Client-Side Video Export**
    [ ]
        [ ] **12.1.1** Create an "Export" button
        [ ] **12.1.2** Implement `ExportService` to play project non-real-time
        [ ] **12.1.3** Use `MediaRecorder` to capture `ThreeCanvas` output as silent video stream
        [ ] **12.1.4** Provide progress indicators for export stages
    [ ]
    [ ] **12.2 Story: Final Audio and Video Compositing**
    [ ]
        [ ] **12.2.1** Process full audio track through `audio-stretcher` using recorded or live rules
        [ ] **12.2.2** Use `ffmpeg.wasm` to combine silent video and audio into MP4
        [ ] **12.2.3** Generate object URL and trigger download for `resonance_export.mp4`
    [ ]
    [ ] **12.3 Story: Test Export and Rendering**
    [ ]
        [ ] **12.3.1** Export a test project and verify MP4 contains correct video and audio
        [ ] **12.3.2** Confirm progress indicators update during export
        [ ] **12.3.3** Test export with recorded performance vs. live rules
        [ ] **12.3.4** Use Playwright to automate export button click and verify download

[ ] **13. Epic: Final Polish, Optimization, & Deployment**

[ ]
    [ ] **13.1 Story: Implement End-to-End Testing**
    [ ]
        [ ] **13.1.1** Write Playwright tests for full workflow: Upload -> Analyze -> Edit -> Record -> Export -> Save/Load
    [ ]
    [ ] **13.2 Story: Implement Performance Optimization**
    [ ]
        [ ] **13.2.1** Profile app with browser dev tools, focusing on WASM, GPU, and Svelte rendering
        [ ] **13.2.2** Implement virtualization for `VideoPool` and `Timeline` for large asset sets
        [ ] **13.2.3** Optimize JS-WASM data transfer to minimize copying
    [ ]
    [ ] **13.3 Story: Implement Deployment**
    [ ]
        [ ] **13.3.1** Deploy PocketBase to a VPS (e.g., DigitalOcean Droplet)
        [ ] **13.3.2** Deploy SvelteKit frontend to Vercel or Netlify
        [ ] **13.3.3** Create GitHub Actions CI/CD pipeline for automated builds and deployments
    [ ]
    [ ] **13.4 Story: Test Final Polish and Deployment**
    [ ]
        [ ] **13.4.1** Run Playwright tests to ensure end-to-end workflow is functional
        [ ] **13.4.2** Profile app with large datasets and confirm performance improvements
        [ ] **13.4.3** Verify CI/CD pipeline builds and deploys correctly
        [ ] **13.4.4** Test deployed app on production URLs to confirm functionality

[ ] **14. Epic: Desktop Companion App (Optional)**
[ ]
    [ ] **14.1 Story: Scaffold Desktop App with Tauri and egui.rs**
    [ ]
        [ ] **14.1.1** Initialize a Tauri project with `egui.rs` for the UI
        [ ] **14.1.2** Reuse `logic-engine` and `audio-stretcher` WASM modules via WebView
        [ ] **14.1.3** Implement basic timeline and playback controls
    [ ]
    [ ] **14.2 Story: Test Desktop App**
    [ ]
        [ ] **14.2.1** Verify timeline rendering and playback on Windows and macOS
        [ ] **14.2.2** Confirm WASM module integration works offline