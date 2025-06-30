// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke("window-minimize"),
  maximizeWindow: () => ipcRenderer.invoke("window-maximize"),
  closeWindow: () => ipcRenderer.invoke("window-close"),

  // File operations
  selectPdfFile: () => ipcRenderer.invoke("select-pdf-file"),
  readPdfFile: (filePath: string) =>
    ipcRenderer.invoke("read-pdf-file", filePath),
  getFileInfo: (filePath: string) =>
    ipcRenderer.invoke("get-file-info", filePath),
  openFileLocation: (filePath: string) =>
    ipcRenderer.invoke("open-file-location", filePath),

  // Secure API Key Storage
  storeApiKey: (apiKey: string) => ipcRenderer.invoke("store-api-key", apiKey),
  loadApiKey: () => ipcRenderer.invoke("load-api-key"),
  removeApiKey: () => ipcRenderer.invoke("remove-api-key"),
  hasApiKey: () => ipcRenderer.invoke("has-api-key"),
});

// Types are defined in src/types/index.ts
