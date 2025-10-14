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
// - On other platforms, closing all windows quits the application
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// ============================================================================
// PHASE 1 - MILESTONE: ELECTRON APP SHELL WITH THREE-PANEL LAYOUT
// ============================================================================
// Basic Electron application structure with BrowserWindow configuration
// Three-panel layout scaffold for navigation, browser view, and sidebar
// All code below is commented out until Phase 1 implementation begins
// ============================================================================

/*
// ============================================================================
// PHASE 1: IPC Communication Setup
// ============================================================================
// Inter-process communication between main and renderer processes
// Handles navigation, tab management, and UI state synchronization

const { ipcMain } = require('electron');

// IPC Handler: Navigate to URL
ipcMain.handle('navigate-to-url', async (event, url) => {
  // Validate URL format
  // Send navigation command to active webview
  // Update address bar in renderer process
  return { success: true, url };
});

// IPC Handler: Create new tab
ipcMain.handle('create-new-tab', async (event, url) => {
  // Generate unique tab ID
  // Initialize tab state
  // Notify renderer to create UI element
  return { success: true, tabId: 'tab-' + Date.now() };
});

// IPC Handler: Close tab
ipcMain.handle('close-tab', async (event, tabId) => {
  // Remove tab from state
  // Clean up resources
  // Notify renderer to update UI
  return { success: true };
});

// IPC Handler: Update tab state
ipcMain.handle('update-tab-state', async (event, tabId, state) => {
  // Update tab title, favicon, loading status
  // Persist state if needed
  return { success: true };
});

// ============================================================================
// PHASE 1: Window Management
// ============================================================================
// Enhanced window configuration for three-panel layout

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    frame: true,
    titleBarStyle: 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'src/preload.js'),
      webviewTag: true
    }
  });

  // Load main HTML file
  window.loadFile('src/index.html');

  // Development mode: open DevTools
  if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
    window.webContents.openDevTools();
  }

  return window;
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

*/
