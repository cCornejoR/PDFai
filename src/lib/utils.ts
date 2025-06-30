// Utility functions for the application
import { GoogleGenerativeAI } from "@google/genai";

// Gemini AI instance (will be initialized with API key)
let genAI: GoogleGenerativeAI | null = null;

// Initialize Gemini AI with API key
export function initializeGeminiAI(apiKey: string): void {
  genAI = new GoogleGenerativeAI({ apiKey });
}

// Get Gemini AI instance
export function getGeminiAI(): GoogleGenerativeAI | null {
  return genAI;
}

// Gemini API utilities
export function validateGeminiApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }

  // Gemini API keys typically start with 'AIza' and are at least 35 characters long
  return apiKey.startsWith("AIza") && apiKey.length >= 35;
}

export async function testGeminiConnection(apiKey: string): Promise<void> {
  if (!validateGeminiApiKey(apiKey)) {
    throw new Error("Invalid API key format");
  }

  try {
    console.log("🔍 Testing Gemini API connection...");

    // Initialize Gemini AI with the provided API key
    const testGenAI = new GoogleGenerativeAI({ apiKey });
    const model = testGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Test the API key by making a simple request
    const result = await model.generateContent(
      'Hello, this is a test message. Please respond with "API connection successful".'
    );

    const response = await result.response;
    const text = response.text();

    console.log("✅ API test successful:", text);
  } catch (error) {
    console.error("❌ Error testing Gemini connection:", error);
    throw error;
  }
}

// Generate AI response with PDF context
export async function generateAIResponse(
  userMessage: string,
  pdfContext?: string
): Promise<string> {
  if (!genAI) {
    throw new Error(
      "Gemini AI not initialized. Please configure your API key."
    );
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = userMessage;

    if (pdfContext) {
      prompt = `Based on the following PDF content, please answer the user's question:

PDF Content:
${pdfContext}

User Question: ${userMessage}

Please provide a helpful and accurate response based on the PDF content. If the question cannot be answered from the PDF content, please let the user know.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    throw error;
  }
}

// General utility functions
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
