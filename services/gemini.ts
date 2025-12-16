import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LLMModel } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const modelSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    models: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          provider: { type: Type.STRING },
          parameters: { type: Type.STRING },
          description: { type: Type.STRING },
          likes: { type: Type.NUMBER },
          downloads: { type: Type.NUMBER },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          license: { type: Type.STRING, enum: ["apache-2.0", "mit", "llama3.2", "llama3.1", "other"] },
          vramSize: { type: Type.STRING, description: "Estimated VRAM required, e.g., '8GB', '16GB', '24GB', '48GB'" },
          releaseDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
        },
        required: ["name", "provider", "parameters", "description", "tags", "license", "vramSize", "releaseDate"],
      },
    },
  },
};

/**
 * Simulates the "Checker" component polling Hugging Face.
 * Instead of actually scraping, we ask Gemini to generate realistic
 * "discovered" trending models to populate our dashboard.
 */
export const discoverModels = async (): Promise<Omit<LLMModel, 'id' | 'lastUpdated'>[]> => {
  if (!apiKey) {
    console.warn("No API Key provided. Returning mock data fallback.");
    return fallbackModels;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a JSON list of 5 **newly launched** trending open-weight LLMs (released strictly in late 2024 or 2025) from providers like Meta, Mistral, Google, Qwen, DeepSeek, etc. **Do not include models released in 2023 or early 2024.** Focus on the absolute latest versions (e.g., Llama 3.2, Qwen 2.5, Gemma 2, Mistral Large 2). Include realistic stats like likes, downloads, license type, estimated VRAM for inference (e.g. 16GB), and recent release date (YYYY-MM-DD).",
      config: {
        responseMimeType: "application/json",
        responseSchema: modelSchema,
        systemInstruction: "You are a backend crawler service for Hugging Face. Return structured data about the newest available models only.",
      },
    });

    const text = response.text;
    if (!text) return fallbackModels;
    
    const parsed = JSON.parse(text);
    return parsed.models || fallbackModels;

  } catch (error) {
    console.error("Gemini discovery failed:", error);
    return fallbackModels;
  }
};

const fallbackModels: Omit<LLMModel, 'id' | 'lastUpdated'>[] = [
  {
    name: "Llama-3.2-3B-Instruct",
    provider: "meta-llama",
    parameters: "3B",
    description: "The official Meta Llama 3.2 3B Instruct model, optimized for edge devices.",
    likes: 25420,
    downloads: 890000,
    tags: ["text-generation", "pytorch", "llama-3.2", "edge"],
    license: "llama3.2",
    vramSize: "6GB",
    releaseDate: "2024-09-25"
  },
  {
    name: "Qwen2.5-72B-Instruct",
    provider: "Qwen",
    parameters: "72B",
    description: "Qwen2.5 is the latest series of Qwen large language models, significantly outperforming previous versions.",
    likes: 12500,
    downloads: 450000,
    tags: ["text-generation", "transformers", "qwen"],
    license: "apache-2.0",
    vramSize: "48GB",
    releaseDate: "2024-09-19"
  },
  {
    name: "Mistral-Large-Instruct-2407",
    provider: "mistralai",
    parameters: "123B",
    description: "Mistral Large 2 is a new flagship model significantly more capable than its predecessor.",
    likes: 9800,
    downloads: 210000,
    tags: ["text-generation", "transformers"],
    license: "other",
    vramSize: "80GB",
    releaseDate: "2024-07-24"
  }
];