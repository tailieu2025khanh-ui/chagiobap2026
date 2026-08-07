import React, { useState } from 'react';
import {
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Cpu,
  RefreshCw,
} from 'lucide-react';
import {
  GEMINI_MODELS,
  getStoredApiKey,
  saveStoredApiKey,
  getStoredModel,
  saveStoredModel,
  generateContentWithFallback,
} from '../services/geminiService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (apiKey: string, model: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState(getStoredModel());
  const [testing, setTesting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập API Key để tiếp tục sử dụng ứng dụng.',
      });
      return;
    }

    setTesting(true);
    setStatusMessage({
      type: 'info',
      text: 'Đang kiểm tra kết nối với Google Gemini API...',
    });

    try {
      const res = await generateContentWithFallback('Xin chào Gemini!', apiKey.trim(), selectedModel);
      saveStoredApiKey(apiKey.trim());
      saveStoredModel(selectedModel);

      setStatusMessage({
        type: 'success',
        text: `Kết nối thành công! Đã lưu API Key với model: ${res.modelUsed}`,
      });

      if (onSaved) onSaved(apiKey.trim(), selectedModel);

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Lỗi kiểm tra API Key. Vui lòng kiểm tra lại Key Gemini.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2C2C24] via-[#4A4A38] to-[#2C2C24] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                THIẾT LẬP MODEL AI & API KEY
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-300" />
              </h3>
              <p className="text-xs text-[#D6D6C2] font-medium mt-0.5">
                Cấu hình API Key cá nhân để mở khóa toàn bộ tính năng Gemini AI
              </p>
            </div>
          </div>
          {getStoredApiKey() && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' && (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              )}
              {statusMessage.type === 'error' && (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              {statusMessage.type === 'info' && (
                <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Model Cards Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1A1A1A] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#5A5A40]" />
              Chọn Model AI Mặc Định:
            </label>
            <div className="space-y-2">
              {GEMINI_MODELS.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#5A5A40] bg-[#FAF9F6] ring-2 ring-[#5A5A40]/20'
                        : 'border-[#E0E0D6] bg-white hover:border-[#808070]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#1A1A1A]">
                          {m.name}
                        </span>
                        {m.isDefault && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#808070] mt-0.5 font-medium">
                        {m.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-[#5A5A40] bg-[#5A5A40] text-white'
                          : 'border-[#E0E0D6]'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#1A1A1A]">
                Nhập Gemini API Key (*):
              </label>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 underline"
              >
                Lấy API key để sử dụng app <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 rounded-2xl border border-[#E0E0D6] font-mono text-xs bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
              required
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E0E0D6]">
            {getStoredApiKey() && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0D6] text-xs font-bold text-[#808070] hover:bg-[#FAF9F6]"
              >
                Đóng
              </button>
            )}

            <button
              type="submit"
              disabled={testing}
              className="px-6 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Kiểm Tra...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>LƯU & XÁC NHẬN</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
