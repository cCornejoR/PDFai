import { useState, useEffect, useCallback } from "react";

interface ApiKeyStatus {
  hasKey: boolean;
  isReady: boolean;
  maskedKey: string | null;
}

const API_KEY_STORAGE_KEY = "gemini-api-key";

// Función para enmascarar la API key
const maskApiKey = (key: string): string => {
  if (key.length <= 8) return "*".repeat(key.length);
  return key.slice(0, 4) + "*".repeat(key.length - 8) + key.slice(-4);
};

// Función para validar el formato de la API key de Google Gemini
const isValidApiKeyFormat = (key: string): boolean => {
  // Las API keys de Google Gemini suelen tener un formato específico
  // Generalmente empiezan con "AIza" y tienen 39 caracteres
  return /^AIza[A-Za-z0-9_-]{35}$/.test(key);
};

export const useApiKey = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>(() => {
    // Priorizar localStorage sobre variables de entorno
    let savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);

    // Si no hay key en localStorage, intentar obtener de variables de entorno como fallback
    if (!savedKey && import.meta.env.VITE_GEMINI_API_KEY) {
      savedKey = import.meta.env.VITE_GEMINI_API_KEY;
      // Guardar en localStorage para persistencia
      localStorage.setItem(API_KEY_STORAGE_KEY, savedKey);
    }

    if (savedKey) {
      return {
        hasKey: true,
        isReady: isValidApiKeyFormat(savedKey),
        maskedKey: maskApiKey(savedKey),
      };
    }

    return {
      hasKey: false,
      isReady: false,
      maskedKey: null,
    };
  });

  // Función para establecer la API key
  const setApiKey = useCallback(async (key: string): Promise<boolean> => {
    try {
      if (!key || key.trim() === "") {
        // Eliminar API key
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKeyStatus({
          hasKey: false,
          isReady: false,
          maskedKey: null,
        });
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

      // Guardar la API key con persistencia garantizada
      localStorage.setItem(API_KEY_STORAGE_KEY, trimmedKey);

      // Verificar que se guardó correctamente
      const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (savedKey !== trimmedKey) {
        console.error("Error al guardar la API key en localStorage");
        return false;
      }

      setApiKeyStatus({
        hasKey: true,
        isReady: true,
        maskedKey: maskApiKey(trimmedKey),
      });

      console.log("✅ API key configurada y persistida correctamente");
      return true;
    } catch (error) {
      console.error("Error al configurar API key:", error);
      return false;
    }
  }, []);

  // Función para obtener la API key real (para uso interno)
  const getApiKey = useCallback((): string | null => {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  }, []);

  // Función para verificar si la API key está lista para usar
  const isApiKeyReady = useCallback((): boolean => {
    const key = getApiKey();
    return key !== null && isValidApiKeyFormat(key);
  }, [getApiKey]);

  // Función para eliminar la API key
  const removeApiKey = useCallback(() => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKeyStatus({
      hasKey: false,
      isReady: false,
      maskedKey: null,
    });
  }, []);

  return {
    apiKeyStatus,
    setApiKey,
    getApiKey,
    isApiKeyReady,
    removeApiKey,
  };
};

export default useApiKey;
