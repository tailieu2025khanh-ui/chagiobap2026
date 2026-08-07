import { MenuItem, Table, Order, CategoryType } from '../types/pos';

/**
 * Utility to extract Spreadsheet ID from full URL or return ID if already plain ID.
 */
export function extractSheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  // Match standard Google Sheets URL format
  const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Basic CSV Parser supporting quotes and line breaks
 */
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        // Ignore carriage return
      } else if (char === '\n') {
        row.push(currentField.trim());
        if (row.some(field => field.length > 0)) {
          lines.push(row);
        }
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || row.length > 0) {
    row.push(currentField.trim());
    if (row.some(field => field.length > 0)) {
      lines.push(row);
    }
  }

  return lines;
}

/**
 * Fetch Menu Items from Google Sheet (via GViz CSV export or OpenSheet API)
 */
export async function fetchMenuFromGoogleSheet(
  sheetIdOrUrl: string,
  sheetName: string = 'Menu'
): Promise<MenuItem[]> {
  const sheetId = extractSheetId(sheetIdOrUrl);
  if (!sheetId) {
    throw new Error('Mã Google Sheet ID hoặc URL không hợp lệ.');
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      // Fallback attempt to OpenSheet API
      const openSheetUrl = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
      const openSheetRes = await fetch(openSheetUrl);
      if (!openSheetRes.ok) {
        throw new Error(`Không thể truy cập Google Sheet (${response.status}). Hãy đảm bảo Sheet đã bật "Chia sẻ: Bất kỳ ai có liên kết".`);
      }
      const jsonData = await openSheetRes.json();
      return mapJsonToMenuItems(jsonData);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      throw new Error('Google Sheet rỗng hoặc không đúng định dạng cột.');
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    return dataRows.map((row, idx) => {
      const getVal = (colName: string) => {
        const colIdx = headers.findIndex(h => h.includes(colName));
        return colIdx >= 0 && row[colIdx] ? row[colIdx] : '';
      };

      const sku = getVal('sku') || `SKU-${100 + idx}`;
      const name = getVal('name') || getVal('tên') || `Món ${idx + 1}`;
      const categoryRaw = (getVal('category') || getVal('danh mục') || 'nuoc-uong').toLowerCase();
      
      let category: CategoryType = 'nuoc-uong';
      if (categoryRaw.includes('ăn') || categoryRaw.includes('food') || categoryRaw.includes('món')) {
        category = 'mon-an';
      } else if (categoryRaw.includes('combo')) {
        category = 'combo';
      } else if (categoryRaw.includes('topping')) {
        category = 'topping';
      }

      const priceNum = parseInt(getVal('price') || getVal('giá') || '0', 10) || 30000;
      const subcategory = getVal('subcategory') || getVal('nhóm');
      const image = getVal('image') || getVal('hình') || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';
      const description = getVal('description') || getVal('mô tả');
      const isAvailableVal = getVal('isavailable') || getVal('còn hàng');
      const isBestSellerVal = getVal('isbestseller') || getVal('bán chạy');

      return {
        id: `gs_item_${idx + 1}_${Date.now()}`,
        sku,
        name,
        category,
        subcategory: subcategory || undefined,
        price: priceNum,
        image,
        isAvailable: isAvailableVal ? isAvailableVal.toString().toLowerCase() !== 'false' && isAvailableVal !== '0' : true,
        isBestSeller: isBestSellerVal ? isBestSellerVal.toString().toLowerCase() === 'true' || isBestSellerVal === '1' : false,
        description: description || undefined,
        modifierGroupIds: category === 'nuoc-uong' ? ['mod_sugar', 'mod_ice', 'mod_topping'] : ['mod_spicy'],
      };
    });
  } catch (err: any) {
    console.error('Google Sheet Menu fetch error:', err);
    throw new Error(err.message || 'Lỗi khi tải dữ liệu từ Google Sheet');
  }
}

function mapJsonToMenuItems(jsonData: any[]): MenuItem[] {
  return jsonData.map((item, idx) => ({
    id: item.id || `gs_json_item_${idx}_${Date.now()}`,
    sku: item.sku || item.SKU || `SKU-${100 + idx}`,
    name: item.name || item['Tên Món'] || item.Name || `Món ${idx + 1}`,
    category: (item.category || item['Danh Mục'] || 'nuoc-uong').toLowerCase() as CategoryType,
    subcategory: item.subcategory || item['Nhóm Món'] || undefined,
    price: Number(item.price || item['Giá Bán'] || 30000),
    image: item.image || item['Hình Ảnh'] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    isAvailable: item.isAvailable !== false && item.isAvailable !== 'false',
    isBestSeller: item.isBestSeller === true || item.isBestSeller === 'true',
    description: item.description || item['Mô Tả'] || undefined,
    modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
  }));
}

/**
 * Fetch Tables layout from Google Sheet
 */
export async function fetchTablesFromGoogleSheet(
  sheetIdOrUrl: string,
  sheetName: string = 'Tables'
): Promise<Table[]> {
  const sheetId = extractSheetId(sheetIdOrUrl);
  if (!sheetId) {
    throw new Error('Mã Google Sheet ID hoặc URL không hợp lệ.');
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Không thể lấy danh sách bàn từ Google Sheet tab '${sheetName}'.`);
    }

    const csvText = await response.text();
    const rows = parseCSV(csvText);
    if (rows.length < 2) {
      throw new Error('Sheet Tables rỗng hoặc không đúng định dạng.');
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const dataRows = rows.slice(1);

    return dataRows.map((row, idx) => {
      const getVal = (colName: string) => {
        const colIdx = headers.findIndex(h => h.includes(colName));
        return colIdx >= 0 && row[colIdx] ? row[colIdx] : '';
      };

      const name = getVal('name') || getVal('bàn') || `Bàn ${idx + 1}`;
      const zoneRaw = getVal('zone') || getVal('khu vực') || 'Tầng 1';
      let zone: 'Tầng 1' | 'Sân Thượng' | 'Phòng VIP' | 'Mang Về' = 'Tầng 1';
      if (zoneRaw.includes('Thượng') || zoneRaw.includes('Rooftop')) zone = 'Sân Thượng';
      else if (zoneRaw.includes('VIP')) zone = 'Phòng VIP';
      else if (zoneRaw.includes('Về') || zoneRaw.includes('Takeaway')) zone = 'Mang Về';

      const capacity = parseInt(getVal('capacity') || getVal('sức chứa') || '4', 10);

      return {
        id: `gs_tb_${idx + 1}`,
        name,
        zone,
        capacity,
        status: 'empty',
      };
    });
  } catch (err: any) {
    console.error('Google Sheet Tables fetch error:', err);
    throw new Error(err.message || 'Lỗi tải danh sách Bàn từ Google Sheet');
  }
}

/**
 * Send orders log to Google Sheet via Google Apps Script Web App
 */
export async function pushOrdersToGoogleSheet(
  appsScriptUrl: string,
  orders: Order[]
): Promise<{ success: boolean; message: string }> {
  if (!appsScriptUrl) {
    throw new Error('Chưa cấu hình URL Google Apps Script Web App.');
  }

  try {
    const payload = orders.map(o => ({
      orderId: o.id,
      orderCode: o.orderCode,
      createdAt: o.createdAt,
      completedAt: o.completedAt || '',
      tableName: o.tableName || 'Mang về',
      orderType: o.orderType,
      itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
      itemsSummary: o.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', '),
      subtotal: o.subtotal,
      discountAmount: o.discountAmount,
      vatAmount: o.vatAmount,
      grandTotal: o.grandTotal,
      paymentMethod: o.paymentMethod || '',
      cashierName: o.cashierName,
    }));

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'sync_orders', orders: payload }),
    });

    if (response.ok) {
      return { success: true, message: `Đã đồng bộ thành công ${orders.length} đơn hàng lên Google Sheet!` };
    } else {
      return { success: false, message: `Cổng Google Apps Script phản hồi lỗi HTTP ${response.status}` };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể đẩy dữ liệu lên Apps Script (${err.message}). Vui lòng kiểm tra lại CORS hoặc URL Web App.`,
    };
  }
}

/**
 * Fallback Demo Data for CHA CHI BAP Google Sheet Sync
 */
export function getDemoSheetData(): { menu: MenuItem[]; tables: Table[] } {
  const demoMenu: MenuItem[] = [
    {
      id: 'ccb_1',
      sku: 'CCB-01',
      name: 'Chả Giò Bắp Nóng Giòn (Đặc Sản CHA CHI BAP)',
      category: 'mon-an',
      subcategory: 'Món Chả Bắp',
      price: 45000,
      image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
      isBestSeller: true,
      description: 'Chả giò bắp ngọt dịu cuốn bánh tráng giòn rụm chấm nước mắm tỏi ớt đặc chế.',
      modifierGroupIds: ['mod_spicy'],
    },
    {
      id: 'ccb_2',
      sku: 'CCB-02',
      name: 'Bánh Xếp Chả Bắp Chiên Bơ',
      category: 'mon-an',
      subcategory: 'Món Chả Bắp',
      price: 49000,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
      isBestSeller: true,
      description: 'Bánh xếp nhân bắp ngọt đậm vị chiên thơm lừng hương bơ Pháp.',
      modifierGroupIds: ['mod_spicy'],
    },
    {
      id: 'ccb_3',
      sku: 'CCB-03',
      name: 'Trà Tắc Xí Muội Chả Bắp Combo',
      category: 'nuoc-uong',
      subcategory: 'Trà Trái Cây',
      price: 35000,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
      isBestSeller: true,
      description: 'Trà tắc mát lạnh giải nhiệt kết hợp hoàn hảo cùng món ăn chiên giòn.',
      modifierGroupIds: ['mod_sugar', 'mod_ice', 'mod_topping'],
    },
    {
      id: 'ccb_4',
      sku: 'CCB-04',
      name: 'Bạc Xỉu Sữa Bắp Đậm Đà',
      category: 'nuoc-uong',
      subcategory: 'Cà phê',
      price: 38000,
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
      isBestSeller: false,
      description: 'Cà phê sữa béo kết hợp hương vị bắp ngô nhẹ nhàng thơm ngậy.',
      modifierGroupIds: ['mod_sugar', 'mod_ice'],
    },
    {
      id: 'ccb_5',
      sku: 'CCB-05',
      name: 'Combo CHA CHI BAP Đủ Vị (Chả Bắp + Bánh Xếp + 2 Nước)',
      category: 'combo',
      subcategory: 'Combo Tiết Kiệm',
      price: 139000,
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
      isBestSeller: true,
      description: 'Combo best-seller dành cho 2 người thưởng thức toàn bộ đặc sản quán.',
    },
  ];

  const demoTables: Table[] = [
    { id: 'tb_ccb_1', name: 'Bàn Bắp 01', zone: 'Tầng 1', capacity: 4, status: 'empty' },
    { id: 'tb_ccb_2', name: 'Bàn Bắp 02', zone: 'Tầng 1', capacity: 4, status: 'empty' },
    { id: 'tb_ccb_3', name: 'Bàn Bắp 03', zone: 'Tầng 1', capacity: 6, status: 'empty' },
    { id: 'tb_ccb_vip1', name: 'Phòng VIP CHA CHI BAP', zone: 'Phòng VIP', capacity: 10, status: 'empty' },
    { id: 'tb_ccb_roof', name: 'Sân Thượng Chill 01', zone: 'Sân Thượng', capacity: 4, status: 'empty' },
  ];

  return { menu: demoMenu, tables: demoTables };
}
