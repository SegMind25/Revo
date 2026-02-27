const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Disable D-Bus systemd integration to prevent scope errors on Linux
if (process.platform === 'linux') {
  process.env.DBUS_SESSION_BUS_ADDRESS = 'disabled';
  // Also disable systemd session manager
  app.commandLine.appendSwitch('disable-session-manager');
}

// Disable problematic features (consolidated to avoid conflicts)
const disabledFeatures = ['WaylandColorManager'];
if (process.platform === 'linux') {
  disabledFeatures.push('ChromeBrowserDirectMemoryReclaim');
}
app.commandLine.appendSwitch('disable-features', disabledFeatures.join(','));

// Force X11 and disable Wayland completely
app.commandLine.appendSwitch('disable-wayland-ime');
app.commandLine.appendSwitch('gtk-version', '3');

// Fix GPU crashes on Linux
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-dev-shm-usage');

// Set default download path
const downloadsPath = path.join(app.getPath('userData'), 'Downloads');
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
      enableRemoteModule: false,
      sandbox: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
    titleBarStyle: 'hidden',
    show: false,
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Setup download handler for webContents
  mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
    const fileName = item.getFilename();
    const filePath = path.join(downloadsPath, fileName);
    
    // Set save path
    item.setSavePath(filePath);
    
    // Show download progress
    mainWindow.webContents.send('download-started', {
      fileName: fileName,
      totalBytes: item.getTotalBytes()
    });
    
    item.on('updated', (event, state) => {
      if (state === 'interrupted') {
        console.log('Download is interrupted but can be resumed');
      } else if (state === 'progressing') {
        if (item.isPaused()) {
          console.log('Download is paused');
        } else {
          const progress = ((item.getReceivedBytes() / item.getTotalBytes()) * 100).toFixed(1);
          mainWindow.webContents.send('download-progress', {
            fileName: fileName,
            receivedBytes: item.getReceivedBytes(),
            totalBytes: item.getTotalBytes(),
            progress: progress
          });
        }
      }
    });
    
    item.once('done', (event, state) => {
      if (state === 'completed') {
        mainWindow.webContents.send('download-completed', {
          fileName: fileName,
          filePath: filePath
        });
        // Show notification
        shell.showItemInFolder(filePath);
      } else {
        console.log(`Download failed: ${state}`);
        mainWindow.webContents.send('download-failed', {
          fileName: fileName,
          reason: state
        });
      }
    });
  });
}

// IPC Handlers for window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// IPC Handlers for downloads
ipcMain.handle('get-downloads-path', () => {
  return downloadsPath;
});

ipcMain.handle('show-download-dialog', async (event, url) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: path.join(downloadsPath, path.basename(url))
  });
  return result;
});

// IPC Handlers for extensions
ipcMain.handle('load-extension', async (event, extensionPath) => {
  try {
    // Use the new extensions API (Electron 40+)
    const extension = await session.defaultSession.extensions.loadExtension(extensionPath);
    return { success: true, name: extension.name };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-extensions', () => {
  // Use the new extensions API (Electron 40+)
  const extensions = session.defaultSession.extensions.getAllExtensions();
  return extensions.map(ext => ({
    id: ext.id,
    name: ext.manifest.name,
    version: ext.manifest.version,
    enabled: !ext.manifest.disabled
  }));
});

ipcMain.handle('remove-extension', async (event, extensionId) => {
  try {
    await session.defaultSession.extensions.removeExtension(extensionId);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers for shortcuts
ipcMain.handle('add-shortcut', async (event, shortcut) => {
  try {
    const shortcutsFile = path.join(app.getPath('userData'), 'shortcuts.json');
    let shortcuts = [];
    if (fs.existsSync(shortcutsFile)) {
      shortcuts = JSON.parse(fs.readFileSync(shortcutsFile, 'utf8'));
    }
    shortcuts.push({ ...shortcut, id: Date.now() });
    fs.writeFileSync(shortcutsFile, JSON.stringify(shortcuts, null, 2));
    return { success: true, shortcuts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-shortcuts', () => {
  try {
    const shortcutsFile = path.join(app.getPath('userData'), 'shortcuts.json');
    if (fs.existsSync(shortcutsFile)) {
      return JSON.parse(fs.readFileSync(shortcutsFile, 'utf8'));
    }
    return [];
  } catch (error) {
    return [];
  }
});

ipcMain.handle('remove-shortcut', async (event, shortcutId) => {
  try {
    const shortcutsFile = path.join(app.getPath('userData'), 'shortcuts.json');
    let shortcuts = [];
    if (fs.existsSync(shortcutsFile)) {
      shortcuts = JSON.parse(fs.readFileSync(shortcutsFile, 'utf8'));
    }
    shortcuts = shortcuts.filter(s => s.id !== shortcutId);
    fs.writeFileSync(shortcutsFile, JSON.stringify(shortcuts, null, 2));
    return { success: true, shortcuts };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Shell handlers
ipcMain.handle('shell.showItemInFolder', (event, filePath) => {
  shell.showItemInFolder(filePath);
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
