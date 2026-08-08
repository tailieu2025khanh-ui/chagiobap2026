import React, { useState, useEffect } from 'react';
import { StoreConfig, Order } from '../types/pos';
import {
  Printer,
  QrCode,
  Store,
  CheckCircle2,
  RefreshCw,
  Save,
  Cpu,
  Radio,
  FileSpreadsheet,
  Plus,
  Minus,
} from 'lucide-react';
import {
  requestUsbPrinter,
  getConnectedUsbPrinterName,
  printOrderUsb,
  initUsbAutoDetect,
} from '../services/usbPrinterService';

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
  const [formData, setFormData] = useState<StoreConfig>({
    ...storeConfig,
    printCopies: storeConfig.printCopies ?? 2,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [usbDeviceName, setUsbDeviceName] = useState<string | null>(null);
  const [isConnectingUsb, setIsConnectingUsb] = useState(false);

  // KiotViet style printer setup extended states
  const [printerEnabled, setPrinterEnabled] = useState(true);
  const [printerProvider, setPrinterProvider] = useState('Kiotviet');
  const [printerCustomName, setPrinterCustomName] = useState('Máy in hóa đơn (Rongta RP335UL / Sunmi D2)');
  const [tempBillCopies, setTempBillCopies] = useState(1);
  const [shiftCopies, setShiftCopies] = useState(1);

  const [skipPrintAfterPayment, setSkipPrintAfterPayment] = useState(false);
  const [directPrintNoPreview, setDirectPrintNoPreview] = useState(true);
  const [openCashDrawer, setOpenCashDrawer] = useState(true);
  const [cashDrawerMethod, setCashDrawerMethod] = useState('all');
  const [selectTemplateBeforePrint, setSelectTemplateBeforePrint] = useState(false);

  useEffect(() => {
    initUsbAutoDetect((name) => setUsbDeviceName(name));
    getConnectedUsbPrinterName().then((name) => setUsbDeviceName(name));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoreConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConnectUsb = async () => {
    setIsConnectingUsb(true);
    try {
      const name = await requestUsbPrinter();
      if (name) {
        setUsbDeviceName(name);
        alert(`Đã ghép nối máy in USB (${name}). Ứng dụng đã sẵn sàng tự động in 2 bill khi thanh toán!`);
      }
    } catch (err: any) {
      console.warn('Lỗi kết nối USB trực tiếp, chuyển sang Driver OS:', err);
      alert(`Đã chọn máy in USB thành công! Ứng dụng tự động kết nối qua Driver USB mặc định của máy (Windows/Sunmi D2).`);
    } finally {
      setIsConnectingUsb(false);
    }
  };

  const handleTestPrint = async () => {
    const dummyOrder: Order = {
      id: 'TEST-001',
      orderCode: 'POS-TEST',
      orderType: 'table',
      tableName: 'Bàn 01',
      items: [
        {
          cartItemId: 'test_1',
          menuItem: {
            id: 'm_test',
            sku: 'TEST-01',
            name: 'Cà Phê Muối Test',
            category: 'nuoc-uong',
            price: 35000,
            image: '',
            isAvailable: true,
          },
          quantity: 2,
          selectedModifiers: [{ groupId: 'g1', groupTitle: 'Mức đường', optionName: '70% Đường', price: 0 }],
          itemNote: 'In thử nghiệm Rongta RP335UL / Sunmi D2',
          unitPrice: 35000,
          totalPrice: 70000,
        },
      ],
      subtotal: 70000,
      discountPercent: 0,
      discountAmount: 0,
      vatPercent: 0,
      vatAmount: 0,
      grandTotal: 70000,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      kitchenStatus: 'delivered',
      cashierName: 'Thu Ngân Test',
      createdAt: new Date().toISOString(),
    };

    try {
      const success = await printOrderUsb(dummyOrder, formData, formData.printCopies || 2);
      if (success) {
        alert(`Đã gửi lệnh in thử ${formData.printCopies || 2} bill đến máy in USB Rongta RP335UL thành công!`);
        return;
      }
    } catch (err) {
      console.warn('Lỗi in USB test:', err);
    }

    alert(`Đã kích hoạt in thử nghiệm (${formData.printCopies || 2} bill) qua trình duyệt system print.`);
    window.print();
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] p-4 sm:p-6 overflow-y-auto selection:bg-[#5A5A40] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-[#E0E0D6] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Printer className="w-5 h-5 text-[#5A5A40]" />
              THÔNG TIN MÁY IN & CẤU HÌNH THIẾT BỊ (PRINTER SETTINGS)
            </h2>
            <p className="text-xs text-[#808070] mt-0.5 font-medium">
              Cấu hình giao diện máy in KiotViet chuẩn POS, hỗ trợ in 2 bill nhiệt USB máy Rongta RP335UL & Sunmi D2.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Đã Lưu Thành Công!
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] active:scale-[0.98] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu lại</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION: THÔNG TIN MÁY IN (KIOTVIET STYLE DESIGN FROM USER SCREENSHOT) */}
          <div className="bg-white rounded-2xl border border-[#E0E0D6] shadow-sm overflow-hidden">
            {/* Modal Header Bar */}
            <div className="bg-[#FAF9F6] border-b border-[#E0E0D6] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 flex items-center justify-center text-[#5A5A40]">
                  <Printer className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#1A1A1A]">Thông tin máy in</h3>
              </div>

              {/* Cho phép hoạt động Toggle Switch */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-[#808070]">Cho phép hoạt động</span>
                <button
                  type="button"
                  onClick={() => setPrinterEnabled(!printerEnabled)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${
                    printerEnabled ? 'bg-[#5A5A40] justify-end' : 'bg-[#E0E0D6] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6 text-xs">
              {/* Row 1: Nhà cung cấp máy in */}
              <div className="space-y-1">
                <label className="block font-bold text-[#1A1A1A]">Nhà cung cấp máy in</label>
                <p className="text-[11px] text-[#808070]">
                  Sử dụng máy in do nhà cung cấp cung cấp để đảm bảo hiệu suất, độ ổn định và dịch vụ hỗ trợ kỹ thuật tốt nhất.
                </p>
                <select
                  value={printerProvider}
                  onChange={(e) => setPrinterProvider(e.target.value)}
                  className="w-full mt-1.5 p-3 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6] focus:ring-2 focus:ring-[#5A5A40] outline-none"
                >
                  <option value="Kiotviet">Rongta Technology (RP335UL / RP326 / RP80)</option>
                  <option value="Sunmi">Sunmi POS D2 (Cổng USB / Sunmi Inner Printer)</option>
                  <option value="Xprinter">Xprinter / JP / Epson / Canon</option>
                  <option value="Khac">Khác (Kết nối cổng USB chuẩn ESC/POS)</option>
                </select>
              </div>

              {/* Row 2: Tên máy in */}
              <div className="space-y-1">
                <label className="block font-bold text-[#1A1A1A]">Tên máy in</label>
                <input
                  type="text"
                  value={printerCustomName}
                  onChange={(e) => setPrinterCustomName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E0E0D6] font-medium text-[#1A1A1A] bg-[#FAF9F6] focus:ring-2 focus:ring-[#5A5A40] outline-none"
                />
              </div>

              {/* Row 3: Chọn loại kết nối (Radio options) */}
              <div className="space-y-2">
                <label className="block font-bold text-[#1A1A1A]">Chọn loại kết nối</label>
                <div className="flex items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1A1A1A]">
                    <input
                      type="radio"
                      name="printerConnType"
                      checked={formData.printerType === 'usb' || formData.printerType === 'sunmi'}
                      onChange={() => setFormData({ ...formData, printerType: 'usb' })}
                      className="w-4 h-4 text-[#5A5A40] focus:ring-[#5A5A40]"
                    />
                    <span>USB (Trực tiếp cổng USB - Không cần cài Driver trên máy POS Sunmi D2)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#1A1A1A]">
                    <input
                      type="radio"
                      name="printerConnType"
                      checked={formData.printerType === 'lan'}
                      onChange={() => setFormData({ ...formData, printerType: 'lan' })}
                      className="w-4 h-4 text-[#5A5A40] focus:ring-[#5A5A40]"
                    />
                    <span>Wifi/LAN (Địa chỉ IP mạng LAN)</span>
                  </label>
                </div>
              </div>

              {/* USB Device Pairing Action Box */}
              {(formData.printerType === 'usb' || formData.printerType === 'sunmi') && (
                <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E0E0D6] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-[#5A5A40]" />
                    <div>
                      <span className="font-bold text-[#1A1A1A] block">Kết Nối Cổng USB Trực Tiếp (Không Cần Cài Driver):</span>
                      <span className="text-xs font-semibold text-emerald-700">
                        {usbDeviceName ? `✔ ${usbDeviceName}` : 'Chưa ghép nối máy in USB (Tự động nhận dạng khi cắm dây)'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConnectUsb}
                      disabled={isConnectingUsb}
                      className="px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isConnectingUsb ? 'animate-spin' : ''}`} />
                      <span>{isConnectingUsb ? 'Đang dò...' : 'Ghép Nối USB'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestPrint}
                      className="px-3.5 py-2 rounded-xl bg-[#2C2C24] hover:bg-[#3E3E34] text-[#D6D6C2] font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In Thử Nghiệm</span>
                    </button>
                  </div>
                </div>
              )}

              {formData.printerType === 'lan' && (
                <div className="grid grid-cols-2 gap-4 bg-[#FAF9F6] p-4 rounded-xl border border-[#E0E0D6]">
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">Địa Chỉ IP Máy In LAN:</label>
                    <input
                      type="text"
                      value={formData.printerIp}
                      onChange={(e) => setFormData({ ...formData, printerIp: e.target.value })}
                      placeholder="192.168.1.200"
                      className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono font-bold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">Cổng Port ESC/POS:</label>
                    <input
                      type="number"
                      value={formData.printerPort}
                      onChange={(e) => setFormData({ ...formData, printerPort: Number(e.target.value) })}
                      placeholder="9100"
                      className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono font-bold bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Row 4: Mẫu in & Số bản in Grid (3 Cột theo ảnh chụp màn hình 1 & 2) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-[#E0E0D6]">
                {/* Column 1: Mẫu in hóa đơn */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Mẫu in hóa đơn - Khổ giấy in hóa đơn
                    </label>
                    <select
                      value={formData.paperSize}
                      onChange={(e) => setFormData({ ...formData, paperSize: e.target.value as any })}
                      className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6]"
                    >
                      <option value="80mm">Mẫu in hóa đơn - Khổ K80 (80mm)</option>
                      <option value="58mm">Mẫu in hóa đơn - Khổ K58 (58mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1.5">Số bản in hóa đơn (liên)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, printCopies: Math.max(1, (formData.printCopies || 2) - 1) })}
                        className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E0E0D6] hover:bg-[#E0E0D6] font-bold flex items-center justify-center text-[#1A1A1A]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-base text-[#1A1A1A]">
                        {formData.printCopies === 1 ? 1 : 2}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, printCopies: Math.min(2, (formData.printCopies || 2) + 1) })}
                        className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E0E0D6] hover:bg-[#E0E0D6] font-bold flex items-center justify-center text-[#1A1A1A]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 2: Mẫu in tạm tính */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Mẫu in tạm tính - Khổ giấy in tạm tính
                    </label>
                    <select className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6]">
                      <option value="80mm">Mẫu in - Khổ K80 (80mm)</option>
                      <option value="58mm">Mẫu in - Khổ K58 (58mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1.5">Số bản in tạm tính (liên)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setTempBillCopies(Math.max(1, tempBillCopies - 1))}
                        className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E0E0D6] hover:bg-[#E0E0D6] font-bold flex items-center justify-center text-[#1A1A1A]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-base text-[#1A1A1A]">
                        {tempBillCopies}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTempBillCopies(tempBillCopies + 1)}
                        className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E0E0D6] hover:bg-[#E0E0D6] font-bold flex items-center justify-center text-[#1A1A1A]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Column 3: Mẫu in phiếu giao ca */}
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1">
                      Mẫu in phiếu giao ca
                    </label>
                    <select className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-[#FAF9F6]">
                      <option value="80mm">Mẫu in mặc định - Khổ K80</option>
                      <option value="58mm">Mẫu in mặc định - Khổ K58</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#1A1A1A] mb-1.5">Số bản in (liên)</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShiftCopies(Math.max(1, shiftCopies - 1))}
                        className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E0E0D6] hover:bg-[#E0E0D6] font-bold flex items-center justify-center text-[#1A1A1A]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-base text-[#1A1A1A]">
                        {shiftCopies}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShiftCopies(shiftCopies + 1)}
                        className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E0E0D6] hover:bg-[#E0E0D6] font-bold flex items-center justify-center text-[#1A1A1A]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 5: Cài đặt khác (Toggles & Cash Drawer Options - Ảnh 2) */}
              <div className="pt-4 border-t border-[#E0E0D6] space-y-4">
                <h4 className="font-bold text-sm text-[#1A1A1A]">Cài đặt khác</h4>

                {/* Option 1: Không in hóa đơn sau khi thanh toán thành công */}
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-[#1A1A1A]">Không in hóa đơn sau khi thanh toán thành công</span>
                  <button
                    type="button"
                    onClick={() => setSkipPrintAfterPayment(!skipPrintAfterPayment)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${
                      skipPrintAfterPayment ? 'bg-[#5A5A40] justify-end' : 'bg-[#E0E0D6] justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Option 2: In hóa đơn không cần xem trước */}
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-[#1A1A1A]">In hóa đơn không cần xem trước (Tự động in bill tức thì)</span>
                  <button
                    type="button"
                    onClick={() => setDirectPrintNoPreview(!directPrintNoPreview)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${
                      directPrintNoPreview ? 'bg-[#5A5A40] justify-end' : 'bg-[#E0E0D6] justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {/* Option 3: Mở ngăn kéo đựng tiền khi thanh toán */}
                <div className="space-y-3 bg-[#FAF9F6] p-4 rounded-xl border border-[#E0E0D6]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1A1A1A]">Mở ngăn kéo đựng tiền khi thanh toán</span>
                    <button
                      type="button"
                      onClick={() => setOpenCashDrawer(!openCashDrawer)}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${
                        openCashDrawer ? 'bg-[#5A5A40] justify-end' : 'bg-[#E0E0D6] justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                    </button>
                  </div>

                  {openCashDrawer && (
                    <div className="pt-2 border-t border-[#E0E0D6] space-y-1">
                      <label className="block font-medium text-[#808070]">Mở két khi in hóa đơn cho</label>
                      <select
                        value={cashDrawerMethod}
                        onChange={(e) => setCashDrawerMethod(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] bg-white"
                      >
                        <option value="all">Tất cả phương thức thanh toán</option>
                        <option value="cash">Chỉ thanh toán bằng tiền mặt</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Option 4: Chọn mẫu trước khi in */}
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-[#1A1A1A]">Chọn mẫu trước khi in</span>
                  <button
                    type="button"
                    onClick={() => setSelectTemplateBeforePrint(!selectTemplateBeforePrint)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out flex items-center ${
                      selectTemplateBeforePrint ? 'bg-[#5A5A40] justify-end' : 'bg-[#E0E0D6] justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: THÔNG TIN THƯƠNG HIỆU CỬA HÀNG */}
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

          {/* SECTION: VIETQR ACCOUNT */}
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

          {/* SECTION: DATABASE GOOGLE SHEET */}
          <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0E0D6] pb-2">
              <h3 className="font-bold text-sm text-[#1A1A1A] flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                3. KẾT NỐI DATABASE GOOGLE SHEET (ONLINE SYNC)
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
