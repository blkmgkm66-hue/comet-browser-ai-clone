// ============================================================================
// PHASE 1: Preload Script
// ============================================================================
// Electron preload script that runs before the renderer process
// Provides secure bridge between renderer and main processes
// Sets up IPC communication and exposes limited Node.js APIs

const { contextBridge, ipcRenderer } = require('electron');

// ============================================================================
// PHASE 1: Context Bridge API
// ============================================================================
// Expose safe APIs to the renderer process through contextBridge
// This maintains security while allowing necessary functionality

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => process.platform,
  
  // File system operations (future implementation)
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (content) => ipcRenderer.invoke('save-file', content),
  
  // Session management (future implementation)
  saveSession: (data) => ipcRenderer.invoke('save-session', data),
  loadSession: () => ipcRenderer.invoke('load-session'),
  
  // Settings management (future implementation)
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
});

// ============================================================================
// PHASE 1: Security Logging
// ============================================================================
// Log preload script initialization for debugging

console.log('Preload script loaded successfully');
console.log('Platform:', process.platform);
console.log('Electron version:', process.versions.electron);
console.log('Chrome version:', process.versions.chrome);
console.log('Node version:', process.versions.node);
