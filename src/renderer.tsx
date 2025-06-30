/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

console.log(
  '👋 This message is being logged by "renderer.tsx", included via webpack'
);

// Buscar el elemento root en el DOM
const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find the root element");
}

// Crear el root de React y montar la aplicación
const root = createRoot(container);
root.render(<App />);
