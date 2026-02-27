# Revo Browser

A modern, lightweight browser built with Electron for fast and secure browsing.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)

## Features

- ⚡ **Lightning Fast** - Built on Electron for optimal performance
- 🛡️ **Secure Browsing** - Enhanced privacy with popup blocking and Do Not Track
- 🎨 **Customizable Theme** - Switch between dark and light modes
- 📑 **Tab Management** - Multiple tabs with easy management
- 🔖 **Bookmarks** - Save and organize your favorite pages
- 📜 **History** - Track your browsing history
- ⬇️ **Downloads** - Built-in download manager
- 🧩 **Extensions** - Support for browser extensions
- 🔗 **Quick Shortcuts** - Add custom website shortcuts to new tab page

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm

### Install Dependencies

```bash
npm install
```

## Usage

### Development Mode

```bash
npm start
```

or with logging:

```bash
npm run dev
```

## Building

### Build for Linux (.deb)

```bash
npm run build:linux
```

This creates a `.deb` package in the `export` folder.

### Build for Windows (.exe)

```bash
npm run build:win
```

This creates:
- NSIS installer (`.exe`)
- Portable executable

### Build for Both Platforms

```bash
npm run build:all
```

All builds are output to the `export` folder.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close current tab |
| `Ctrl+Tab` | Switch to next tab |
| `Ctrl+L` | Focus URL bar |
| `F5` or `Ctrl+R` | Refresh page |
| `Alt+Left` | Go back |
| `Alt+Right` | Go forward |

## Adding Extensions

1. Click the puzzle piece icon (Extensions) in the toolbar
2. Drag and drop extension folders to install
3. Extensions are loaded from the browser's user data directory

## Adding Website Shortcuts

1. On the new tab page, click the "Add" button in the Quick Links section
2. Enter a name for the shortcut
3. Enter the full URL (e.g., `https://example.com`)
4. The shortcut will appear in the Quick Links grid

## Project Structure

```
revo-browser/
├── main.js          # Main Electron process
├── renderer.js      # Renderer process (browser UI)
├── index.html       # Main HTML file
├── styles.css       # Stylesheet
├── package.json     # Project configuration
└── README.md        # This file
```

## Configuration

Edit `package.json` to customize:
- App name and version
- Build targets
- File associations

## License

ISC License

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For issues and feature requests, please visit:
https://github.com/SegMind25/Revo/issues
