# Revo Video Editor 🎬

A modern, powerful desktop video editor built with Tauri, Vue 3, and TypeScript. Create professional video montages with an intuitive timeline-based interface.

![Revo Video Editor](app-icon.png)

## ✨ Features

- 🎥 **Timeline-Based Editing** - Intuitive drag-and-drop timeline for precise video editing
- 🎵 **Audio Management** - Add background music and sound effects with volume control
- 📝 **Text & Captions** - Add dynamic text overlays with customizable fonts and styles
- 🎨 **Visual Effects** - Apply filters, transitions, and effects to your videos
- 🖼️ **Image Support** - Insert images and graphics into your video projects
- 📐 **Shapes & Objects** - Add circles, rectangles, arrows, and custom shapes
- 😀 **Emoji Library** - Built-in emoji collection for engaging content
- 🌍 **Internationalization** - Multi-language support (English, Croatian)
- 📤 **Export Videos** - Render your projects to high-quality video files
- 🎯 **Layer Management** - Control the order and visibility of all elements

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Yarn** package manager - [Install](https://yarnpkg.com/getting-started/install)
- **Rust** - [Install](https://rustup.rs/)
- **FFmpeg** - Required for video export
  - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
  - **macOS**: `brew install ffmpeg`
  - **Linux**: `sudo apt install ffmpeg` (Ubuntu/Debian) or `sudo pacman -S ffmpeg` (Arch)

#### System Dependencies (Linux Only)

```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libsoup2.4-dev

# Arch/Manjaro
sudo pacman -S webkit2gtk base-devel curl wget file openssl gtk3 \
    libappindicator-gtk3 librsvg libsoup
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/revo-video-editor.git
   cd revo-video-editor
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Run in development mode**
   ```bash
   yarn tauri dev
   ```

4. **Build for production**
   ```bash
   yarn tauri build
   ```

## 📁 Project Structure

```
revo-video-editor/
├── src/                      # Vue application source
│   ├── components/          # Vue components
│   │   ├── app/            # App-level components
│   │   └── dashboard/      # Editor components
│   │       ├── Controls.vue
│   │       ├── Timeline.vue
│   │       ├── LayerList.vue
│   │       └── sidebar/    # Sidebar tabs
│   ├── pages/              # Application pages
│   ├── store/              # State management (Pinia)
│   ├── utils/              # Utility functions
│   ├── i18n/               # Internationalization
│   └── router/             # Vue Router configuration
├── src-tauri/               # Tauri backend (Rust)
│   ├── src/
│   │   └── main.rs
│   ├── tauri.conf.json
│   └── Cargo.toml
├── public/                  # Static assets
│   ├── audio/              # Sample audio files
│   ├── videos/             # Sample videos
│   ├── images/             # Sample images
│   ├── emojis/             # Emoji SVGs
│   └── shapes/             # Shape SVGs
└── package.json
```

## 🎨 Tech Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Fabric.js** - Canvas manipulation library
- **Pinia** - State management

### Backend
- **Tauri** - Build smaller, faster, and more secure desktop applications
- **Rust** - Systems programming language

### Tools
- **FFmpeg** - Video processing and export
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🎯 Usage

### Creating a New Project

1. Launch Revo Video Editor
2. Click "New Project" or use the sidebar to add media
3. Drag and drop videos, images, or audio into the timeline

### Adding Media

- **Videos**: Click the "Videos" tab in the sidebar
- **Audio**: Click the "Audio" tab to browse background music
- **Images**: Import your own images via the "Uploads" tab
- **Text**: Add text overlays from the "Text" tab
- **Objects**: Add shapes and emojis from the "Objects" tab

### Editing Timeline

- **Drag** elements to reposition them
- **Resize** elements by dragging the edges
- **Layer control** using the layer list on the right
- **Trim** videos by adjusting start/end points
- **Playback** using the control bar

### Exporting Your Video

1. Click the "Export" button in the top controls
2. Choose your export settings (resolution, format, quality)
3. Wait for FFmpeg to render your video
4. Find your exported video in the specified location

> **Note**: FFmpeg must be installed for video export to work. The application will prompt you with installation instructions if FFmpeg is not detected.

## 🛠️ Development

### Running Tests

```bash
yarn test
```

### Linting

```bash
yarn lint
```

### Format Code

```bash
yarn format
```

### Type Checking

```bash
yarn type-check
```

## 🌐 Internationalization

Revo supports multiple languages. To add a new language:

1. Create a new file in `src/i18n/` (e.g., `fr.ts`)
2. Copy the structure from `en.ts`
3. Translate all strings
4. Import and register in your i18n configuration

## 📦 Building

### Development Build
```bash
yarn tauri dev
```

### Production Build
```bash
yarn tauri build
```

The built application will be in `src-tauri/target/release/`.

### Platform-Specific Builds

- **Windows**: `.exe` installer
- **macOS**: `.dmg` or `.app` bundle
- **Linux**: `.deb`, `.AppImage`, or `.rpm`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Large video files (>500MB) may cause performance issues
- Export time depends on video length and system specifications
- Some video codecs may not be supported without additional FFmpeg builds

## 🔮 Roadmap

- [ ] Video effects and filters
- [ ] Advanced transitions
- [ ] Green screen (chroma key) support
- [ ] Multi-track audio mixing
- [ ] Keyboard shortcuts
- [ ] Auto-save functionality
- [ ] Cloud storage integration
- [ ] Collaboration features
- [ ] Plugin system

## 💬 Support

If you encounter any issues or have questions:

- Open an issue on [GitHub Issues](https://github.com/yourusername/revo-video-editor/issues)
- Check the [Documentation](https://github.com/yourusername/revo-video-editor/wiki)
- Join our [Discord Community](https://discord.gg/yourserver)

## 👏 Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI powered by [Vue 3](https://vuejs.org/)
- Canvas rendering by [Fabric.js](http://fabricjs.com/)
- Icons from [Lucide](https://lucide.dev/)
- Sample assets from various open-source contributors

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/revo-video-editor?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/revo-video-editor?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/revo-video-editor)
![License](https://img.shields.io/github/license/yourusername/revo-video-editor)

---

**Made with ❤️ by the Revo Team**
