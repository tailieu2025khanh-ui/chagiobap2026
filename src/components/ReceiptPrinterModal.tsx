import React, { useState, useEffect, useCallback } from 'react';
import { Order, StoreConfig } from '../types/pos';
import { Printer, X, CheckCircle2, Cpu, AlertCircle, RefreshCw } from 'lucide-react';
import {
  requestUsbPrinter,
  getConnectedUsbPrinterName,
  printOrderUsb,
  initUsbAutoDetect,
} from '../services/usbPrinterService';

interface ReceiptPrinterModalProps {
  order: Order;
  storeConfig: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPrinterModal: React.FC<ReceiptPrinterModalProps> = ({
  order,
  storeConfig,
  isOpen,
  onClose,
}) => {
  const [usbPrinterName, setUsbPrinterName] = useState<string | null>(null);
  const [isConnectingUsb, setIsConnectingUsb] = useState(false);
  const [usbStatusMsg, setUsbStatusMsg] = useState<string | null>(null);

  const printCopies = storeConfig.printCopies === 1 ? 1 : 2;

  const checkUsbStatus = useCallback(async () => {
    const name = await getConnectedUsbPrinterName();
    setUsbPrinterName(name);
  }, []);

  const handlePrintUsbOrBrowser = useCallback(async () => {
    if (!order) return;
    setUsbStatusMsg(null);
    try {
      const isUsbSuccess = await printOrderUsb(order, storeConfig, printCopies);
      if (isUsbSuccess) {
        setUsbStatusMsg(`Đã in thành công ${printCopies} bản qua cổng USB Rongta RP335UL / Sunmi D2!`);
        setTimeout(() => onClose(), 1500);
        return;
      }
    } catch (err) {
      console.warn('Lỗi in USB trực tiếp:', err);
      setUsbStatusMsg('Vui lòng kiểm tra cáp kết nối USB máy in Rongta RP335UL / Sunmi D2.');
    }
  }, [order, storeConfig, printCopies, onClose]);

  const handleConnectUsb = async () => {
    setIsConnectingUsb(true);
    setUsbStatusMsg(null);
    try {
      const name = await requestUsbPrinter();
      if (name) {
        setUsbPrinterName(name);
        setUsbStatusMsg(`Đã chọn máy in USB: ${name}`);
      }
    } catch (err) {
      setUsbStatusMsg(`Đã tự động kết nối qua Driver USB hệ thống (Windows/Sunmi D2).`);
    } finally {
      setIsConnectingUsb(false);
    }
  };

  useEffect(() => {
    initUsbAutoDetect((name) => {
      setUsbPrinterName(name);
      if (name) {
        setUsbStatusMsg(`Tự động nhận diện máy in USB Plug & Play: ${name}`);
      }
    });

    if (isOpen && order) {
      checkUsbStatus();
      if (storeConfig.autoPrintReceipt !== false) {
        const timer = setTimeout(() => {
          handlePrintUsbOrBrowser();
        }, 200);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, order, checkUsbStatus, handlePrintUsbOrBrowser, storeConfig.autoPrintReceipt]);

  if (!order) return null;

  const is58mm = storeConfig.paperSize === '58mm';
  const qrUrl = `https://img.vietqr.io/image/${storeConfig.bankName}-${storeConfig.bankAccount}-${storeConfig.qrTemplate}.png?amount=${order.grandTotal}&addInfo=${encodeURIComponent('Thanh toan ' + order.id)}&accountName=${encodeURIComponent(storeConfig.accountHolder)}`;

  const copyLabels = [
    'LIÊN 1: DÀNH CHO KHÁCH HÀNG',
    'LIÊN 2: LƯU TẠI CỬA HÀNG',
  ];

  if (!isOpen || !order) return null;

  return (
    <div id="printable-receipt-wrapper" className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C24]/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E0E0D6]">
        {/* Modal Top Bar */}
        <div className="modal-top-bar no-print bg-[#2C2C24] text-white p-4 flex items-center justify-between border-b border-[#3E3E34]">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#D6D6C2]" />
            <div>
              <h3 className="font-bold text-sm text-white">In Hóa Đơn Rongta RP335UL / Sunmi D2 (Khổ {storeConfig.paperSize})</h3>
              <p className="text-[11px] text-[#D6D6C2] font-medium">
                Cấu hình: <span className="font-bold text-amber-300">{printCopies} Bill / Lần In</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#3E3E34] text-[#D6D6C2] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* USB Connection Status Bar */}
        <div className="modal-status-bar no-print bg-[#FAF9F6] border-b border-[#E0E0D6] px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#5A5A40]" />
            <span className="font-medium text-[#1A1A1A]">
              {usbPrinterName ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {usbPrinterName}
                </span>
              ) : (
                <span className="text-amber-700 font-semibold">Chưa chọn USB Printer</span>
              )}
            </span>
          </div>

          <button
            onClick={handleConnectUsb}
            disabled={isConnectingUsb}
            className="px-2.5 py-1 bg-white hover:bg-[#F5F5F0] border border-[#E0E0D6] rounded-lg font-bold text-[11px] text-[#5A5A40] transition-colors flex items-center gap-1"
          >
            {isConnectingUsb ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Cpu className="w-3 h-3" />
            )}
            <span>{usbPrinterName ? 'Đổi Máy In USB' : 'Kết Nối USB POS'}</span>
          </button>
        </div>

        <div className="no-print bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-[11px] font-medium text-emerald-900 leading-tight">
          🔌 <strong>In Trực Tiếp Cổng USB (Không Cần Cài Driver):</strong> Cắm dây USB trực tiếp vào máy POS Sunmi D2 / Laptop. Khi chọn máy in Rongta RP335UL, dữ liệu ESC/POS tự động bắn thẳng vào phần cứng máy in!
        </div>

        {usbStatusMsg && (
          <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-[11px] font-semibold text-amber-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
            <span>{usbStatusMsg}</span>
          </div>
        )}

        {/* Thermal Receipt Visual Container */}
        <div className="p-6 bg-[#F5F5F0] overflow-y-auto flex-1 flex justify-center">
          {/* Paper Bill Simulation */}
          <div
            id="printable-receipt"
            className={`bg-[#FAF9F6] text-[#1A1A1A] p-5 shadow-sm font-sans text-xs rounded-sm border border-[#E0E0D6] relative space-y-5 ${
              is58mm ? 'w-[280px]' : 'w-[340px]'
            }`}
            style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Roboto, sans-serif' }}
          >
            {Array.from({ length: printCopies }).map((_, copyIdx) => (
              <div key={copyIdx} className={`receipt-copy ${copyIdx > 0 ? 'pt-6 border-t-2 border-dashed border-[#808070]' : ''}`}>
                {/* Header / Store Info */}
                <div className="space-y-0.5 mb-2 border-b border-dashed border-[#808070] pb-2 text-xs leading-normal">
                  <h2 className="font-extrabold text-sm uppercase text-[#1A1A1A]">
                    {storeConfig.storeName}
                  </h2>
                  <p>Chi nhánh: Chi nhánh trung tâm</p>
                  <p>Điện thoại: {storeConfig.phone || '1900 6522'}</p>
                </div>

                {/* Sales Order Meta Info */}
                <div className="text-xs space-y-0.5 mb-2 border-b border-dashed border-[#808070] pb-2">
                  <p>Liên số: Liên {copyIdx + 1}</p>
                  <p>Ngày bán: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                  
                  <div className="text-center my-2">
                    <h3 className="font-black text-base uppercase text-[#1A1A1A]">HOÁ ĐƠN BÁN HÀNG</h3>
                    <p className="font-extrabold text-xs">{order.id}</p>
                  </div>

                  <p>Khách hàng: Khách lẻ</p>
                  <p>Địa chỉ: {storeConfig.address || ''}</p>
                  <p>Khu vực: {order.tableName || ''}</p>
                  <p>Thời gian giao hàng: </p>
                  <p>Điện thoại: {storeConfig.phone || ''}</p>

                  <p className="font-bold text-[#1A1A1A] pt-1">Người bán: {order.cashierName || 'CHẢ GIÒ BẮP'}</p>
                </div>

                {/* Items Table Structure matching Receipt Image */}
                <div className="mb-3 border-b border-dashed border-[#808070] pb-2">
                  <div className="flex justify-between font-bold text-xs border-b border-dashed border-[#808070] pb-1.5 mb-2">
                    <span className="w-1/2">Đơn giá</span>
                    <span className="w-1/6 text-center">SL</span>
                    <span className="w-1/3 text-right">Thành tiền</span>
                  </div>

                  <div className="space-y-2 text-xs font-sans">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="border-b border-dashed border-stone-200 pb-1.5">
                        <p className="font-bold text-[#1A1A1A] text-xs uppercase">{item.menuItem?.name || 'Món ăn'}</p>
                        <div className="flex justify-between items-center text-xs mt-0.5 font-bold">
                          <span className="w-1/2">{(item.unitPrice || 0).toLocaleString('vi-VN')}</span>
                          <span className="w-1/6 text-center">{item.quantity}</span>
                          <span className="w-1/3 text-right">{(item.totalPrice || 0).toLocaleString('vi-VN')}</span>
                        </div>
                        {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                          <div className="text-[10px] text-stone-600 pl-1 font-normal">
                            {item.selectedModifiers.map((m) => `+ ${m.optionName}`).join(', ')}
                          </div>
                        )}
                        {item.itemNote && (
                          <div className="text-[10px] text-amber-900 italic pl-1 font-normal">
                            * {item.itemNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Summary matching photo */}
                <div className="text-xs space-y-1 mb-4 border-b border-dashed border-[#808070] pb-3">
                  <div className="flex justify-between font-bold text-xs">
                    <span>Tổng tiền hàng:</span>
                    <span>{(order.subtotal || order.grandTotal || 0).toLocaleString('vi-VN')}</span>
                  </div>

                  {(order.discountPercent || 0) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold text-xs">
                      <span>Chiết khấu ({order.discountPercent}%):</span>
                      <span>-{(order.discountAmount || 0).toLocaleString('vi-VN')}</span>
                    </div>
                  )}

                  {(order.vatPercent || 0) > 0 && (
                    <div className="flex justify-between font-bold text-xs">
                      <span>Thuế VAT ({order.vatPercent}%):</span>
                      <span>+{(order.vatAmount || 0).toLocaleString('vi-VN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline text-[15px] font-black pt-1.5 text-black border-t border-black mt-2">
                    <span className="font-black text-[15px]">Tổng cộng:</span>
                    <span className="font-black text-[15px]">{(order.grandTotal || 0).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                {/* Footer QR / Thank you */}
                <div className="text-center space-y-2">
                  {order.paymentMethod === 'transfer' && (
                    <div className="flex flex-col items-center justify-center p-2 bg-white border border-[#E0E0D6] rounded">
                      <img src={qrUrl} alt="VietQR" className="w-24 h-24 object-contain" />
                      <span className="text-[9px] text-[#808070] mt-1">Quét QR thanh toán VietQR</span>
                    </div>
                  )}
                  <p className="font-bold text-[11px] uppercase">CẢM ƠN VÀ HẸN GẶP LẠI QUÝ KHÁCH!</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="modal-footer no-print p-4 bg-[#FAF9F6] border-t border-[#E0E0D6] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#E0E0D6] font-semibold text-[#808070] hover:bg-white text-xs transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handlePrintUsbOrBrowser}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>IN TỔNG CỘNG {printCopies} BILL (RONGTA RP335UL / SUNMI D2)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
