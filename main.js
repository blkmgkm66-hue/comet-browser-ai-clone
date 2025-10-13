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

// MILESTONE: Fixed window closing logic for standard Electron behavior
// Updated shutdown logic to follow Electron best practices:
// - On macOS, apps stay active until user explicitly quits (Cmd+Q)
// - On Windows/Linux, app quits when all windows are closed
app.on('window-all-closed', function () {
  // On macOS it's common for applications to stay open until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On macOS, re-create a window when the dock icon is clicked and there are no other windows open
  if (mainWindow === null) {
    createWindow();
  }
});
