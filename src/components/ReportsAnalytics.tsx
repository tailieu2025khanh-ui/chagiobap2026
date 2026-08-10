import React, { useState } from 'react';
import { Order, MenuItem } from '../types/pos';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  PieChart as PieIcon,
  Calendar,
  Coffee,
  Utensils,
  Award,
  FileText,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { exportSalesReportDocx } from '../services/docxReportService';
import { DEFAULT_STORE_CONFIG, INITIAL_SHIFT } from '../data/initialData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ReportsAnalyticsProps {
  orders: Order[];
  menuItems: MenuItem[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({
  orders,
  menuItems,
  setOrders,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);
  const currentYearStr = todayStr.substring(0, 4);

  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'year'>('today');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);

  // Filter orders based on active time range & date pickers
  const filteredOrders = orders.filter((o) => {
    if (o.paymentStatus !== 'paid') return false;
    const orderDateStr = o.createdAt.split('T')[0];
    const orderMonthStr = o.createdAt.substring(0, 7);
    const orderYearStr = o.createdAt.substring(0, 4);

    if (timeRange === 'today') {
      return orderDateStr === selectedDate;
    }
    if (timeRange === '7days') {
      const diffDays = (new Date(selectedDate).getTime() - new Date(orderDateStr).getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays < 7;
    }
    if (timeRange === 'month') {
      return orderMonthStr === selectedMonth;
    }
    if (timeRange === 'year') {
      return orderYearStr === selectedYear;
    }
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalOrdersCount = filteredOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  let foodRevenue = 0;
  let foodVolume = 0;
  let drinkRevenue = 0;
  let drinkVolume = 0;

  const itemSalesMap: Record<string, { id: string; name: string; category: string; volume: number; revenue: number }> = {};

  filteredOrders.forEach((o) => {
    o.items.forEach((item) => {
      const cat = item.menuItem?.category || 'mon-an';
      if (cat === 'mon-an') {
        foodRevenue += item.totalPrice;
        foodVolume += item.quantity;
      } else if (cat === 'nuoc-uong') {
        drinkRevenue += item.totalPrice;
        drinkVolume += item.quantity;
      }

      const itemId = item.menuItem?.id || item.cartItemId;
      const itemName = item.menuItem?.name || 'Món ăn';
      if (!itemSalesMap[itemId]) {
        itemSalesMap[itemId] = {
          id: itemId,
          name: itemName,
          category: cat === 'mon-an' ? 'Món Ăn' : cat === 'nuoc-uong' ? 'Đồ Uống' : 'Combo',
          volume: 0,
          revenue: 0,
        };
      }
      itemSalesMap[itemId].volume += item.quantity;
      itemSalesMap[itemId].revenue += item.totalPrice;
    });
  });

  const allSellingItems = Object.values(itemSalesMap).sort((a, b) => b.volume - a.volume);
  const topSellingItems = allSellingItems.slice(0, 10);

  const pieData = [
    { name: 'Đồ Uống', value: drinkRevenue || 0.1 },
    { name: 'Món Ăn', value: foodRevenue || 0.1 },
  ];
  const COLORS = ['#5A5A40', '#808070'];

  // Dynamic Chart Data based on timeRange
  const chartDataMap: Record<string, number> = {};
  if (timeRange === 'today') {
    ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'].forEach((t) => (chartDataMap[t] = 0));
    filteredOrders.forEach((o) => {
      const hour = new Date(o.createdAt).getHours();
      const slot = `${hour.toString().padStart(2, '0')}:00`;
      chartDataMap[slot] = (chartDataMap[slot] || 0) + o.grandTotal;
    });
  } else if (timeRange === '7days') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(new Date(selectedDate).getTime() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0].substring(5);
      chartDataMap[dateKey] = 0;
    }
    filteredOrders.forEach((o) => {
      const dateKey = o.createdAt.split('T')[0].substring(5);
      if (chartDataMap[dateKey] !== undefined) {
        chartDataMap[dateKey] += o.grandTotal;
      }
    });
  } else {
    for (let m = 1; m <= 12; m++) {
      const mKey = `Tháng ${m}`;
      chartDataMap[mKey] = 0;
    }
    filteredOrders.forEach((o) => {
      const month = new Date(o.createdAt).getMonth() + 1;
      const mKey = `Tháng ${month}`;
      if (chartDataMap[mKey] !== undefined) {
        chartDataMap[mKey] += o.grandTotal;
      }
    });
  }

  const timelineChartData = Object.entries(chartDataMap).map(([label, revenue]) => ({
    label,
    'Doanh Thu (đ)': revenue,
  }));

  // Clear Revenue Handlers
  const handleClearMonthlyRevenue = () => {
    if (!setOrders) return;
    const confirmMsg = `⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TOÀN BỘ dữ liệu doanh thu của Tháng ${selectedMonth} không?\nThao tác này sẽ xóa tất cả các đơn hàng thuộc Tháng ${selectedMonth}!`;
    if (confirm(confirmMsg)) {
      setOrders((prev) => prev.filter((o) => o.createdAt.substring(0, 7) !== selectedMonth));
      alert(`Đã xóa sạch doanh thu của Tháng ${selectedMonth}!`);
    }
  };

  const handleClearYearlyRevenue = () => {
    if (!setOrders) return;
    const confirmMsg = `🚨 XÁC NHẬN NGUY HIỂM: Bạn có chắc chắn muốn XÓA SẠCH TOÀN BỘ doanh thu của Năm ${selectedYear} không?\nToàn bộ đơn hàng thuộc Năm ${selectedYear} sẽ bị xóa vĩnh viễn!`;
    if (confirm(confirmMsg)) {
      setOrders((prev) => prev.filter((o) => o.createdAt.substring(0, 4) !== selectedYear));
      alert(`Đã xóa sạch doanh thu của Năm ${selectedYear}!`);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] p-4 sm:p-6 overflow-y-auto selection:bg-[#5A5A40] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Interactive Filter Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-[#E0E0D6] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#5A5A40]" />
              BÁO CÁO DOANH THU THỜI GIAN THỰC & SẢN LƯỢNG MÓN
            </h2>
            <p className="text-xs text-[#808070] mt-0.5 font-medium">
              Chả Giò Bắp Quảng Ngãi - Cập nhật doanh thu liên tục, chọn xem theo Ngày/Tuần/Tháng/Năm & quản lý xóa dữ liệu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date / Month / Year Picker based on active tab */}
            {timeRange === 'today' && (
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E0E0D6] text-xs font-bold">
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                <span>Chọn Ngày:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-bold text-[#1A1A1A] focus:outline-hidden cursor-pointer"
                />
              </div>
            )}

            {timeRange === 'month' && (
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E0E0D6] text-xs font-bold">
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                <span>Chọn Tháng:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-bold text-[#1A1A1A] focus:outline-hidden cursor-pointer"
                />
              </div>
            )}

            {timeRange === 'year' && (
              <div className="flex items-center gap-1.5 bg-[#FAF9F6] px-3 py-1.5 rounded-xl border border-[#E0E0D6] text-xs font-bold">
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                <span>Chọn Năm:</span>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-16 bg-transparent font-bold text-[#1A1A1A] focus:outline-hidden cursor-pointer"
                />
              </div>
            )}

            {/* Time Range Filter Tabs */}
            <div className="flex items-center gap-1 bg-[#F5F5F0] p-1 rounded-xl border border-[#E0E0D6] text-xs">
              <button
                onClick={() => setTimeRange('today')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === 'today'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'text-[#808070] hover:text-[#1A1A1A]'
                }`}
              >
                Theo Ngày
              </button>
              <button
                onClick={() => setTimeRange('7days')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === '7days'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'text-[#808070] hover:text-[#1A1A1A]'
                }`}
              >
                Theo Tuần
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === 'month'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'text-[#808070] hover:text-[#1A1A1A]'
                }`}
              >
                Theo Tháng
              </button>
              <button
                onClick={() => setTimeRange('year')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  timeRange === 'year'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'text-[#808070] hover:text-[#1A1A1A]'
                }`}
              >
                Theo Năm
              </button>
            </div>

            <button
              onClick={() => exportSalesReportDocx(INITIAL_SHIFT, filteredOrders, DEFAULT_STORE_CONFIG)}
              className="px-3.5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
              title="Tải báo cáo Word chuyên nghiệp"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất Báo Cáo Word (.docx)</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E0E0D6] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#808070]">TỔNG DOANH THU</p>
              <p className="text-xl font-extrabold text-[#5A5A40] mt-1">
                {totalRevenue.toLocaleString('vi-VN')} đ
              </p>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" /> Cập nhật thời gian thực
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center font-bold border border-[#E0E0D6]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E0E0D6] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#808070]">SỐ ĐƠN HOÀN TẤT</p>
              <p className="text-xl font-bold text-[#1A1A1A] mt-1">
                {totalOrdersCount} <span className="text-xs font-normal">đơn</span>
              </p>
              <span className="text-[10px] text-[#808070] font-medium mt-1 block">
                TB ~{averageOrderValue.toLocaleString('vi-VN')}đ/đơn
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#1A1A1A] flex items-center justify-center font-bold border border-[#E0E0D6]">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E0E0D6] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#808070]">SẢN LƯỢNG MÓN ĂN</p>
              <p className="text-xl font-bold text-[#2C2C24] mt-1">
                {foodVolume} <span className="text-xs font-normal">phần</span>
              </p>
              <span className="text-[10px] text-[#2C2C24] font-bold mt-1 block">
                {foodRevenue.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#2C2C24] flex items-center justify-center border border-[#E0E0D6]">
              <Utensils className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#E0E0D6] shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#808070]">SẢN LƯỢNG ĐỒ UỐNG</p>
              <p className="text-xl font-bold text-[#5A5A40] mt-1">
                {drinkVolume} <span className="text-xs font-normal">ly</span>
              </p>
              <span className="text-[10px] text-[#5A5A40] font-bold mt-1 block">
                {drinkRevenue.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F5F5F0] text-[#5A5A40] flex items-center justify-center border border-[#E0E0D6]">
              <Coffee className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Area / Bar Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#E0E0D6] shadow-2xs space-y-4">
            <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5A5A40]" />
              {timeRange === 'today'
                ? `Biểu Đồ Doanh Thu Theo Giờ (Ngày ${selectedDate})`
                : timeRange === '7days'
                ? `Biểu Đồ Doanh Thu 7 Ngày Qua (Tính đến ${selectedDate})`
                : timeRange === 'month'
                ? `Biểu Đồ Doanh Thu Các Ngày Trong Tháng ${selectedMonth}`
                : `Biểu Đồ Doanh Thu 12 Tháng Trong Năm ${selectedYear}`}
            </h3>
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#5A5A40" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0D6" />
                  <XAxis dataKey="label" stroke="#808070" />
                  <YAxis stroke="#808070" tickFormatter={(val) => `${val / 1000}k`} />
                  <Tooltip
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString('vi-VN')} đ`,
                      'Doanh thu',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="Doanh Thu (đ)"
                    stroke="#5A5A40"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie */}
          <div className="bg-white p-5 rounded-2xl border border-[#E0E0D6] shadow-2xs space-y-4 flex flex-col justify-between">
            <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#5A5A40]" />
              Tỷ Lệ Tỷ Trọng: Món Ăn vs Đồ Uống
            </h3>
            <div className="h-52 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${Number(value).toLocaleString('vi-VN')} đ`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#5A5A40]">
                <span className="w-3 h-3 rounded-full bg-[#5A5A40]"></span>
                Đồ Uống ({Math.round((drinkRevenue / (totalRevenue || 1)) * 100)}%)
              </span>
              <span className="flex items-center gap-1.5 text-[#808070]">
                <span className="w-3 h-3 rounded-full bg-[#808070]"></span>
                Món Ăn ({Math.round((foodRevenue / (totalRevenue || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Item Sales Table */}
        <div className="bg-white rounded-2xl p-5 border border-[#E0E0D6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1A1A1A] text-sm flex items-center gap-2">
              <Award className="w-5 h-5 text-[#5A5A40]" />
              BẢNG THỐNG KÊ SẢN LƯỢNG BÁN TỪNG MÓN ({allSellingItems.length} MÓN)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E0E0D6] text-[#808070] font-bold bg-[#FAF9F6]">
                  <th className="py-2.5 px-3">Hạng</th>
                  <th className="py-2.5 px-3">Tên Món Ăn / Đồ Uống</th>
                  <th className="py-2.5 px-3">Phân Loại</th>
                  <th className="py-2.5 px-3 text-center">Số Lượng Bán Out</th>
                  <th className="py-2.5 px-3 text-right">Tổng Doanh Thu Món</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0D6]/60 font-medium">
                {allSellingItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF9F6]">
                    <td className="py-3 px-3">
                      <span className="w-6 h-6 rounded-full bg-[#F5F5F0] text-[#5A5A40] font-black text-xs flex items-center justify-center border border-[#E0E0D6]">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#1A1A1A]">{item.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-[#FAF9F6] border border-[#E0E0D6] text-[#808070] px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#5A5A40] text-sm">
                      {item.volume} {item.category === 'Món Ăn' ? 'phần' : 'ly'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#1A1A1A] text-sm">
                      {item.revenue.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}

                {allSellingItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#808070] font-medium">
                      Chưa có đơn hàng thanh toán nào trong khoảng thời gian đã chọn.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danger Zone: Clear Revenue by Month / Year */}
        {setOrders && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
              <span>VÙNG QUẢN LÝ NGUY HIỂM: XÓA DOANH THU THEO THÁNG HOẶC THEO NĂM</span>
            </div>
            <p className="text-xs text-rose-700 font-medium">
              Chỉ dùng khi chủ quán muốn reset hoặc xóa sạch dữ liệu doanh thu của một Tháng hoặc một Năm cụ thể.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Clear Month */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-rose-200 shadow-2xs">
                <span className="text-xs font-bold text-rose-900">Tháng:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-bold text-rose-900 bg-transparent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleClearMonthlyRevenue}
                  className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Doanh Thu Tháng {selectedMonth}</span>
                </button>
              </div>

              {/* Clear Year */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-rose-200 shadow-2xs">
                <span className="text-xs font-bold text-rose-900">Năm:</span>
                <input
                  type="number"
                  min="2020"
                  max="2030"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-16 text-xs font-bold text-rose-900 bg-transparent focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleClearYearlyRevenue}
                  className="px-3 py-1.5 rounded-lg bg-rose-900 hover:bg-black text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa Doanh Thu Năm {selectedYear}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
