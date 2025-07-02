const API_KEY_STORAGE_KEY = "gemini-api-key";

// Función para validar el formato de la API key de Google Gemini
const isValidApiKeyFormat = (key: string): boolean => {
  // Las API keys de Google Gemini suelen tener un formato específico
  // Generalmente empiezan con "AIza" y tienen 39 caracteres
  return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
};

// Función para enmascarar la API key
const maskApiKey = (key: string): string => {
  if (key.length <= 8) return "*".repeat(key.length);
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
};

class ApiKeyService {
  getApiKey(): string | null {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }

  setApiKey(key: string): boolean {
    try {
      if (!key || key.trim() === "") {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        return true;
      }

      const trimmedKey = key.trim();
      const isValid = isValidApiKeyFormat(trimmedKey);

      if (!isValid) {
        console.error(
          "Formato de API key inválido. Debe ser una API key válida de Google Gemini."
        );
        return false;
      }

      localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);
      
      // Verificar que se guardó correctamente
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey !== trimmedKey) {
        console.error("Error al guardar la API key en localStorage");
        return false;
      }

      console.log("✅ API key configurada y persistida correctamente");
      return true;
    } catch (error) {
      console.error("Error al configurar API key:", error);
      return false;
    }
  }

  removeApiKey(): void {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }

  isApiKeyReady(): boolean {
    const key = this.getApiKey();
    return key !== null && isValidApiKeyFormat(key);
  }

  getMaskedApiKey(): string | null {
    const key = this.getApiKey();
    return key ? maskApiKey(key) : null;
  }

  validateApiKey(key: string): boolean {
    return isValidApiKeyFormat(key);
  }
}

export const apiKeyService = new ApiKeyService();
