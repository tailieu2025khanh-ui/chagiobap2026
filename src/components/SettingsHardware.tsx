import React, { useState } from 'react';
import { StoreConfig } from '../types/pos';
import {
  Settings,
  Printer,
  Wifi,
  QrCode,
  Store,
  CheckCircle2,
  RefreshCw,
  Save,
  Radio,
  FileSpreadsheet,
  Download,
  Upload,
} from 'lucide-react';

interface SettingsHardwareProps {
  storeConfig: StoreConfig;
  setStoreConfig: React.Dispatch<React.SetStateAction<StoreConfig>>;
  onResetData: () => void;
  onOpenGoogleSheetsModal?: () => void;
}

export const SettingsHardware: React.FC<SettingsHardwareProps> = ({
  storeConfig,
  setStoreConfig,
  onResetData,
  onOpenGoogleSheetsModal,
}) => {
  const [formData, setFormData] = useState<StoreConfig>({ ...storeConfig });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestPrint = () => {
    alert(`Đã gửi lệnh in thử nghiệm ESC/POS tới máy in ${formData.printerType.toUpperCase()} (${formData.printerIp}:${formData.printerPort})!`);
    window.print();
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-[#E0E0D6] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#5A5A40]" />
              CẤU HÌNH CỬA HÀNG & KẾT NỐI PHẦN CỨNG (HARDWARE SETUP)
            </h2>
            <p className="text-xs text-[#808070] mt-0.5 font-medium">
              Thiết lập thông tin cửa hàng, tài khoản thanh toán VietQR và cấu hình kết nối máy in bill ESC/POS (LAN/USB).
            </p>
          </div>

          {savedSuccess && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              Đã Lưu Thành Công!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Store Info */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2 border-b border-[#E0E0D6] pb-2">
              <Store className="w-4 h-4 text-[#5A5A40]" />
              1. THÔNG TIN THƯƠNG HIỆU CỬA HÀNG (IN TRÊN HÓA ĐƠN)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Tên Quán / Nhà Hàng (*):</label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Số Điện Thoại Hotline:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#1A1A1A] mb-1">Địa Chỉ Hiển Thị:</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Tên Wifi Khách:</label>
                <input
                  type="text"
                  value={formData.wifiName}
                  onChange={(e) => setFormData({ ...formData, wifiName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Mật Khẩu Wifi Khách:</label>
                <input
                  type="text"
                  value={formData.wifiPass}
                  onChange={(e) => setFormData({ ...formData, wifiPass: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: VietQR Config */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2 border-b border-[#E0E0D6] pb-2">
              <QrCode className="w-4 h-4 text-[#5A5A40]" />
              2. TÀI KHOẢN NGÂN HÀNG VIETQR (TỰ ĐỘNG PHÁT HÀNH MÃ)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Tên Ngân Hàng:</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="MBBank, Vietcombank, Techcombank..."
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Số Tài Khoản:</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Tên Chủ Tài Khoản:</label>
                <input
                  type="text"
                  value={formData.accountHolder}
                  onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold uppercase bg-[#FAF9F6]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Hardware ESC/POS Printer Setup */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0E0D6] pb-2">
              <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#5A5A40]" />
                3. CẤU HÌNH MÁY IN BILL NHIỆT (ESC/POS THERMAL PRINTER)
              </h3>

              <button
                type="button"
                onClick={handleTestPrint}
                className="px-3 py-1.5 rounded-xl bg-[#2C2C24] hover:bg-[#3E3E34] text-[#D6D6C2] font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>IN THỬ NGHIỆM</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Giao Thức Kết Nối:</label>
                <select
                  value={formData.printerType}
                  onChange={(e) =>
                    setFormData({ ...formData, printerType: e.target.value as any })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold bg-[#FAF9F6]"
                >
                  <option value="lan">Mạng LAN (TCP/IP IP Address)</option>
                  <option value="usb">Cổng USB / Trực Tiếp</option>
                  <option value="bluetooth">Bluetooth Không Dây</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Khổ Giấy Hóa Đơn:</label>
                <select
                  value={formData.paperSize}
                  onChange={(e) =>
                    setFormData({ ...formData, paperSize: e.target.value as any })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold bg-[#FAF9F6]"
                >
                  <option value="80mm">Khổ K80 (80mm - Phổ biến nhất)</option>
                  <option value="58mm">Khổ K58 (58mm - Máy in cầm tay)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Số Lượng Bill In Mỗi Lần (Số Bản):
                </label>
                <select
                  value={formData.printCopies || 1}
                  onChange={(e) =>
                    setFormData({ ...formData, printCopies: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6]"
                >
                  <option value={1}>1 Bill / lần (Chỉ in 1 bản gửi khách)</option>
                  <option value={2}>2 Bill / lần (1 bản gửi Khách - 1 bản Lưu quầy)</option>
                  <option value={3}>3 Bill / lần (1 bản Khách - 1 bản Quầy - 1 bản Giao nhận/Bếp)</option>
                </select>
              </div>

              {formData.printerType === 'lan' && (
                <>
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">Địa Chỉ IP Máy In LAN:</label>
                    <input
                      type="text"
                      value={formData.printerIp}
                      onChange={(e) => setFormData({ ...formData, printerIp: e.target.value })}
                      placeholder="192.168.1.200"
                      className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono font-bold bg-[#FAF9F6]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">Cổng Port ESC/POS:</label>
                    <input
                      type="number"
                      value={formData.printerPort}
                      onChange={(e) => setFormData({ ...formData, printerPort: Number(e.target.value) })}
                      placeholder="9100"
                      className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono font-bold bg-[#FAF9F6]"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex flex-wrap gap-6 text-xs font-bold border-t border-[#E0E0D6]">
              <label className="flex items-center gap-2 cursor-pointer text-[#1A1A1A]">
                <input
                  type="checkbox"
                  checked={formData.autoPrintReceipt}
                  onChange={(e) => setFormData({ ...formData, autoPrintReceipt: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5A5A40] focus:ring-[#5A5A40]"
                />
                <span>Tự động in bill khi bấm thanh toán đơn</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[#1A1A1A]">
                <input
                  type="checkbox"
                  checked={formData.printKitchenReceipt}
                  onChange={(e) => setFormData({ ...formData, printKitchenReceipt: e.target.checked })}
                  className="w-4 h-4 rounded text-[#5A5A40] focus:ring-[#5A5A40]"
                />
                <span>Tự động in phiếu báo bếp / bar</span>
              </label>
            </div>
          </div>

          {/* Section 4: Google Sheet Database Sync */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0E0D6] pb-2">
              <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                4. KẾT NỐI DATABASE GOOGLE SHEET (CHA CHI BAP ONLINE SYNC)
              </h3>

              {onOpenGoogleSheetsModal && (
                <button
                  type="button"
                  onClick={onOpenGoogleSheetsModal}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>MỞ TRÌNH ĐỒNG BỘ SHEET</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  Link / ID Google Sheet Thực Đơn & Sơ Đồ Bàn:
                </label>
                <input
                  type="text"
                  value={formData.googleSheetIdOrUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, googleSheetIdOrUrl: e.target.value })
                  }
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs..."
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono bg-[#FAF9F6]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">
                  URL Google Apps Script Web App (Đẩy Đơn Hàng):
                </label>
                <input
                  type="text"
                  value={formData.googleAppsScriptUrl || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, googleAppsScriptUrl: e.target.value })
                  }
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono bg-[#FAF9F6]"
                />
              </div>
            </div>

            {formData.lastSyncedAt && (
              <p className="text-xs text-[#808070] font-medium">
                Thời gian đồng bộ gần nhất: <span className="font-bold text-[#1A1A1A]">{formData.lastSyncedAt}</span>
              </p>
            )}
          </div>

          {/* Section 5: Backup & Sao Lưu Dữ Liệu POS */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2 border-b border-[#E0E0D6] pb-2">
              <Download className="w-4 h-4 text-blue-600" />
              5. SAO LƯU DỰ PHÒNG DỮ LIỆU CỬA HÀNG (JSON BACKUP)
            </h3>
            <p className="text-xs text-[#808070]">
              Tải file sao lưu cấu hình cửa hàng để dự phòng hoặc chuyển đổi sang máy POS khác.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const backupData = {
                    storeConfig: formData,
                    exportedAt: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Backup_${formData.storeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2 rounded-xl bg-[#FAF9F6] hover:bg-[#F5F5F0] border border-[#E0E0D6] font-bold text-xs text-[#1A1A1A] flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Tải File Backup (.json)</span>
              </button>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E0E0D6]">
            <button
              type="button"
              onClick={() => {
                if (confirm('Bạn có muốn đặt lại dữ liệu mẫu ứng dụng POS ban đầu?')) {
                  onResetData();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F6] hover:bg-[#F5F5F0] border border-[#E0E0D6] text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Khôi Phục Dữ Liệu Mẫu</span>
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>LƯU CẤU HÌNH THIẾT LẬP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
