const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true
    },
    icon: path.join(__dirname, 'assets/icon.png')
  });

  // Load the browser UI
  mainWindow.loadFile('src/index.html');

  // Open DevTools in development mode
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

// MILESTONE: Refactored shutdown logic to keep app running
// Instead of quitting when all windows are closed, we keep the app alive
// and create a new window to maintain the browser experience
app.on('window-all-closed', function () {
  // Keep the Electron app running on all platforms (including non-macOS)
  // This prevents the app from quitting when the last window is closed
  // Instead, recreate a window to show a welcome/blank state
  
  // TODO: Implement tab recovery mechanism to restore previous session
  // TODO: Add user preference for shutdown behavior (minimize vs. blank window)
  // TODO: Consider implementing a system tray icon for minimized state
  
  // Create a new window instead of quitting
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
