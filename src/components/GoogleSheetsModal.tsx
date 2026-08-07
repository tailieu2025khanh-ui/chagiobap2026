import React, { useState } from 'react';
import { StoreConfig, MenuItem, Table, Order } from '../types/pos';
import {
  fetchMenuFromGoogleSheet,
  fetchTablesFromGoogleSheet,
  pushOrdersToGoogleSheet,
  getDemoSheetData,
  extractSheetId,
} from '../services/googleSheets';
import {
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Table as TableIcon,
  BookOpen,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeConfig: StoreConfig;
  setStoreConfig: React.Dispatch<React.SetStateAction<StoreConfig>>;
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  orders: Order[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  storeConfig,
  setStoreConfig,
  setMenuItems,
  setTables,
  orders,
}) => {
  const [sheetUrl, setSheetUrl] = useState(storeConfig.googleSheetIdOrUrl || '');
  const [appsScriptUrl, setAppsScriptUrl] = useState(storeConfig.googleAppsScriptUrl || '');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'sync' | 'instructions'>('sync');

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    setStoreConfig((prev) => ({
      ...prev,
      googleSheetIdOrUrl: sheetUrl,
      googleAppsScriptUrl: appsScriptUrl,
    }));
    setStatusMessage({ type: 'success', text: 'Đã lưu cấu hình kết nối Google Sheet!' });
  };

  const handleFetchMenu = async () => {
    if (!sheetUrl) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập Link/ID Google Sheet trước khi tải.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang kết nối và tải dữ liệu Thực đơn từ Google Sheet...' });

    try {
      const items = await fetchMenuFromGoogleSheet(sheetUrl, 'Menu');
      setMenuItems(items);
      const now = new Date().toLocaleTimeString('vi-VN');
      setStoreConfig((prev) => ({ ...prev, lastSyncedAt: now }));
      setStatusMessage({
        type: 'success',
        text: `Đồng bộ thành công ${items.length} món ăn/nước uống từ Google Sheet lúc ${now}!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi đồng bộ Menu từ Google Sheet' });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTables = async () => {
    if (!sheetUrl) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập Link/ID Google Sheet trước khi tải.' });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang kết nối và tải danh sách Bàn từ Google Sheet...' });

    try {
      const tablesList = await fetchTablesFromGoogleSheet(sheetUrl, 'Tables');
      setTables(tablesList);
      const now = new Date().toLocaleTimeString('vi-VN');
      setStoreConfig((prev) => ({ ...prev, lastSyncedAt: now }));
      setStatusMessage({
        type: 'success',
        text: `Đồng bộ thành công ${tablesList.length} bàn từ Google Sheet lúc ${now}!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi đồng bộ danh sách Bàn' });
    } finally {
      setLoading(false);
    }
  };

  const handlePushOrders = async () => {
    if (!appsScriptUrl) {
      setStatusMessage({
        type: 'error',
        text: 'Vui lòng nhập URL Google Apps Script Web App để đẩy đơn hàng.',
      });
      return;
    }

    setLoading(true);
    setStatusMessage({ type: 'info', text: 'Đang đẩy toàn bộ lịch sử đơn hàng lên Google Sheet...' });

    try {
      const result = await pushOrdersToGoogleSheet(appsScriptUrl, orders);
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Lỗi đẩy đơn hàng lên Google Sheet' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoData = () => {
    const demo = getDemoSheetData();
    setMenuItems(demo.menu);
    setTables(demo.tables);
    const now = new Date().toLocaleTimeString('vi-VN');
    setStoreConfig((prev) => ({
      ...prev,
      lastSyncedAt: now,
      storeName: 'CHA CHI BAP',
    }));
    setStatusMessage({
      type: 'success',
      text: `Đã nạp thành công 5 món đặc sản CHA CHI BAP & 5 sơ đồ bàn mẫu từ kết nối Google Sheet!`,
    });
  };

  const sheetId = extractSheetId(sheetUrl);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2C2C24] to-[#4A4A38] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-wide flex items-center gap-2">
                DATABASE GOOGLE SHEET (CHA CHI BAP)
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-black">
                  CONNECTED
                </span>
              </h2>
              <p className="text-xs text-[#D6D6C2] font-medium mt-0.5">
                Đồng bộ hai chiều dữ liệu Thực đơn, Sơ đồ bàn & Đơn hàng trực tiếp từ Google Sheet
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

        {/* Modal Tabs */}
        <div className="flex border-b border-[#E0E0D6] bg-[#FAF9F6]">
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'sync'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-white'
                : 'border-transparent text-[#808070] hover:text-[#1A1A1A]'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Kết Nối & Đồng Bộ Dữ Liệu</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 py-3 text-xs font-bold transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'instructions'
                ? 'border-[#5A5A40] text-[#5A5A40] bg-white'
                : 'border-transparent text-[#808070] hover:text-[#1A1A1A]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hướng Dẫn Cấu Trúc Sheet</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
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
              {statusMessage.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />}
              {statusMessage.type === 'info' && <RefreshCw className="w-4 h-4 shrink-0 text-blue-600 animate-spin mt-0.5" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'sync' ? (
            <>
              {/* Demo quick load CTA */}
              <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-amber-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                    Chạy Thử Dữ Liệu Google Sheet CHA CHI BAP
                  </h4>
                  <p className="text-[11px] text-[#555] font-medium mt-0.5">
                    Nạp nhanh thực đơn đặc sản Chả Giò Bắp & danh sách bàn mẫu để kiểm tra tính năng lập tức.
                  </p>
                </div>
                <button
                  onClick={handleLoadDemoData}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all shrink-0"
                >
                  Nạp Dữ Liệu Demo
                </button>
              </div>

              {/* Sheet URL input field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A]">
                  1. Link URL Hoặc Sheet ID Google Sheet (*):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/..."
                    className="flex-1 p-2.5 rounded-xl border border-[#E0E0D6] font-mono text-xs bg-[#FAF9F6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]"
                  />
                  <button
                    onClick={handleSaveConfig}
                    className="px-3 py-2 rounded-xl bg-[#5A5A40] text-white font-bold text-xs hover:bg-[#4A4A34]"
                  >
                    Lưu Link
                  </button>
                </div>
                {sheetId && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ID Google Sheet: {sheetId}</span>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-auto text-blue-600 underline flex items-center gap-1 font-medium"
                    >
                      Mở Google Sheet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Two-way Sync Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Action 1: Pull Menu */}
                <div className="p-4 rounded-2xl border border-[#E0E0D6] bg-white hover:border-[#5A5A40] transition-colors space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A]">
                    <BookOpen className="w-4 h-4 text-[#5A5A40]" />
                    <span>Tải Thực Đơn (Import Menu)</span>
                  </div>
                  <p className="text-[11px] text-[#808070]">
                    Đọc dữ liệu từ tab <b>'Menu'</b> trên Google Sheet và cập nhật danh sách món ăn vào POS.
                  </p>
                  <button
                    onClick={handleFetchMenu}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#F5F5F0] border border-[#E0E0D6] font-bold text-xs text-[#1A1A1A] flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đồng Bộ Thực Đơn</span>
                  </button>
                </div>

                {/* Action 2: Pull Tables */}
                <div className="p-4 rounded-2xl border border-[#E0E0D6] bg-white hover:border-[#5A5A40] transition-colors space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A]">
                    <TableIcon className="w-4 h-4 text-[#5A5A40]" />
                    <span>Tải Sơ Đồ Bàn (Import Tables)</span>
                  </div>
                  <p className="text-[11px] text-[#808070]">
                    Đọc dữ liệu từ tab <b>'Tables'</b> trên Google Sheet và cập nhật danh sách bàn.
                  </p>
                  <button
                    onClick={handleFetchTables}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#F5F5F0] border border-[#E0E0D6] font-bold text-xs text-[#1A1A1A] flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Đồng Bộ Sơ Đồ Bàn</span>
                  </button>
                </div>
              </div>

              {/* Push Orders section */}
              <div className="p-4 rounded-2xl border border-[#E0E0D6] bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A]">
                    <Upload className="w-4 h-4 text-purple-600" />
                    <span>Đẩy Đơn Hàng Sang Google Sheet (Export Orders)</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#808070]">
                    Tổng: {orders.length} đơn
                  </span>
                </div>
                <div>
                  <input
                    type="text"
                    value={appsScriptUrl}
                    onChange={(e) => setAppsScriptUrl(e.target.value)}
                    placeholder="URL Google Apps Script Web App (https://script.google.com/macros/s/.../exec)"
                    className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono text-xs bg-[#FAF9F6]"
                  />
                </div>
                <button
                  onClick={handlePushOrders}
                  disabled={loading || orders.length === 0}
                  className="w-full py-2 px-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Gửi {orders.length} Đơn Hàng Sang Google Sheet</span>
                </button>
              </div>

              {/* Last synced timestamp */}
              {storeConfig.lastSyncedAt && (
                <p className="text-center text-[11px] text-[#808070] font-medium">
                  Lần đồng bộ gần nhất: <span className="font-bold text-[#1A1A1A]">{storeConfig.lastSyncedAt}</span>
                </p>
              )}
            </>
          ) : (
            /* Instructions Tab */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E0E0D6] space-y-2">
                <h4 className="font-bold text-sm text-[#1A1A1A]">Bước 1: Quyền truy cập Google Sheet</h4>
                <p className="text-[#555] leading-relaxed">
                  Mở Google Sheet của bạn &rarr; Bấm <b>Chia sẻ (Share)</b> ở góc trên bên phải &rarr; Chọn{' '}
                  <b>"Bất kỳ ai có liên kết đều có thể xem"</b> (Anyone with the link can view).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E0E0D6] space-y-2">
                <h4 className="font-bold text-sm text-[#1A1A1A]">Bước 2: Cấu trúc Cột tab 'Menu'</h4>
                <p className="text-[#555]">Đặt tên các cột ở hàng đầu tiên (Row 1):</p>
                <div className="bg-[#2C2C24] text-[#D6D6C2] p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  sku | name | category | subcategory | price | image | description
                </div>
                <ul className="list-disc pl-4 text-[#555] space-y-1">
                  <li><b>category</b>: nhận giá trị <code className="bg-white px-1 border rounded">nuoc-uong</code>, <code className="bg-white px-1 border rounded">mon-an</code>, <code className="bg-white px-1 border rounded">combo</code></li>
                  <li><b>price</b>: giá số nguyên (ví dụ: <code className="bg-white px-1 border rounded">45000</code>)</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E0E0D6] space-y-2">
                <h4 className="font-bold text-sm text-[#1A1A1A]">Bước 3: Cấu trúc Cột tab 'Tables'</h4>
                <div className="bg-[#2C2C24] text-[#D6D6C2] p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                  name | zone | capacity
                </div>
                <ul className="list-disc pl-4 text-[#555] space-y-1">
                  <li><b>zone</b>: <code className="bg-white px-1 border rounded">Tầng 1</code>, <code className="bg-white px-1 border rounded">Sân Thượng</code>, <code className="bg-white px-1 border rounded">Phòng VIP</code>, <code className="bg-white px-1 border rounded">Mang Về</code></li>
                  <li><b>capacity</b>: sức chứa số bàn (ví dụ: <code className="bg-white px-1 border rounded">4</code>, <code className="bg-white px-1 border rounded">6</code>)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#FAF9F6] border-t border-[#E0E0D6] p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#5A5A40] text-white font-bold text-xs hover:bg-[#4A4A34]"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
