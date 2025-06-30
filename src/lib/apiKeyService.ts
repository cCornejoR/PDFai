// API Key Service for secure storage and management
import { initializeGeminiAI } from "./utils";
import { geminiService } from './geminiService';
import { embeddingService } from './embeddingService';

const API_KEY_STORAGE_KEY = "pdfai-gemini-api-key";

export class ApiKeyService {
  private static instance: ApiKeyService;
  private apiKey: string | null = null;
  private isInitialized: boolean = false;

  private constructor() {
    // Initialize async loading
    this.initializeAsync();
  }

  /**
   * Initialize the service asynchronously
   */
  private async initializeAsync(): Promise<void> {
    await this.loadApiKey();
  }

  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  /**
   * Load API key from storage
   */
  private async loadApiKey(): Promise<void> {
    try {
      // Try to load from Electron secure storage first
      if (window.electronAPI && window.electronAPI.loadApiKey) {
        const result = await window.electronAPI.loadApiKey();
        if (result.success && result.apiKey) {
          this.apiKey = result.apiKey;
          await this.initializeAI();
          console.log("✅ API key loaded from Electron secure storage");
          return;
        }
      }

      // Fallback to localStorage for backward compatibility
      const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedKey) {
        this.apiKey = storedKey;
        await this.initializeAI();
        console.log("✅ API key loaded from localStorage (fallback)");

        // Migrate to secure storage if available
        if (window.electronAPI && typeof window.electronAPI.storeApiKey === 'function') {
          await this.migrateToSecureStorage(storedKey);
        }
      }
    } catch (error) {
      console.error("❌ Error loading API key:", error);
    }
  }

  /**
   * Migrate API key from localStorage to secure storage
   */
  private async migrateToSecureStorage(apiKey: string): Promise<void> {
    try {
      if (window.electronAPI && window.electronAPI.storeApiKey) {
        const result = await window.electronAPI.storeApiKey(apiKey);
        if (result.success) {
          // Remove from localStorage after successful migration
          localStorage.removeItem(API_KEY_STORAGE_KEY);
          console.log("✅ API key migrated to secure storage");
        }
      }
    } catch (error) {
      console.error("⚠️ Error migrating API key to secure storage:", error);
    }
  }

  /**
   * Save API key to storage
   */
  private async saveApiKey(apiKey: string): Promise<void> {
    try {
      // Try to save to Electron secure storage first
      if (window.electronAPI && window.electronAPI.storeApiKey) {
        const result = await window.electronAPI.storeApiKey(apiKey);
        if (result.success) {
          this.apiKey = apiKey;
          await this.initializeAI();
          console.log("✅ API key saved to Electron secure storage");
          return;
        } else {
          console.warn(
            "⚠️ Failed to save to secure storage, falling back to localStorage"
          );
        }
      }

      // Fallback to localStorage
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
      this.apiKey = apiKey;
      await this.initializeAI();
      console.log("✅ API key saved to localStorage (fallback)");
    } catch (error) {
      console.error("❌ Error saving API key:", error);
      throw new Error("Failed to save API key");
    }
  }

  /**
   * Initialize all AI services with the current API key
   */
  private async initializeAI(): Promise<void> {
    if (this.apiKey) {
      try {
        // Initialize legacy Gemini util
        initializeGeminiAI(this.apiKey);
        
        // Initialize new services
        await geminiService.initialize(this.apiKey);
        embeddingService.initialize(this.apiKey);
        
        this.isInitialized = true;
        console.log("✅ All AI services initialized successfully");
      } catch (error) {
        console.error("❌ Error initializing AI services:", error);
        this.isInitialized = false;
      }
    }
  }

  /**
   * Set and save API key
   */
  public async setApiKey(apiKey: string): Promise<boolean> {
    try {
      // Validate the API key format first
      if (!apiKey || !apiKey.startsWith("AIza") || apiKey.length < 35) {
        throw new Error("Invalid API key format");
      }

      await this.saveApiKey(apiKey);
      return true;
    } catch (error) {
      console.error("Error setting API key:", error);
      return false;
    }
  }

  /**
   * Get current API key (masked for security)
   */
  public getApiKey(): string | null {
    return this.apiKey;
  }

  /**
   * Get masked API key for display
   */
  public getMaskedApiKey(): string | null {
    if (!this.apiKey) return null;

    const key = this.apiKey;
    if (key.length <= 8) return key;

    return (
      key.substring(0, 4) +
      "•".repeat(key.length - 8) +
      key.substring(key.length - 4)
    );
  }

  /**
   * Check if API key is configured
   */
  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /**
   * Check if Gemini AI is initialized and ready
   */
  public isReady(): boolean {
    return this.isInitialized && !!this.apiKey;
  }

  /**
   * Remove API key from storage
   */
  public async removeApiKey(): Promise<void> {
    try {
      // Try to remove from Electron secure storage first
      if (window.electronAPI && window.electronAPI.removeApiKey) {
        const result = await window.electronAPI.removeApiKey();
        if (result.success) {
          console.log("🗑️ API key removed from Electron secure storage");
        }
      }

      // Also remove from localStorage (for cleanup/backward compatibility)
      localStorage.removeItem(API_KEY_STORAGE_KEY);

      this.apiKey = null;
      this.isInitialized = false;
      console.log("🗑️ API key removed from all storage");
    } catch (error) {
      console.error("❌ Error removing API key:", error);
    }
  }

  /**
   * Get API key status for UI
   */
  public getStatus(): {
    hasKey: boolean;
    isReady: boolean;
    maskedKey: string | null;
  } {
    return {
      hasKey: this.hasApiKey(),
      isReady: this.isReady(),
      maskedKey: this.getMaskedApiKey(),
    };
  }
}

// Export singleton instance
export const apiKeyService = ApiKeyService.getInstance();
