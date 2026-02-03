# Revo - Professional Video Editor

A high-performance video editor built with a multi-language architecture:
- **C++17** core for video processing (FFmpeg, OpenGL)
- **Rust** backend for memory-safe system operations (Tauri framework)
- **React + TypeScript** for modern UI/UX

## Features

- ✨ Professional dark theme inspired by DaVinci Resolve
- 🎬 Multi-track timeline editing
- 🎨 Real-time video effects (color correction, blur, transforms)
- 🎵 Multi-track audio mixing
- 📤 Hardware-accelerated video export (H.264, H.265, VP9)
- ⌨️ Professional keyboard shortcuts

## Architecture

```
┌─────────────────────────────────────┐
│  React + TypeScript (UI)           │
├─────────────────────────────────────┤
│  Rust + Tauri (Backend)             │
├─────────────────────────────────────┤
│  C++ + FFmpeg (Video Core)          │
└─────────────────────────────────────┘
```

## Development

```bash
# Install frontend dependencies
npm install

# Install Tauri CLI
cargo install tauri-cli

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## System Requirements

- **FFmpeg** development libraries (libavcodec, libavformat, libavutil, libswscale)
- **OpenGL 3.3+** for GPU acceleration
- **Rust 1.70+** and **Node.js 18+**

## License

MIT
