import { LLMModel } from "../types";

/**
 * Fetches the latest trending text-generation models directly from Hugging Face API.
 * Docs: https://huggingface.co/docs/hub/api
 */
export const discoverModels = async (): Promise<Omit<LLMModel, 'id' | 'lastUpdated'>[]> => {
  try {
    // Fetch last 20 text-generation models, sorted by creation date (newest first)
    // We also ask for 'full=true' to get tags and other metadata
    const response = await fetch(
      "https://huggingface.co/api/models?sort=createdAt&direction=-1&limit=20&filter=text-generation&full=true"
    );

    if (!response.ok) {
      throw new Error(`HF API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data.map((model: any) => {
      const modelId = model.modelId; // e.g., "meta-llama/Llama-3.2-3B"
      const [provider, name] = modelId.split('/');
      const params = extractParams(modelId, model.tags);
      
      // Attempt to find description in multiple places
      // 1. Top-level 'description' field (if supported by specific API version/view)
      // 2. 'cardData.description' (metadata from README frontmatter)
      // 3. Fallback to pipeline info
      const desc = model.description || model.cardData?.description || `Auto-discovered model. Task: ${model.pipeline_tag || 'text-generation'}.`;

      return {
        name: name || modelId,
        provider: provider || 'Unknown',
        parameters: params,
        description: desc,
        likes: model.likes || 0,
        downloads: model.downloads || 0,
        tags: model.tags || [],
        license: extractLicense(model.tags),
        vramSize: estimateVRAM(params),
        releaseDate: (model.createdAt || new Date().toISOString()).split('T')[0] // Format YYYY-MM-DD
      };
    });

  } catch (error) {
    console.error("Failed to fetch from Hugging Face:", error);
    return [];
  }
};

/**
 * Extracts parameter count (e.g., "7B") from model ID or tags using regex.
 */
const extractParams = (name: string, tags: string[]): string => {
  // Regex to match patterns like 7b, 7.2B, 70b, 8x7b
  const paramRegex = /(\d+(?:\.\d+)?x?\d+(?:\.\d+)?)[bB]/i;
  
  // Check name first (usually more accurate for the specific model size)
  const nameMatch = name.match(paramRegex);
  if (nameMatch) return nameMatch[0].toUpperCase();

  // Check tags as fallback
  if (tags) {
    for (const tag of tags) {
        const tagMatch = tag.match(paramRegex);
        if (tagMatch) return tagMatch[0].toUpperCase();
    }
  }

  return "Unknown";
};

/**
 * Extracts license info from tags (e.g., "license:apache-2.0")
 */
const extractLicense = (tags: string[]): string => {
  if (!tags) return "other";
  const licenseTag = tags.find(t => t.startsWith('license:'));
  if (licenseTag) {
    return licenseTag.replace('license:', '');
  }
  return "other";
};

/**
 * Estimates VRAM requirements based on parameter count.
 * This is a rough heuristic for FP16 inference.
 */
const estimateVRAM = (params: string): string => {
  if (params === "Unknown") return "Unknown";
  
  // Handle Mixture of Experts (e.g., 8x7B)
  if (params.includes('X')) {
     // Simplified: just treat 8x7B (~47B active/total) as high VRAM
     return "High (>48GB)";
  }

  const num = parseFloat(params.replace('B', ''));
  if (isNaN(num)) return "Unknown";

  // Rough estimation: Params * 2 bytes (FP16) + 20% overhead for context/KV cache
  const estimatedGB = Math.ceil(num * 2 * 1.2);
  
  return `${estimatedGB}GB`;
};