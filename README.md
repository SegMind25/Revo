# Revo Video Editor

A powerful, modern Web Video Editor built with Next.js, React, and TailwindCSS. Revo features complex timeline management, video trimming, text overlays, and server-side rendering support.

## Recent Architecture Updates

- **Local Uploads Bypass**: Replaced strict Google Cloud Run external dependencies with a robust local Next.js `/api/uploads/local` filesystem proxy to allow true offline editing without 503 HTTP errors.
- **Graceful Error Handling**: Implemented safe HTML payload parsing to protect backend renderer API routes from crashing during cloud API outages.
- **Secure Context Fixes**: Added COOP/COEP Cross-Origin security headers to `next.config.ts` to allow high-performance `SharedArrayBuffer` multithreading and Origin Private File System (OPFS) capabilities.

## Premium UI & Dark Mode Overhaul
We completely redesigned Revo into a Premium Dark Mode video editor:
- **Obsidian Dark Theme**: Switched from default Tailwind light grays to deep `zinc-950` backgrounds.
- **Dynamic Glassmorphism**: Integrated `backdrop-blur-2xl` transparent Navbars and semi-transparent panels.
- **Ambient Glows**: Added soft glowing background elements (`bg-violet-600/10` and `bg-cyan-600/10`) to provide an immersive depth.
- **Micro-Animations**: Updated core CTA buttons (Export) with animated linear gradients and hover drop shadows.

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
# Note: To utilize OPFS features efficiently, ensure you access via http://localhost:3000 rather than a local network IP.
```

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + UI themes
- **Video Engine:** DesignCombo Frames & remotion
- **State:** Zustand

## Contributing
Updates are synced to the `main` branch.
