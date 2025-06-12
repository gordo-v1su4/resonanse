# Resonance - Audio-Reactive Video Editor Layout Specification

## Overview
A modern, dark-themed single-page web application for audio-reactive video editing with professional sampler/sequencer interface design.

## Color Scheme
- **Primary background:** `#0a0a0a` (very dark gray/black)
- **Secondary panels:** `#1a1a1a` (dark gray)
- **Accent panels:** `#2a2a2a` (medium dark gray)
- **Highlight elements:** `#3a3a3a` (lighter gray)
- **Primary accent:** `#00ff88` (bright green)
- **Secondary accent:** `#ff6b35` (orange)
- **Text primary:** `#ffffff` (white)
- **Text secondary:** `#cccccc` (light gray)

## Layout Structure

### Top Header Bar
- **Height:** 60px
- **Background:** `#1a1a1a`
- **Position:** Fixed/sticky at top
- **Border:** Bottom 1px solid `#3a3a3a`

**Content Layout:**
- **Left:** Logo "RESONANCE" in bold white text (24px font)
- **Center:** Transport controls (Play/Pause, Stop, Record) with green accent buttons
- **Right:** User menu dropdown, settings icon, export button (orange accent)

### Main Content Area (3-Column Layout)

#### Left Sidebar
- **Width:** 280px (collapsible to 60px)
- **Background:** `#1a1a1a`
- **Border:** Right 1px solid `#2a2a2a`

**File Browser Section:**
- Header: "ASSETS" with collapse/expand chevron icon
- Audio files list with file icons, names, duration, format info
- Drag handles for timeline integration
- Search/filter input at top

**Sample Library Section:**
- 4x4 grid of sample pads (60x60px each)
- Rounded corners (8px border-radius)
- Background: `#2a2a2a`
- Active state: bright green glow (`#00ff88`)
- Hover state: subtle green border
- Sample names below each pad (12px font)
- Volume/pitch mini-sliders per pad

#### Center Timeline Area
- **Width:** Flexible (minimum 600px)
- **Background:** `#0a0a0a`

**Timeline Header (40px height):**
- Time ruler with major/minor tick marks
- Current time display (MM:SS:MS format)
- Zoom controls (+ / - buttons with percentage)
- Snap-to-grid toggle with visual indicator
- BPM display and tap tempo button
- Loop region in/out point controls

**Audio Waveform Section (120px height):**
- Stereo waveform display on dark background
- Bright green waveform (`#00ff88`)
- Transient markers as small orange dots (`#ff6b35`)
- Beat grid as subtle vertical lines (`#3a3a3a`)
- Playhead as bright green vertical line (2px width)
- Selection regions with semi-transparent green overlay
- Right-click context menu for markers

**Video Track Section (80px height per track):**
- Multiple draggable video track lanes
- Video thumbnails as timeline clips with rounded corners
- Clip names and duration overlays
- Fade in/out handles at clip edges
- Layer controls (mute, solo, lock icons)
- Track height resize handles

**Sequence Blocks Section:**
- Visual containers for nested sequences
- Color-coded blocks:
  - Main sequences: `#6366f1` (purple)
  - Sub-sequences: `#f59e0b` (orange)
  - Templates: `#10b981` (green)
- Drag-and-drop reordering with visual feedback
- Collapse/expand arrows for complex sequences
- Audio-reactive effect indicators as colored dots
- Resize handles for duration adjustment

#### Right Sidebar
- **Width:** 320px (collapsible to 60px)
- **Background:** `#1a1a1a`
- **Border:** Left 1px solid `#2a2a2a`

**Audio Analysis Panel:**
- Real-time frequency spectrum analyzer (dark background, green bars)
- BPM detection display with confidence meter
- Key detection with musical notation
- Transient sensitivity sliders (0-100%)
- Audio input level meters (VU style)
- Peak hold indicators

**Effects Stack Panel:**
- Available effects library with category tabs
- Active effects chain with drag handles for reordering
- Parameter controls for each effect:
  - Intensity sliders (0-100%)
  - Threshold knobs with value display
  - Blend mode dropdowns
  - Bypass toggles with LED-style indicators
- Preset save/load buttons

**Sequence Properties Panel:**
- Selected sequence information display
- Resolution dropdown (1080p, 4K, etc.)
- FPS settings (24, 30, 60 fps)
- Layer count and status indicators
- Export region start/end time inputs
- Render quality settings

### Bottom Panel
- **Height:** 200px (collapsible to 40px)
- **Background:** `#1a1a1a`
- **Border:** Top 1px solid `#2a2a2a`

**Tabbed Interface:**
- Tab 1: "Node Editor" - Visual node-based effects routing
- Tab 2: "Video Preview" - Real-time video output with effects
- Tab 3: "Export Queue" - Render settings and progress

**Node Editor Content:**
- Dark canvas with subtle grid background (`#2a2a2a`)
- Draggable nodes with rounded corners and connection points
- Flow: Audio Input → Analysis → Effects → Video Output
- Real-time parameter visualization with animated connections
- Context menu for adding/removing nodes

## Interactive Components

### Waveform Component
- SVG-based rendering for smooth scaling
- Zoom range: 1x to 1000x with smooth transitions
- Click and drag selection with keyboard modifiers
- Right-click context menu for markers
- Playhead scrubbing on click/drag
- Responsive to container width changes
- Keyboard shortcuts for navigation

### Sample Pads
- 4x4 grid layout with consistent spacing
- Each pad specifications:
  - Size: 60x60px
  - Background: `#2a2a2a`
  - Border-radius: 8px
  - Active state: `#00ff88` glow with box-shadow
  - Hover state: 2px solid `#00ff88` border
  - Loading state: pulsing animation
  - Velocity sensitivity with visual feedback
- MIDI controller integration support
- Sample preview on hover

### Video Sequence Blocks
- Draggable containers with smooth animations
- Visual nesting with 20px left indentation per level
- Rounded corners (6px border-radius)
- Drop shadows for depth perception
- Resize handles at edges for duration adjustment
- Effect indicators as 8px colored dots in top-right corner
- Context menu with cut/copy/paste/delete options

### Timeline Controls
- Transport buttons with vector icons
- Time display with editable input fields
- Zoom slider with logarithmic scaling
- Snap controls with visual grid overlay toggle
- Loop region controls with draggable handles
- Keyboard shortcuts displayed in tooltips

## Responsive Behavior
- Collapsible sidebars with 300ms ease-in-out transitions
- Minimum content width: 800px with horizontal scroll
- Touch-friendly targets (minimum 44px) for mobile devices
- Keyboard navigation with visible focus indicators
- Auto-hide panels on screens smaller than 1200px
- Adaptive font sizes based on viewport

## Animation & Interactions
- Panel collapse/expand: 200ms cubic-bezier(0.4, 0, 0.2, 1)
- Waveform real-time updates at 60fps during playback
- Drag-and-drop with visual feedback and snap zones
- Hover states with 150ms transition delays
- Loading states with skeleton screens and progress indicators
- Toast notifications with slide-in animations from top-right
- Smooth scrolling for timeline navigation

## Accessibility Features
- High contrast mode toggle in settings
- Complete keyboard navigation with tab order
- Screen reader compatible ARIA labels and descriptions
- Focus indicators with 2px solid `#00ff88` outline
- Reduced motion option respecting prefers-reduced-motion
- Color-blind friendly palette with pattern/texture alternatives
- Scalable UI with support for 200% zoom levels

## Technical Requirements
- Modern browser support (Chrome 90+, Firefox 88+, Safari 14+)
- WebGL/WebGPU for video rendering
- Web Audio API for real-time audio processing
- File API for drag-and-drop media import
- Local storage for user preferences and project autosave
- Service worker for offline functionality
- Progressive Web App capabilities with install prompt
