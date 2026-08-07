import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  CheckCircle,
  XCircle,
  X,
  RotateCcw,
  Sparkles,
  Award,
} from 'lucide-react';
import { StoreConfig } from '../types/pos';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Món ăn đặc sản thương hiệu CHA CHI BAP nổi tiếng nhất là gì?',
    options: [
      'Chả Giò Bắp Nóng Giòn',
      'Bánh Mì Thịt Bò',
      'Phở Bò Tái Nạm',
      'Cơm Tấm Sườn Bì',
    ],
    correctIndex: 0,
    explanation: 'Chả Giò Bắp Nóng Giòn là món đặc sản đại diện cho thương hiệu CHA CHI BAP!',
  },
  {
    id: 2,
    question: 'Đơn giá niêm yết của món "Chả Giò Bắp Nóng Giòn" là bao nhiêu?',
    options: ['35.000đ', '45.000đ', '55.000đ', '65.000đ'],
    correctIndex: 1,
    explanation: 'Chả Giò Bắp Nóng Giòn có giá 45.000đ.',
  },
  {
    id: 3,
    question: 'Quy trình xử lý đơn hàng chuẩn trên máy POS CHA CHI BAP bao gồm bước nào?',
    options: [
      'Nhập món -> In bill thu tiền -> Bỏ qua báo bếp',
      'Chọn bàn/món -> Gửi đơn sang Bếp (KDS) -> Khách ăn xong bấm Thanh Toán & In Bill',
      'Bấm Thanh toán trước khi chọn món',
      'Không cần chọn món',
    ],
    correctIndex: 1,
    explanation: 'Quy trình chuẩn: Chọn món/bàn -> Gửi Bếp -> Thanh toán & In Bill ESC/POS.',
  },
  {
    id: 4,
    question: 'Tùy chọn topping nào có giá 12.000đ trong nhóm Topping Thêm?',
    options: [
      'Trân Châu Đen (8k)',
      'Trân Châu Trắng 3Q (10k)',
      'Kem Cheese béo ngậy (12k)',
      'Thạch Trái Cây (8k)',
    ],
    correctIndex: 2,
    explanation: 'Kem Cheese béo ngậy có giá topping là 12.000đ.',
  },
  {
    id: 5,
    question: 'Tính năng kết nối Database nào vừa được bổ sung vào ứng dụng CHA CHI BAP?',
    options: [
      'Kết nối cơ sở dữ liệu Google Sheet',
      'Lưu bằng sổ tay',
      'Kết nối máy fax',
      'Không lưu dữ liệu',
    ],
    correctIndex: 0,
    explanation: 'Ứng dụng đã hỗ trợ đồng bộ hai chiều với Google Sheet Database!',
  },
];

interface StaffQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
}

export const StaffQuizModal: React.FC<StaffQuizModalProps> = ({
  isOpen,
  onClose,
  storeConfig,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const currentQ = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    if (idx === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOpt(null);
    setScore(0);
    setIsAnswered(false);
    setIsCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-amber-200">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                ĐÀO TẠO THU NGÂN {storeConfig.storeName}
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
                  QUIZ GAME
                </span>
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                Minigame kiểm tra kiến thức menu & quy trình bán hàng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isCompleted ? (
            <div className="space-y-5">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs font-bold text-[#808070]">
                <span>
                  Câu hỏi {currentIdx + 1}/{QUIZ_QUESTIONS.length}
                </span>
                <span className="text-amber-700">Điểm: {score * 20}/100</span>
              </div>
              <div className="w-full h-2 bg-[#E0E0D6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{
                    width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%`,
                  }}
                ></div>
              </div>

              {/* Question */}
              <h4 className="font-bold text-sm text-[#1A1A1A] leading-snug">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle =
                    'border-[#E0E0D6] bg-[#FAF9F6] text-[#1A1A1A] hover:bg-[#F5F5F0]';
                  if (isAnswered) {
                    if (idx === currentQ.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                    } else if (idx === selectedOpt) {
                      btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 font-bold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && idx === currentQ.correctIndex && (
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {isAnswered && idx === selectedOpt && idx !== currentQ.correctIndex && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {isAnswered && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3">
                  <p className="font-medium">{currentQ.explanation}</p>
                  <button
                    onClick={handleNextQuestion}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    {currentIdx + 1 < QUIZ_QUESTIONS.length ? 'Câu Tiếp Theo' : 'Xem Kết Quả'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Certificate & Final Score */
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-[#1A1A1A]">
                  HOÀN THÀNH BÀI KIỂM TRA!
                </h3>
                <p className="text-xs text-[#808070] mt-1">
                  Chứng chỉ Đào tạo Thu ngân POS - thương hiệu {storeConfig.storeName}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E0E0D6] inline-block w-full">
                <div className="text-3xl font-black text-amber-600">
                  {score * 20} / 100 ĐIỂM
                </div>
                <p className="text-xs font-bold text-[#1A1A1A] mt-1">
                  {score === QUIZ_QUESTIONS.length
                    ? '🎉 Xuất sắc! Bạn đã nắm vững 100% kiến thức quầy!'
                    : score >= 3
                    ? '👍 Đạt yêu cầu! Tiếp tục phát huy kiến thức thực đơn.'
                    : '⚡ Hãy ôn tập lại giá món & quy trình thu ngân nhé!'}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-2.5 rounded-xl border border-[#E0E0D6] font-bold text-xs hover:bg-[#FAF9F6] flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi Lại</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs"
                >
                  Hoàn Thành
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
