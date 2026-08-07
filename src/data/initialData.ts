import { MenuItem, ModifierGroup, Table, StoreConfig, Order, Shift } from '../types/pos';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: "CHA CHI BAP",
  address: "128 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM",
  phone: "0908 123 456",
  wifiName: "ChaChiBap_Guest",
  wifiPass: "88888888",
  taxCode: "0312345678",
  bankName: "MBBank",
  bankAccount: "999908123456",
  accountHolder: "CHA CHI BAP CO LTD",
  qrTemplate: "compact2",
  printerType: "lan",
  printerIp: "192.168.1.200",
  printerPort: 9100,
  paperSize: "80mm",
  printCopies: 1,
  autoPrintReceipt: true,
  printKitchenReceipt: true,
};

export const INITIAL_MODIFIERS: ModifierGroup[] = [
  {
    id: 'mod_sugar',
    title: 'Mức Đường',
    type: 'single',
    required: false,
    options: [
      { id: 'sugar_100', name: '100% Đường (Chuẩn)', price: 0 },
      { id: 'sugar_70', name: '70% Đường (Ít ngọt)', price: 0 },
      { id: 'sugar_50', name: '50% Đường', price: 0 },
      { id: 'sugar_30', name: '30% Đường', price: 0 },
      { id: 'sugar_0', name: 'Không đường', price: 0 },
    ],
  },
  {
    id: 'mod_ice',
    title: 'Mức Đá',
    type: 'single',
    required: false,
    options: [
      { id: 'ice_100', name: '100% Đá (Chuẩn)', price: 0 },
      { id: 'ice_70', name: '70% Đá (Ít đá)', price: 0 },
      { id: 'ice_50', name: '50% Đá', price: 0 },
      { id: 'ice_0', name: 'Không đá', price: 0 },
      { id: 'ice_hot', name: 'Uống Nóng', price: 0 },
    ],
  },
  {
    id: 'mod_topping',
    title: 'Topping Thêm',
    type: 'multiple',
    required: false,
    options: [
      { id: 'top_1', name: 'Trân Châu Đen', price: 8000 },
      { id: 'top_2', name: 'Trân Châu Trắng 3Q', price: 10000 },
      { id: 'top_3', name: 'Kem Cheese béo ngậy', price: 12000 },
      { id: 'top_4', name: 'Thạch Trái Cây', price: 8000 },
      { id: 'top_5', name: 'Pudding Trứng', price: 10000 },
    ],
  },
  {
    id: 'mod_spicy',
    title: 'Độ Cay (Món ăn)',
    type: 'single',
    required: false,
    options: [
      { id: 'spicy_none', name: 'Không cay', price: 0 },
      { id: 'spicy_mild', name: 'Cay vừa', price: 0 },
      { id: 'spicy_hot', name: 'Cay nhiều', price: 0 },
    ],
  },
];

export const INITIAL_MENU: MenuItem[] = [
  // --- NƯỚC UỐNG (DRINKS) ---
  {
    id: 'm1',
    sku: 'DRK01',
    name: 'Cà Phê Muối Sài Gòn',
    category: 'nuoc-uong',
    subcategory: 'Cà phê',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Cà phê đậm đà kết hợp lớp kem muối béo ngậy đặc trưng.',
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  },
  {
    id: 'm2',
    sku: 'DRK02',
    name: 'Cà Phê Sữa Đá Sài Gòn',
    category: 'nuoc-uong',
    subcategory: 'Cà phê',
    price: 29000,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Cà phê nguyên chất rang xay chuẩn vị truyền thống.',
    modifierGroupIds: ['mod_sugar', 'mod_ice'],
  },
  {
    id: 'm3',
    sku: 'DRK03',
    name: 'Bạc Xỉu Kem Béo',
    category: 'nuoc-uong',
    subcategory: 'Cà phê',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  },
  {
    id: 'm4',
    sku: 'DRK04',
    name: 'Trà Đào Cam Sả',
    category: 'nuoc-uong',
    subcategory: 'Trà trái cây',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Trà thơm thanh mát kết hợp lát đào giòn ngọt và hương sả sảng khoái.',
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  },
  {
    id: 'm5',
    sku: 'DRK05',
    name: 'Trà Sữa Trân Châu Hoàng Gia',
    category: 'nuoc-uong',
    subcategory: 'Trà sữa',
    price: 49000,
    image: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Trà đen đậm đà pha sữa tươi thơm ngon cùng trân châu dai giòn.',
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  },
  {
    id: 'm6',
    sku: 'DRK06',
    name: 'Trà Vải Lài Kem Cheese',
    category: 'nuoc-uong',
    subcategory: 'Trà trái cây',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  },
  {
    id: 'm7',
    sku: 'DRK07',
    name: 'Matcha Latte Nhật Bản',
    category: 'nuoc-uong',
    subcategory: 'Đá xay & Latte',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  },
  {
    id: 'm8',
    sku: 'DRK08',
    name: 'Sinh Tố Bơ Dừa Thơm Ngậy',
    category: 'nuoc-uong',
    subcategory: 'Sinh tố',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    modifierGroupIds: ['mod_sugar', 'mod_ice'],
  },

  // --- MÓN ĂN (FOOD) ---
  {
    id: 'f1',
    sku: 'FOD01',
    name: 'Phở Bò Tái Nạm Đặc Biệt',
    category: 'mon-an',
    subcategory: 'Món nước',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Nước dùng ninh xương 12h, thịt bò tươi mềm ngon ngọt.',
    modifierGroupIds: ['mod_spicy'],
  },
  {
    id: 'f2',
    sku: 'FOD02',
    name: 'Cơm Tấm Sườn Bì Chả Trứng',
    category: 'mon-an',
    subcategory: 'Món cơm',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Sườn nướng mật ong thơm phức, bì giòn sần sật, chả trứng béo thơm.',
    modifierGroupIds: ['mod_spicy'],
  },
  {
    id: 'f3',
    sku: 'FOD03',
    name: 'Bánh Mì Thịt Nướng Pate',
    category: 'mon-an',
    subcategory: 'Ăn nhanh',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1626803775151-61d756612f97?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Vỏ bánh giòn rụm, pa-tê nhà làm thơm ngậy kèm thịt nướng xá xíu.',
    modifierGroupIds: ['mod_spicy'],
  },
  {
    id: 'f4',
    sku: 'FOD04',
    name: 'Bún Chả Hà Nội Giòn Thơm',
    category: 'mon-an',
    subcategory: 'Món nước',
    price: 62000,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    modifierGroupIds: ['mod_spicy'],
  },
  {
    id: 'f5',
    sku: 'FOD05',
    name: 'Mì Quảng Gà Ta Trứng Cút',
    category: 'mon-an',
    subcategory: 'Món nước',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    modifierGroupIds: ['mod_spicy'],
  },
  {
    id: 'f6',
    sku: 'FOD06',
    name: 'Khoai Tây Chiên Bột Phô Mai',
    category: 'mon-an',
    subcategory: 'Ăn vặt',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  },

  // --- COMBO ---
  {
    id: 'c1',
    sku: 'CMB01',
    name: 'Combo Điểm Sáng: Phở Bò + Cà Phê Muối',
    category: 'combo',
    subcategory: 'Combo Tiết Kiệm',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    isBestSeller: true,
    description: 'Tiết kiệm 11.000đ khi chọn combo ăn sáng đầy đủ năng lượng.',
  },
  {
    id: 'c2',
    sku: 'CMB02',
    name: 'Combo Trưa Vui: Cơm Tấm + Trà Đào Cam Sả',
    category: 'combo',
    subcategory: 'Combo Tiết Kiệm',
    price: 92000,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Combo trưa sảng khoái với cơm tấm nóng hổi và trà mát lạnh.',
  }
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
  startTime: new Date(Date.now() - 6 * 3600 * 1000).toISOString(), // 6 hours ago
  openingCash: 2000000, // 2 million VND opening balance
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
        menuItem: INITIAL_MENU[0], // Cà phê muối
        quantity: 2,
        selectedModifiers: [
          { groupId: 'mod_sugar', groupTitle: 'Mức đường', optionName: '70% Đường', price: 0 },
          { groupId: 'mod_ice', groupTitle: 'Mức đá', optionName: '100% Đá', price: 0 }
        ],
        itemNote: 'Mang ly thủy tinh',
        unitPrice: 35000,
        totalPrice: 70000
      },
      {
        cartItemId: 'item_2',
        menuItem: INITIAL_MENU[8], // Phở bò
        quantity: 2,
        selectedModifiers: [
          { groupId: 'mod_spicy', groupTitle: 'Độ cay', optionName: 'Cay vừa', price: 0 }
        ],
        itemNote: 'Ít bánh phở, nhiều giá',
        unitPrice: 65000,
        totalPrice: 130000
      }
    ],
    subtotal: 200000,
    discountPercent: 10,
    discountAmount: 20000,
    vatPercent: 8,
    vatAmount: 14400,
    grandTotal: 194400,
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    paidAmount: 194400,
    changeAmount: 0,
    kitchenStatus: 'delivered',
    cashierName: 'Nguyễn Văn Minh',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3.8 * 3600 * 1000).toISOString(),
  },
  {
    id: 'HD-1002',
    orderCode: 'POS1002',
    orderType: 'table',
    tableId: 'tb_102',
    tableName: 'Bàn 02',
    items: [
      {
        cartItemId: 'item_3',
        menuItem: INITIAL_MENU[3], // Trà đào cam sả
        quantity: 3,
        selectedModifiers: [
          { groupId: 'mod_topping', groupTitle: 'Topping', optionName: 'Trân Châu Đen', price: 8000 }
        ],
        itemNote: '',
        unitPrice: 53000,
        totalPrice: 159000
      },
      {
        cartItemId: 'item_4',
        menuItem: INITIAL_MENU[9], // Cơm tấm
        quantity: 3,
        selectedModifiers: [],
        itemNote: 'Lấy thêm chén canh nóng',
        unitPrice: 58000,
        totalPrice: 174000
      }
    ],
    subtotal: 333000,
    discountPercent: 0,
    discountAmount: 0,
    vatPercent: 0,
    vatAmount: 0,
    grandTotal: 333000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    paidAmount: 500000,
    changeAmount: 167000,
    kitchenStatus: 'preparing',
    cashierName: 'Nguyễn Văn Minh',
    createdAt: new Date(Date.now() - 1.2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'HD-1003',
    orderCode: 'POS1003',
    orderType: 'takeaway',
    tableName: 'Mang về #05',
    items: [
      {
        cartItemId: 'item_5',
        menuItem: INITIAL_MENU[4], // Trà sữa hoàng gia
        quantity: 2,
        selectedModifiers: [
          { groupId: 'mod_topping', groupTitle: 'Topping', optionName: 'Kem Cheese béo ngậy', price: 12000 }
        ],
        itemNote: 'Để riêng ống hút to',
        unitPrice: 61000,
        totalPrice: 122000
      }
    ],
    subtotal: 122000,
    discountPercent: 0,
    discountAmount: 0,
    vatPercent: 0,
    vatAmount: 0,
    grandTotal: 122000,
    paymentStatus: 'unpaid',
    kitchenStatus: 'ready',
    cashierName: 'Nguyễn Văn Minh',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  }
];
