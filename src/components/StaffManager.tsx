import React, { useState } from 'react';
import { Order, StoreConfig } from '../types/pos';
import { Clock, Printer, Eye, X, Search, CheckCircle, ShoppingBag } from 'lucide-react';
import { ReceiptPrinterModal } from './ReceiptPrinterModal';

interface TodayOrdersModalProps {
  orders: Order[];
  storeConfig: StoreConfig;
  isOpen: boolean;
  onClose: () => void;
}

export const TodayOrdersModal: React.FC<TodayOrdersModalProps> = ({
  orders,
  storeConfig,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<Order | null>(null);
  const [selectedOrderToView, setSelectedOrderToView] = useState<Order | null>(null);

  if (!isOpen && !selectedOrderToPrint && !selectedOrderToView) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter orders created TODAY
  const todayOrders = (orders || []).filter((o) => {
    if (!o || !o.createdAt) return false;
    const orderDateStr = o.createdAt.split('T')[0];
    return orderDateStr === todayStr;
  });

  const filteredOrders = todayOrders.filter(
    (o) =>
      (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.tableName && o.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.items || []).some((i) => (i.menuItem?.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const todayTotalRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E0E0D6] animate-scaleUp">
            {/* Header */}
            <div className="p-5 border-b border-[#E0E0D6] bg-[#FAF9F6] rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1A1A1A]">
                    LỊCH SỬ HÓA ĐƠN BÁN HÀNG TRONG NGÀY ({new Date().toLocaleDateString('vi-VN')})
                  </h3>
                  <p className="text-xs text-[#808070] font-medium">
                    Tổng hôm nay: <span className="font-extrabold text-[#5A5A40]">{todayTotalRevenue.toLocaleString('vi-VN')} đ</span> ({todayOrders.length} hóa đơn)
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-[#808070] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 bg-white border-b border-[#E0E0D6] flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#808070]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã hóa đơn, tên bàn hoặc món ăn..."
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-[#E0E0D6] focus:outline-none focus:border-[#5A5A40] bg-[#FAF9F6]"
                />
              </div>
            </div>

            {/* Body List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-[#FAF9F6] p-4 rounded-xl border border-[#E0E0D6] hover:border-[#5A5A40] transition-all flex flex-wrap items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#1A1A1A]">{order.id}</span>
                      {order.tableName && (
                        <span className="bg-[#5A5A40] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {order.tableName}
                        </span>
                      )}
                      {order.paymentStatus === 'paid' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-700" />
                          Đã Thanh Toán
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Chưa Thanh Toán
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#808070] font-medium">
                      Giờ tạo: <span className="font-bold text-[#1A1A1A]">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span> | Thu ngân: <span className="font-bold">{order.cashierName || 'Thu Ngân'}</span>
                    </p>

                    <p className="text-xs text-[#5A5A40] font-bold">
                      {(order.items || []).map((i) => `${i.menuItem?.name || 'Món'} x${i.quantity}`).join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="block text-xs font-bold text-[#808070]">TỔNG THÀNH TIỀN</span>
                      <span className="text-base font-extrabold text-[#5A5A40]">
                        {(order.grandTotal || 0).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedOrderToView(order)}
                        className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1A1A1A] font-bold text-xs flex items-center gap-1 transition-all"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                        <span>Xem</span>
                      </button>

                      <button
                        onClick={() => setSelectedOrderToPrint(order)}
                        className="px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                        title="In lại hóa đơn"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>In Lại Bill</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-[#808070] font-medium">
                  <ShoppingBag className="w-10 h-10 mx-auto text-[#E0E0D6] mb-2" />
                  <p>Chưa có hóa đơn nào được tạo trong ngày hôm nay.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedOrderToView && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E0E0D6]">
            <div className="flex items-center justify-between border-b border-[#E0E0D6] pb-3">
              <h4 className="font-bold text-sm text-[#1A1A1A]">CHI TIẾT HÓA ĐƠN {selectedOrderToView.id}</h4>
              <button
                onClick={() => setSelectedOrderToView(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#FAF9F6] p-3 rounded-xl border border-[#E0E0D6]">
                <p><strong>Vị trí / Bàn:</strong> {selectedOrderToView.tableName || 'Mang về'}</p>
                <p><strong>Thời gian:</strong> {new Date(selectedOrderToView.createdAt).toLocaleString('vi-VN')}</p>
                <p><strong>Thu ngân:</strong> {selectedOrderToView.cashierName}</p>
                <p><strong>Hình thức TT:</strong> {selectedOrderToView.paymentMethod || 'Tiền mặt'}</p>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#E0E0D6] text-[#808070] font-bold">
                    <th className="py-1.5">Món</th>
                    <th className="py-1.5 text-center">SL</th>
                    <th className="py-1.5 text-right">T.Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0E0D6]">
                  {(selectedOrderToView.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 font-bold text-[#1A1A1A]">{item.menuItem?.name || 'Món ăn'}</td>
                      <td className="py-1.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-1.5 text-right font-bold">{(item.totalPrice || 0).toLocaleString('vi-VN')} đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-[#E0E0D6] pt-2 flex justify-between font-extrabold text-sm text-[#5A5A40]">
                <span>TỔNG THÀNH TIỀN:</span>
                <span>{(selectedOrderToView.grandTotal || 0).toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E0E0D6]">
              <button
                onClick={() => setSelectedOrderToView(null)}
                className="px-4 py-2 rounded-xl border border-[#E0E0D6] font-bold text-xs"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  if (selectedOrderToView) {
                    setSelectedOrderToPrint(selectedOrderToView);
                    setSelectedOrderToView(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#5A5A40] text-white font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Bill Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {selectedOrderToPrint && (
        <ReceiptPrinterModal
          order={selectedOrderToPrint}
          storeConfig={storeConfig}
          isOpen={!!selectedOrderToPrint}
          onClose={() => setSelectedOrderToPrint(null)}
        />
      )}
    </>
  );
};
