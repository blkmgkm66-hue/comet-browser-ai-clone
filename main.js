const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// ============================================================================
// PHASE 1: Main Window Creation with Enhanced Configuration
// ============================================================================

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
      preload: path.join(__dirname, 'src/preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#1a1a1a'
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

  return mainWindow;
}

// ============================================================================
// PHASE 1: Session Management
// ============================================================================
// Manage browser sessions, cookies, and persistent state

const { session } = require('electron');

function configureSession() {
  const ses = session.defaultSession;
  
  // Set user agent
  ses.setUserAgent('Comet Browser/1.0');
  
  // Configure permissions
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    // Handle permission requests (camera, microphone, notifications, etc.)
    callback(false); // Default deny, implement permission dialog later
  });
  
  // Configure download behavior
  ses.on('will-download', (event, item, webContents) => {
    // Set download path
    // Show download progress in UI
    // Handle download completion
  });
}

// ============================================================================
// PHASE 1: Application Lifecycle
// ============================================================================
// Enhanced app lifecycle management

app.whenReady().then(() => {
  configureSession();
  mainWindow = createMainWindow();
  
  // Register global shortcuts
  // Initialize tray icon (if needed)
  // Set up auto-updater (future)
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow();
  }
});

app.on('before-quit', () => {
  // Save application state
  // Clean up resources
  // Close database connections
});
