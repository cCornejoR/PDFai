import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse, Content } from "@google/genai";
import type { ChatMessage, ProcessedPdf } from "../types.js";

// Función para obtener la API key desde localStorage o variables de entorno
const getApiKey = (): string => {
  // Priorizar localStorage sobre variables de entorno
  const storedKey = localStorage.getItem("gemini-api-key");
  if (storedKey) {
    return storedKey;
  }

  // Fallback a variables de entorno
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error(
    "No se encontró API key de Gemini. Configúrala en la aplicación o en las variables de entorno."
  );
};

async function urlToGenerativePart(url: string, mimeType: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  return {
    inlineData: {
      mimeType,
      data: base64,
    },
  };
}

export const chatWithPdfContextStream = async (
  allPdfs: ProcessedPdf[],
  conversationHistory: ChatMessage[]
): Promise<AsyncGenerator<GenerateContentResponse>> => {
  try {
    // Obtener la API key dinámicamente
    const apiKey = getApiKey();
    console.log("🔑 API key obtenida exitosamente");

    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-2.5-flash-preview-04-17";

    console.log(`📚 Procesando ${allPdfs.length} PDFs para contexto`);
    console.log(
      `💬 Historial de conversación: ${conversationHistory.length} mensajes`
    );

    const userQuery = conversationHistory[conversationHistory.length - 1].text;

    // Robustly find @mentions, handling spaces and special characters.
    const mentionedPdfNames: string[] = [];
    allPdfs.forEach(pdf => {
      if (userQuery.toLowerCase().includes(`@${pdf.name.toLowerCase()}`)) {
        mentionedPdfNames.push(pdf.name);
      }
    });

    let contextPdfs: ProcessedPdf[];
    if (mentionedPdfNames.length > 0) {
      // If there are mentions, use only the mentioned PDFs
      contextPdfs = allPdfs.filter(pdf => mentionedPdfNames.includes(pdf.name));
    } else {
      // If no mentions, use all available PDFs
      contextPdfs = allPdfs;
    }

    const systemInstruction = `Eres un asistente experto y analista de documentos. Tu tarea es responder a las preguntas del usuario basándote en el contenido de los documentos que se te proporcionarán.
- Cada documento vendrá página por página, con el texto extraído y una imagen de la página. Debes utilizar AMBAS fuentes (texto e imagen) para dar respuestas completas y precisas. Puedes analizar tablas, gráficos, diagramas, texto y la maquetación general.
- Si la respuesta no se encuentra en el contenido proporcionado, indícalo claramente.
- Si el usuario menciona un documento con "@" que no fue encontrado en el contexto, informa que no tienes acceso a ese archivo específico.
- Sé conciso y directo en tus respuestas.`;

    const contents: Content[] = [];

    // Build the multi-modal context
    for (const pdf of contextPdfs) {
      contents.push({
        role: "user",
        parts: [{ text: `--- INICIO DEL DOCUMENTO: ${pdf.name} ---` }],
      });
      for (const [index, page] of pdf.pages.entries()) {
        try {
          const imagePart = await urlToGenerativePart(
            page.imageUrl,
            "image/jpeg"
          );
          contents.push({
            role: "user",
            parts: [
              { text: `Página ${index + 1} - Texto: ${page.text}` },
              imagePart,
            ],
          });
        } catch (error) {
          console.error(
            `Error al procesar la imagen de la página ${index + 1} de ${
              pdf.name
            }:`,
            error
          );
          // If image fails, send text anyway
          contents.push({
            role: "user",
            parts: [
              {
                text: `Página ${
                  index + 1
                } - Texto (la imagen no pudo cargarse): ${page.text}`,
              },
            ],
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: `--- FIN DEL DOCUMENTO: ${pdf.name} ---` }],
      });
    }

    // Add the final user query
    contents.push({ role: "user", parts: [{ text: userQuery }] });

    console.log(
      `🤖 Enviando consulta a Gemini con ${contents.length} elementos de contexto`
    );

    const response = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    console.log("✅ Respuesta de Gemini iniciada exitosamente");
    return response;
  } catch (error) {
    console.error("❌ Error en chatWithPdfContextStream:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(
          "Error de API key: Verifica que tu API key de Gemini sea válida y esté configurada correctamente."
        );
      } else if (
        error.message.includes("quota") ||
        error.message.includes("limit")
      ) {
        throw new Error(
          "Límite de API alcanzado: Has excedido tu cuota de uso de la API de Gemini."
        );
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Error de conexión: Verifica tu conexión a internet e inténtalo de nuevo."
        );
      }
    }

    throw new Error(
      `Error al comunicarse con Gemini: ${error instanceof Error ? error.message : "Error desconocido"}`
    );
  }
};
