import { MenuItem, ModifierGroup, Table, StoreConfig, Order, Shift } from '../types/pos';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: "CHẢ GIÒ BẮP QUẢNG NGÃI",
  address: "87, Hùng Vương, Phường Bà Rịa, TP HCM",
  phone: "0972371722",
  wifiName: "khanh vi",
  wifiPass: "0914683351",
  taxCode: "0312345678",
  bankName: "MBBank",
  bankAccount: "999908123456",
  accountHolder: "CHA GIO BAP QUANG NGAI",
  qrTemplate: "compact2",
  printerType: "usb",
  printerIp: "192.168.1.200",
  printerPort: 9100,
  paperSize: "80mm",
  printerFontSize: "size13",
  printCopies: 2,
  autoPrintReceipt: true,
  printKitchenReceipt: true,
};

export const INITIAL_MODIFIERS: ModifierGroup[] = [
  {
    id: 'mod_drink_ice',
    title: 'Mức Đá (Đồ uống)',
    type: 'single',
    required: false,
    options: [
      { id: 'ice_100', name: '100% Đá (Chuẩn)', price: 0 },
      { id: 'ice_50', name: 'Ít đá', price: 0 },
      { id: 'ice_0', name: 'Không đá (Uống lạnh)', price: 0 },
    ],
  },
  {
    id: 'mod_spicy',
    title: 'Gia Vị & Nước Chấm',
    type: 'multiple',
    required: false,
    options: [
      { id: 'spicy_chili', name: 'Thêm Ớt Tươi', price: 0 },
      { id: 'spicy_sauce', name: 'Thêm Nắm Nêm Quảng Ngãi', price: 0 },
      { id: 'extra_veggie', name: 'Thêm Rau Sống', price: 5000 },
      { id: 'extra_ricepaper', name: 'Thêm Bánh Tráng Cuốn', price: 5000 },
    ],
  },
];

export const INITIAL_MENU: MenuItem[] = [
  // --- MÓN ĂN & ĐỒ UỐNG CHUẨN FILE PDF (Thứ tự 1 -> 26) ---
  { id: 'f_1', sku: 'M01', name: 'Chả giò bắp', category: 'mon-an', price: 37000, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '37.000đ/Phần 10 Cuốn', orderIndex: 1 },
  { id: 'f_2', sku: 'M02', name: 'Chả giò cá', category: 'mon-an', price: 37000, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '37.000đ/Phần 10 Cuốn', orderIndex: 2 },
  { id: 'f_3', sku: 'M03', name: 'Chả giò tôm', category: 'mon-an', price: 47000, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '47.000đ/Phần 10 Cuốn', orderIndex: 3 },
  { id: 'f_4', sku: 'M04', name: 'Chả giò thịt', category: 'mon-an', price: 42000, image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '42.000đ/Phần 10 Cuốn', orderIndex: 4 },
  { id: 'f_5', sku: 'M05', name: 'Bò lá lốt', category: 'mon-an', price: 47000, image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '47.000đ/Phần 10 Cuốn + Bún', orderIndex: 5 },
  { id: 'f_6', sku: 'M06', name: 'Nem nướng', category: 'mon-an', price: 42000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '42.000đ/Phần 6 Cây + Bún', orderIndex: 6 },
  { id: 'f_7', sku: 'M07', name: 'Bánh xèo', category: 'mon-an', price: 40000, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '40.000đ/Phần 5 Cái', orderIndex: 7 },
  { id: 'f_8', sku: 'M08', name: 'Bánh khọt', category: 'mon-an', price: 37000, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '37.000đ/Phần 7 Cái', orderIndex: 8 },
  { id: 'f_9', sku: 'M09', name: 'Tô bún', category: 'mon-an', price: 35000, image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '35.000đ/Tô Bún Nem + Chả Giò', orderIndex: 9 },
  { id: 'f_10', sku: 'M10', name: 'Bún đậu', category: 'mon-an', price: 40000, image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '40.000đ/Phần Bún Đậu Mắm Tôm', orderIndex: 10 },
  { id: 'f_11', sku: 'M11', name: 'Thập cẩm', category: 'mon-an', price: 65000, image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '65.000đ/Phần 12 Cuốn', orderIndex: 11 },
  { id: 'f_12', sku: 'M12', name: 'Gỏi cuốn', category: 'mon-an', price: 6000, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '6.000đ/1 Cuốn', orderIndex: 12 },
  { id: 'f_13', sku: 'M13', name: 'Nửa Chả giò bắp', category: 'mon-an', price: 18500, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 13 },
  { id: 'f_14', sku: 'M14', name: 'Nửa Chả giò cá', category: 'mon-an', price: 18500, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 14 },
  { id: 'f_15', sku: 'M15', name: 'Nửa Chả giò tôm', category: 'mon-an', price: 23500, image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 15 },
  { id: 'f_16', sku: 'M16', name: 'Nửa Chả giò thịt', category: 'mon-an', price: 21000, image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 16 },
  { id: 'f_17', sku: 'M17', name: 'Nửa Bò lá lốt', category: 'mon-an', price: 23500, image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 17 },
  { id: 'f_18', sku: 'M18', name: 'Nửa Nem nướng', category: 'mon-an', price: 21000, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 18 },
  { id: 'f_19', sku: 'M19', name: 'Nửa Bánh xèo', category: 'mon-an', price: 25000, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&auto=format&fit=crop&q=80', isAvailable: true, orderIndex: 19 },
  { id: 'd_20', sku: 'M20', name: 'Nước ngọt', category: 'nuoc-uong', price: 15000, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '15.000đ/Lon', orderIndex: 20 },
  { id: 'd_21', sku: 'M21', name: 'Nước bí đao', category: 'nuoc-uong', price: 10000, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '10.000đ/Ly', orderIndex: 21 },
  { id: 'd_22', sku: 'M22', name: 'Nước trà tắc', category: 'nuoc-uong', price: 10000, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '10.000đ/Ly', orderIndex: 22 },
  { id: 'd_23', sku: 'M23', name: 'Sữa đậu ly', category: 'nuoc-uong', price: 10000, image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '10.000đ/Ly', orderIndex: 23 },
  { id: 'd_24', sku: 'M24', name: 'Sữa đậu chai', category: 'nuoc-uong', price: 15000, image: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '15.000đ/Chai', orderIndex: 24 },
  { id: 'd_25', sku: 'M25', name: 'Bò Húc', category: 'nuoc-uong', price: 17000, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80', isAvailable: true, isBestSeller: true, description: '17.000đ/Lon', orderIndex: 25 },
  { id: 'd_26', sku: 'M26', name: 'Rau câu', category: 'nuoc-uong', price: 8000, image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&auto=format&fit=crop&q=80', isAvailable: true, description: '8.000đ/Hũ', orderIndex: 26 },
];

export const INITIAL_TABLES: Table[] = [
  // Tầng 1
  { id: 'tb_101', name: 'Bàn 01', zone: 'Tầng 1', capacity: 2, status: 'empty' },
  { id: 'tb_102', name: 'Bàn 02', zone: 'Tầng 1', capacity: 4, status: 'occupied', currentOrderId: 'HD-1002' },
  { id: 'tb_103', name: 'Bàn 03', zone: 'Tầng 1', capacity: 4, status: 'empty' },
  { id: 'tb_104', name: 'Bàn 04', zone: 'Tầng 1', capacity: 6, status: 'billing', currentOrderId: 'HD-1003' },
  { id: 'tb_105', name: 'Bàn 05', zone: 'Tầng 1', capacity: 2, status: 'empty' },
  { id: 'tb_106', name: 'Bàn 06', zone: 'Tầng 1', capacity: 8, status: 'reserved' },

  // Sân Thượng
  { id: 'tb_201', name: 'Bàn T1', zone: 'Sân Thượng', capacity: 2, status: 'empty' },
  { id: 'tb_202', name: 'Bàn T2', zone: 'Sân Thượng', capacity: 4, status: 'occupied', currentOrderId: 'HD-1004' },
  { id: 'tb_203', name: 'Bàn T3', zone: 'Sân Thượng', capacity: 4, status: 'empty' },
  { id: 'tb_204', name: 'Bàn T4', zone: 'Sân Thượng', capacity: 6, status: 'empty' },

  // Phòng VIP
  { id: 'tb_vip1', name: 'VIP 01 (Lớn)', zone: 'Phòng VIP', capacity: 12, status: 'empty' },
  { id: 'tb_vip2', name: 'VIP 02 (Ấm Cúng)', zone: 'Phòng VIP', capacity: 6, status: 'empty' },

  // Mang về
  { id: 'tb_takeaway', name: 'Quầy Mang Về', zone: 'Mang Về', capacity: 0, status: 'empty' },
];

export const INITIAL_SHIFT: Shift = {
  id: 'sh_001',
  cashierName: 'Nguyễn Văn Minh (Thu Ngân 01)',
  startTime: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  openingCash: 2000000,
  cashRevenue: 1420000,
  transferRevenue: 2850000,
  cardRevenue: 650000,
  totalRevenue: 4920000,
  totalOrders: 18,
  closingCashCalculated: 3420000,
  isClosed: false,
  note: 'Ca sáng hoạt động ổn định',
};

export const INITIAL_PAST_ORDERS: Order[] = [
  {
    id: 'HD-1001',
    orderCode: 'POS1001',
    orderType: 'table',
    tableName: 'Bàn 01',
    items: [
      {
        cartItemId: 'item_1',
        menuItem: INITIAL_MENU[0], // Chả giò bắp
        quantity: 2,
        selectedModifiers: [
          { groupId: 'mod_spicy', groupTitle: 'Gia Vị', optionName: 'Thêm Nắm Nêm Quảng Ngãi', price: 0 }
        ],
        itemNote: 'Chiên giòn rụm',
        unitPrice: 37000,
        totalPrice: 74000
      },
      {
        cartItemId: 'item_2',
        menuItem: INITIAL_MENU[21], // Nước trà tắc
        quantity: 2,
        selectedModifiers: [
          { groupId: 'mod_drink_ice', groupTitle: 'Mức đá', optionName: '100% Đá (Chuẩn)', price: 0 }
        ],
        itemNote: '',
        unitPrice: 10000,
        totalPrice: 20000
      }
    ],
    subtotal: 94000,
    discountPercent: 0,
    discountAmount: 0,
    vatPercent: 0,
    vatAmount: 0,
    grandTotal: 94000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    paidAmount: 100000,
    changeAmount: 6000,
    kitchenStatus: 'delivered',
    cashierName: 'Nguyễn Văn Minh',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
  }
];
