import React from 'react';
import { Shift, StoreConfig } from '../types/pos';
import {
  UtensilsCrossed,
  LayoutGrid,
  ChefHat,
  BarChart3,
  BookOpen,
  Clock,
  Settings,
  Wifi,
  Printer,
  ShoppingBag,
  FileSpreadsheet,
  Gamepad2,
  Key,
  Users,
  FileText,
} from 'lucide-react';

export type ViewTab = 'pos' | 'tables' | 'kds' | 'reports' | 'menu' | 'shift' | 'staff' | 'settings';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  shift: Shift;
  storeConfig: StoreConfig;
  kitchenPendingCount: number;
  onOpenTodayOrdersModal?: () => void;
  onOpenGoogleSheetsModal?: () => void;
  onOpenStaffQuizModal?: () => void;
  onOpenApiKeyModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  shift,
  storeConfig,
  kitchenPendingCount,
  onOpenGoogleSheetsModal,
  onOpenStaffQuizModal,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="bg-white text-[#1A1A1A] border-b border-[#E0E0D6] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5A5A40] text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base leading-tight text-[#1A1A1A] tracking-wide">
              {storeConfig.storeName}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-[#808070] font-medium">
              <span className="flex items-center gap-1">
                <Wifi className="w-3 h-3 text-emerald-600" />
                {storeConfig.wifiName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Printer className="w-3 h-3 text-[#5A5A40]" />
                ESC/POS ({storeConfig.paperSize})
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-2xl border border-[#E0E0D6]">
          <button
            onClick={() => setActiveTab('pos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pos'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Đặt Món (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tables'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Sơ Đồ Bàn</span>
          </button>

          <button
            onClick={() => setActiveTab('kds')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'kds'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Màn Hình Bếp</span>
            {kitchenPendingCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
                {kitchenPendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'reports'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Báo Cáo</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'menu'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Thực Đơn</span>
          </button>

          <button
            onClick={() => setActiveTab('shift')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'shift'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Ca Làm Việc</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'staff'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nhân Viên</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#5A5A40] text-white shadow-xs'
                : 'text-[#808070] hover:text-[#1A1A1A] hover:bg-[#E0E0D6]/50'
            }`}
            title="Cấu hình hệ thống"
          >
            <Settings className="w-4 h-4" />
          </button>
        </nav>

        {/* Right Info Chip */}
        <div className="flex items-center gap-2.5">
          {onOpenTodayOrdersModal && (
            <button
              onClick={onOpenTodayOrdersModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-2xs"
              title="Xem và in lại hóa đơn bán hàng trong ngày"
            >
              <FileText className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="hidden md:inline">Bill Hôm Nay</span>
            </button>
          )}
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-xl text-xs font-bold transition-all shadow-2xs group"
              title="Cấu hình API Key Gemini"
            >
              <Key className="w-4 h-4 text-rose-600 group-hover:rotate-12 transition-transform shrink-0" />
              <div className="text-left leading-tight hidden md:block">
                <div className="text-[11px] font-extrabold text-rose-950">Settings (API Key)</div>
                <div className="text-[9px] text-rose-600 font-bold underline">Lấy API key để sử dụng app</div>
              </div>
            </button>
          )}

          {onOpenGoogleSheetsModal && (
            <button
              onClick={onOpenGoogleSheetsModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
              title="Quản lý database Google Sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Database Sheet</span>
            </button>
          )}

          {onOpenStaffQuizModal && (
            <button
              onClick={onOpenStaffQuizModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
              title="Minigame kiểm tra kiến thức thu ngân"
            >
              <Gamepad2 className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Đào Tạo Quiz</span>
            </button>
          )}

          <div
            onClick={() => setActiveTab('shift')}
            className="cursor-pointer bg-[#FAF9F6] hover:bg-[#F5F5F0] border border-[#E0E0D6] rounded-xl px-3 py-1.5 text-right transition-colors"
          >
            <p className="text-[10px] text-[#808070] font-medium leading-none">
              Ca: <span className="text-[#1A1A1A] font-bold">{shift.cashierName.split(' ')[0]}</span>
            </p>
            <p className="text-xs font-extrabold text-[#5A5A40] leading-tight mt-0.5">
              {shift.totalRevenue.toLocaleString('vi-VN')}đ ({shift.totalOrders} đơn)
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar below header */}
      <div className="md:hidden flex items-center justify-around bg-[#FAF9F6] border-t border-[#E0E0D6] p-1 text-xs">
        <button
          onClick={() => setActiveTab('pos')}
          className={`p-2 flex flex-col items-center text-[10px] ${
            activeTab === 'pos' ? 'text-[#5A5A40] font-bold' : 'text-[#808070]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Đặt món</span>
        </button>
        <button
          onClick={() => setActiveTab('tables')}
          className={`p-2 flex flex-col items-center text-[10px] ${
            activeTab === 'tables' ? 'text-[#5A5A40] font-bold' : 'text-[#808070]'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Sơ đồ bàn</span>
        </button>
        <button
          onClick={() => setActiveTab('kds')}
          className={`p-2 flex flex-col items-center text-[10px] relative ${
            activeTab === 'kds' ? 'text-[#5A5A40] font-bold' : 'text-[#808070]'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>Màn bếp</span>
          {kitchenPendingCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`p-2 flex flex-col items-center text-[10px] ${
            activeTab === 'reports' ? 'text-[#5A5A40] font-bold' : 'text-[#808070]'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Báo cáo</span>
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`p-2 flex flex-col items-center text-[10px] ${
            activeTab === 'menu' ? 'text-[#5A5A40] font-bold' : 'text-[#808070]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Thực đơn</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`p-2 flex flex-col items-center text-[10px] ${
            activeTab === 'settings' ? 'text-[#5A5A40] font-bold' : 'text-[#808070]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Cài đặt</span>
        </button>
      </div>
    </header>
  );
};
