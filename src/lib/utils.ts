import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Función para validar el formato de la API key de Google Gemini
export function validateGeminiApiKey(key: string): boolean {
  // Las API keys de Google Gemini suelen tener un formato específico
  // Generalmente empiezan con "AIza" y tienen 39 caracteres
  return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
}

// Función para enmascarar la API key
export function maskApiKey(key: string): string {
  if (key.length <= 8) return "*".repeat(key.length);
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
}
