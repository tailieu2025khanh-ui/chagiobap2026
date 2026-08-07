import { GoogleGenAI } from '@google/genai';

export const GEMINI_MODELS = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash (Preview)',
    description: 'Nhanh, tối ưu và phản hồi nhanh chóng (Mặc định)',
    isDefault: true,
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro (Preview)',
    description: 'Khả năng tư duy nâng cao cho các tác vụ phức tạp',
    isDefault: false,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Phiên bản ổn định và tốc độ cao',
    isDefault: false,
  },
];

const LOCAL_STORAGE_KEY = 'cha_chi_bap_gemini_api_key';
const LOCAL_STORAGE_MODEL_KEY = 'cha_chi_bap_gemini_selected_model';

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
}

export function saveStoredApiKey(apiKey: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey.trim());
  } catch (e) {
    console.error(e);
  }
}

export function getStoredModel(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_MODEL_KEY) || 'gemini-3-flash-preview';
  } catch (e) {
    return 'gemini-3-flash-preview';
  }
}

export function saveStoredModel(modelId: string): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_MODEL_KEY, modelId);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Executes a Gemini prompt with automatic model fallback & retry
 */
export async function generateContentWithFallback(
  prompt: string,
  apiKey: string,
  preferredModel: string = 'gemini-3-flash-preview'
): Promise<{ text: string; modelUsed: string }> {
  if (!apiKey) {
    throw new Error('Chưa nhập Google Gemini API Key. Vui lòng nhập API Key để tiếp tục.');
  }

  // Create model order list starting with preferredModel
  const modelOrder = [
    preferredModel,
    ...GEMINI_MODELS.map((m) => m.id).filter((id) => id !== preferredModel),
  ];

  let lastError: any = null;

  for (const modelId of modelOrder) {
    try {
      console.log(`Đang thử gọi Gemini API với model: ${modelId}...`);
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
      });

      if (response && response.text) {
        return { text: response.text, modelUsed: modelId };
      }
    } catch (err: any) {
      console.warn(`Lỗi khi gọi model ${modelId}:`, err);
      lastError = err;
      // Continue to next model in fallback sequence
    }
  }

  const errorMsg = lastError?.message || lastError?.toString() || 'Unknown Error';
  throw new Error(`Đã dừng do lỗi: Tất cả các model AI đều thất bại (${errorMsg})`);
}
