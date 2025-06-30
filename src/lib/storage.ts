import { AppConfig, PDFDocument, ChatSession, AppState } from "../types";

// Configuración por defecto
const DEFAULT_CONFIG: AppConfig = {
  theme: "system",
  language: "es",
  chatPreferences: {
    maxTokens: 2048,
    temperature: 0.7,
    enableMarkdown: true,
  },
  pdfPreferences: {
    defaultZoom: 1.0,
    enableAnnotations: true,
    autoSave: true,
  },
  uiPreferences: {
    sidebarWidth: 280,
    chatPanelWidth: 400,
    enableAnimations: true,
    enableGlassmorphism: true,
  },
  apiKeys: {},
  recentFiles: [],
  favorites: [],
};

export class StorageManager {
  private static instance: StorageManager;
  private config: AppConfig = DEFAULT_CONFIG;
  private pdfs: PDFDocument[] = [];
  private chats: ChatSession[] = [];

  private constructor() {
    this.loadInitialData();
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  // Funciones utilitarias para manejar fechas
  private convertDatesToObjects(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.convertDatesToObjects(item));
    }

    if (typeof data === "object") {
      const converted: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];

          // Convertir campos de fecha conocidos
          if (
            (key === "uploadedAt" ||
              key === "addedAt" ||
              key === "createdAt" ||
              key === "updatedAt" ||
              key === "timestamp") &&
            typeof value === "string"
          ) {
            converted[key] = new Date(value);
          } else {
            converted[key] = this.convertDatesToObjects(value);
          }
        }
      }
      return converted;
    }

    return data;
  }

  // Cargar datos iniciales de la aplicación
  async loadInitialData(): Promise<AppState> {
    try {
      // Primero intentar cargar desde Electron
      if (window.electronAPI && window.electronAPI.loadConfig) {
        try {
          const result = await window.electronAPI.loadConfig();
          if (result.success && result.config) {
            this.config = { ...DEFAULT_CONFIG, ...result.config };
            console.log("Configuración cargada desde Electron:", this.config);

            // Guardar también en localStorage como backup
            localStorage.setItem("pdfai-config", JSON.stringify(this.config));
          } else {
            console.log(
              "No hay configuración guardada en Electron, usando default"
            );
          }
        } catch (electronError) {
          console.warn(
            "Error cargando desde Electron, intentando localStorage:",
            electronError
          );

          // Fallback a localStorage
          const savedConfig = localStorage.getItem("pdfai-config");
          if (savedConfig) {
            this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
            console.log(
              "Configuración cargada desde localStorage:",
              this.config
            );
          }
        }
      } else {
        // En modo web, usar localStorage
        const savedConfig = localStorage.getItem("pdfai-config");
        if (savedConfig) {
          this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
          console.log(
            "Configuración cargada desde localStorage (web):",
            this.config
          );
        }
      }

      // Cargar PDFs desde localStorage (temporal) con conversión de fechas
      const savedPDFs = localStorage.getItem("pdfai-pdfs");
      if (savedPDFs) {
        const parsedPDFs = JSON.parse(savedPDFs);
        this.pdfs = this.convertDatesToObjects(parsedPDFs);
        console.log(
          "📄 PDFs cargados con fechas convertidas:",
          this.pdfs.length
        );
      }

      // Cargar chats desde localStorage (temporal) con conversión de fechas
      const savedChats = localStorage.getItem("pdfai-chats");
      if (savedChats) {
        const parsedChats = JSON.parse(savedChats);
        this.chats = this.convertDatesToObjects(parsedChats);
        console.log(
          "💬 Chats cargados con fechas convertidas:",
          this.chats.length
        );
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    }

    // Retornar el estado completo de la aplicación
    return {
      currentView: "pdfs" as const,
      selectedPDF: null,
      pdfs: this.pdfs,
      currentChat: null,
      chats: this.chats,
      config: this.config,
      isLoading: false,
      error: null,
      systemInfo: null,
    };
  }

  // Configuración
  async getConfig(): Promise<AppConfig> {
    return this.config;
  }

  async setConfig(newConfig: Partial<AppConfig>): Promise<boolean> {
    try {
      this.config = { ...this.config, ...newConfig };

      let electronSuccess = true;
      let localStorageSuccess = true;

      // Intentar guardar en Electron primero
      if (window.electronAPI && window.electronAPI.saveConfig) {
        try {
          const result = await window.electronAPI.saveConfig(this.config);
          electronSuccess = result.success;
          console.log("Configuración guardada en Electron:", electronSuccess);
        } catch (electronError) {
          console.error("Error guardando en Electron:", electronError);
          electronSuccess = false;
        }
      }

      // Siempre guardar en localStorage como backup
      try {
        localStorage.setItem("pdfai-config", JSON.stringify(this.config));
        console.log("Configuración guardada en localStorage");
      } catch (localError) {
        console.error("Error guardando en localStorage:", localError);
        localStorageSuccess = false;
      }

      // Retornar true si al menos uno funcionó
      const success = electronSuccess || localStorageSuccess;

      if (success) {
        console.log("Configuración guardada exitosamente:", this.config);
      } else {
        console.error("Falló guardar configuración en ambos lugares");
      }

      return success;
    } catch (error) {
      console.error("Error saving config:", error);
      return false;
    }
  }

  // Obtener API key de Gemini
  async getGeminiApiKey(): Promise<string | null> {
    try {
      const config = await this.getConfig();
      const apiKey = config?.apiKeys?.gemini || config?.geminiApiKey || null;

      console.log("🔑 Cargando API key:", {
        exists: !!apiKey,
        length: apiKey?.length || 0,
        preview: apiKey
          ? apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4)
          : "N/A",
      });

      return apiKey;
    } catch (error) {
      console.error("Error obteniendo API key:", error);
      return null;
    }
  }

  // Establecer API key de Gemini
  async setGeminiApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log("💾 Guardando API key:", {
        length: apiKey.length,
        preview:
          apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4),
      });

      const success = await this.setConfig({
        apiKeys: { gemini: apiKey },
        geminiApiKey: apiKey, // Para compatibilidad con código existente
      });

      if (success) {
        // Configurar API key dinámicamente en el proceso principal de Electron
        if (window.electronAPI && window.electronAPI.setApiKey) {
          try {
            const envResult = await window.electronAPI.setApiKey(apiKey);
            if (envResult.success) {
              console.log("✅ API key configurada dinámicamente en Electron");
            } else {
              console.warn(
                "⚠️ Error configurando API key en entorno de Electron"
              );
            }
          } catch (electronError) {
            console.warn(
              "⚠️ Error llamando setApiKey de Electron:",
              electronError
            );
          }
        }

        console.log("✅ API key guardada exitosamente");

        // Verificar que se guardó correctamente
        const verification = await this.getGeminiApiKey();
        const isCorrect = verification === apiKey;

        console.log("🔍 Verificación de guardado:", {
          saved_correctly: isCorrect,
          original_length: apiKey.length,
          retrieved_length: verification?.length || 0,
        });

        return isCorrect;
      }

      console.error("❌ Falló al guardar API key");
      return false;
    } catch (error) {
      console.error("Error guardando API key:", error);
      return false;
    }
  }

  // PDFs
  async getPDFs(): Promise<PDFDocument[]> {
    return this.pdfs;
  }

  async addPDF(pdf: PDFDocument): Promise<boolean> {
    try {
      // Asegurar que addedAt sea un objeto Date válido
      const pdfWithValidDate: PDFDocument = {
        ...pdf,
        addedAt:
          pdf.addedAt instanceof Date
            ? pdf.addedAt
            : new Date(pdf.addedAt || Date.now()),
        // Mantener uploadedAt para compatibilidad si existe
        ...(pdf.uploadedAt && {
          uploadedAt:
            pdf.uploadedAt instanceof Date
              ? pdf.uploadedAt
              : new Date(pdf.uploadedAt || Date.now()),
        }),
      };

      this.pdfs.push(pdfWithValidDate);
      localStorage.setItem("pdfai-pdfs", JSON.stringify(this.pdfs));
      console.log("✅ PDF guardado exitosamente:", pdfWithValidDate.name);
      return true;
    } catch (error) {
      console.error("❌ Error adding PDF:", error);
      return false;
    }
  }

  async removePDF(pdfId: string): Promise<boolean> {
    try {
      this.pdfs = this.pdfs.filter((pdf) => pdf.id !== pdfId);
      localStorage.setItem("pdfai-pdfs", JSON.stringify(this.pdfs));

      // También eliminar chats asociados
      this.chats = this.chats.filter((chat) => chat.pdfId !== pdfId);
      localStorage.setItem("pdfai-chats", JSON.stringify(this.chats));

      // Eliminar datos del PDF si existen
      localStorage.removeItem(`pdfai-pdf-data-${pdfId}`);

      return true;
    } catch (error) {
      console.error("Error removing PDF:", error);
      return false;
    }
  }

  async getPDFById(pdfId: string): Promise<PDFDocument | null> {
    return this.pdfs.find((pdf) => pdf.id === pdfId) || null;
  }

  // Guardar datos binarios del PDF (para Electron)
  async savePDFData(pdfId: string, data: ArrayBuffer): Promise<boolean> {
    try {
      // Convertir ArrayBuffer a base64 para almacenar en localStorage
      const uint8Array = new Uint8Array(data);
      const binaryString = Array.from(uint8Array, (byte) =>
        String.fromCharCode(byte)
      ).join("");
      const base64String = btoa(binaryString);

      localStorage.setItem(`pdfai-pdf-data-${pdfId}`, base64String);
      console.log("✅ PDF data saved successfully:", pdfId);
      return true;
    } catch (error) {
      console.error("❌ Error saving PDF data:", error);
      return false;
    }
  }

  // Recuperar datos binarios del PDF (para Electron)
  async getPDFData(pdfId: string): Promise<ArrayBuffer | null> {
    try {
      const base64String = localStorage.getItem(`pdfai-pdf-data-${pdfId}`);
      if (!base64String) return null;

      // Convertir base64 de vuelta a ArrayBuffer
      const binaryString = atob(base64String);
      const uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }

      return uint8Array.buffer;
    } catch (error) {
      console.error("❌ Error retrieving PDF data:", error);
      return null;
    }
  }

  // Chats
  async getChats(): Promise<ChatSession[]> {
    return this.chats;
  }

  async getChatsByPDF(pdfId: string): Promise<ChatSession[]> {
    return this.chats.filter((chat) => chat.pdfId === pdfId);
  }

  async addChat(chat: ChatSession): Promise<boolean> {
    try {
      // Asegurar que las fechas sean objetos Date válidos
      const chatWithValidDates: ChatSession = {
        ...chat,
        createdAt:
          chat.createdAt instanceof Date
            ? chat.createdAt
            : new Date(chat.createdAt || Date.now()),
        updatedAt:
          chat.updatedAt instanceof Date
            ? chat.updatedAt
            : new Date(chat.updatedAt || Date.now()),
        messages: chat.messages.map((message) => ({
          ...message,
          timestamp:
            message.timestamp instanceof Date
              ? message.timestamp
              : new Date(message.timestamp || Date.now()),
        })),
      };

      this.chats.push(chatWithValidDates);
      localStorage.setItem("pdfai-chats", JSON.stringify(this.chats));
      console.log("✅ Chat guardado exitosamente:", chatWithValidDates.id);
      return true;
    } catch (error) {
      console.error("❌ Error adding chat:", error);
      return false;
    }
  }

  async updateChat(
    chatId: string,
    updates: Partial<ChatSession>
  ): Promise<boolean> {
    try {
      const chatIndex = this.chats.findIndex((chat) => chat.id === chatId);
      if (chatIndex === -1) {
        console.warn("⚠️ Chat no encontrado para actualizar:", chatId);
        return false;
      }

      // Asegurar que las fechas en las actualizaciones sean válidas
      const validatedUpdates = { ...updates };

      if (validatedUpdates.messages) {
        validatedUpdates.messages = validatedUpdates.messages.map(
          (message) => ({
            ...message,
            timestamp:
              message.timestamp instanceof Date
                ? message.timestamp
                : new Date(message.timestamp || Date.now()),
          })
        );
      }

      this.chats[chatIndex] = {
        ...this.chats[chatIndex],
        ...validatedUpdates,
        updatedAt: new Date(),
      };

      localStorage.setItem("pdfai-chats", JSON.stringify(this.chats));
      console.log("✅ Chat actualizado exitosamente:", chatId);
      return true;
    } catch (error) {
      console.error("❌ Error updating chat:", error);
      return false;
    }
  }

  async removeChat(chatId: string): Promise<boolean> {
    try {
      this.chats = this.chats.filter((chat) => chat.id !== chatId);
      localStorage.setItem("pdfai-chats", JSON.stringify(this.chats));
      return true;
    } catch (error) {
      console.error("Error removing chat:", error);
      return false;
    }
  }

  async getChatById(chatId: string): Promise<ChatSession | null> {
    return this.chats.find((chat) => chat.id === chatId) || null;
  }

  // Tema
  async setTheme(theme: "light" | "dark" | "system"): Promise<boolean> {
    return this.setConfig({ theme });
  }

  async getTheme(): Promise<"light" | "dark" | "system"> {
    return this.config.theme;
  }

  // Limpiar datos
  async clearAllData(): Promise<boolean> {
    try {
      this.config = DEFAULT_CONFIG;
      this.pdfs = [];
      this.chats = [];

      localStorage.removeItem("pdfai-config");
      localStorage.removeItem("pdfai-pdfs");
      localStorage.removeItem("pdfai-chats");

      if (window.electronAPI && window.electronAPI.saveConfig) {
        await window.electronAPI.saveConfig(DEFAULT_CONFIG);
      }

      return true;
    } catch (error) {
      console.error("Error clearing data:", error);
      return false;
    }
  }

  // Exportar datos
  async exportData(): Promise<object> {
    return {
      config: this.config,
      pdfs: this.pdfs.map((pdf) => ({
        ...pdf,
        path: "", // No exportar rutas por seguridad
      })),
      chats: this.chats,
      exportedAt: new Date().toISOString(),
    };
  }

  // Importar datos
  async importData(data: any): Promise<boolean> {
    try {
      if (data.config) {
        await this.setConfig(data.config);
      }

      if (data.chats && Array.isArray(data.chats)) {
        this.chats = data.chats;
        localStorage.setItem("pdfai-chats", JSON.stringify(this.chats));
      }

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  // Debug: Mostrar estado del storage
  async debugStorage(): Promise<void> {
    console.log("🔧 === DEBUG STORAGE ===");

    try {
      // Información de electron
      const hasElectron = !!window.electronAPI;
      console.log("🖥️ Electron disponible:", hasElectron);

      // Obtener config completa
      const config = await this.getConfig();
      console.log("📋 Config completa:", {
        hasApiKey: !!(config?.apiKeys?.gemini || config?.geminiApiKey),
        apiKeyLength:
          (config?.apiKeys?.gemini || config?.geminiApiKey)?.length || 0,
        configKeys: Object.keys(config || {}),
      });

      // Probar localStorage
      const localStorageTest = localStorage.getItem("pdfai-config");
      console.log("💾 localStorage:", {
        exists: !!localStorageTest,
        content: localStorageTest ? JSON.parse(localStorageTest) : null,
      });

      // Probar electron storage si disponible
      if (hasElectron && window.electronAPI.loadConfig) {
        try {
          const electronResult = await window.electronAPI.loadConfig();
          console.log("🖥️ Electron storage:", electronResult);
        } catch (error) {
          console.error("❌ Error en electron storage:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error en debug storage:", error);
    }

    console.log("🔧 === FIN DEBUG ===");
  }
}
