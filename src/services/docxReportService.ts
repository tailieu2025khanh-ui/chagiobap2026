import { Shift, Order, StoreConfig, MenuItem } from '../types/pos';

/**
 * Generates a professionally formatted Word (.doc / .docx compatible) report
 * for Shift Sales & Financial Performance.
 */
export function exportSalesReportDocx(
  shift: Shift,
  orders: Order[],
  storeConfig: StoreConfig
) {
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
  const totalDiscount = paidOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalVat = paidOrders.reduce((sum, o) => sum + o.vatAmount, 0);

  // Calculate top sold items
  const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      const id = item.menuItem.id;
      if (!itemMap[id]) {
        itemMap[id] = { name: item.menuItem.name, qty: 0, revenue: 0 };
      }
      itemMap[id].qty += item.quantity;
      itemMap[id].revenue += item.totalPrice;
    });
  });

  const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty);

  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Báo Cáo Doanh Thu ${storeConfig.storeName}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1A1A1A; }
        h1 { color: #5A5A40; font-size: 24px; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        h2 { color: #333; font-size: 16px; border-bottom: 2px solid #5A5A40; padding-bottom: 5px; margin-top: 25px; }
        .store-header { text-align: center; margin-bottom: 20px; font-size: 13px; color: #555; }
        .meta-table, .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
        .data-table th, .data-table td { border: 1px solid #CCC; padding: 8px 12px; text-align: left; }
        .data-table th { background-color: #5A5A40; color: #FFFFFF; font-weight: bold; }
        .data-table tr:nth-child(even) { background-color: #F9F9F6; }
        .number-col { text-align: right; }
        .summary-card { background-color: #F5F5F0; border-left: 4px solid #5A5A40; padding: 12px; margin-top: 15px; font-size: 13px; }
        .signature-section { margin-top: 40px; width: 100%; text-align: center; font-size: 13px; }
        .signature-box { display: inline-block; width: 45%; float: left; }
      </style>
    </head>
    <body>
      <h1>${storeConfig.storeName}</h1>
      <div className="store-header">
        <strong>Địa chỉ:</strong> ${storeConfig.address} | <strong>Hotline:</strong> ${storeConfig.phone}<br/>
        <strong>BÁO CÁO DOANH THU & KẾT QUẢ CA BÁN HÀNG</strong><br/>
        <em>Ngày xuất báo cáo: ${currentDate}</em>
      </div>

      <h2>1. THÔNG TIN CA LÀM VIỆC</h2>
      <table class="meta-table">
        <tr>
          <td><strong>Mã Ca:</strong> ${shift.id}</td>
          <td><strong>Thu Ngân Trực Ca:</strong> ${shift.cashierName}</td>
        </tr>
        <tr>
          <td><strong>Giờ Mở Ca:</strong> ${new Date(shift.startTime).toLocaleString('vi-VN')}</td>
          <td><strong>Tiền Tiền Mặt Ban Đầu:</strong> ${shift.openingCash.toLocaleString('vi-VN')} VNĐ</td>
        </tr>
      </table>

      <h2>2. TỔNG HỢP DOANH THU & THU CHI</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Kênh Thanh Toán</th>
            <th class="number-col">Số Đơn</th>
            <th class="number-col">Tổng Doanh Thu (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tiền Mặt (Cash)</td>
            <td class="number-col">-</td>
            <td class="number-col">${shift.cashRevenue.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr>
            <td>Chuyển Khoản Ngân Hàng / VietQR</td>
            <td class="number-col">-</td>
            <td class="number-col">${shift.transferRevenue.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr>
            <td>Thẻ ATM / Ví Điện Tử MoMo</td>
            <td class="number-col">-</td>
            <td class="number-col">${shift.cardRevenue.toLocaleString('vi-VN')} đ</td>
          </tr>
          <tr style="font-weight: bold; background-color: #E8E8E0;">
            <td>TỔNG DOANH THU THỰC THU</td>
            <td class="number-col">${paidOrders.length} đơn</td>
            <td class="number-col">${shift.totalRevenue.toLocaleString('vi-VN')} đ</td>
          </tr>
        </tbody>
      </table>

      <div class="summary-card">
        <strong>Chi tiết giảm giá & Thuế:</strong><br/>
        • Tổng tiền giảm giá (Discount): ${totalDiscount.toLocaleString('vi-VN')} VNĐ<br/>
        • Tổng thuế VAT: ${totalVat.toLocaleString('vi-VN')} VNĐ<br/>
        • Tiền mặt tính toán bàn giao quầy: <strong>${shift.closingCashCalculated.toLocaleString('vi-VN')} VNĐ</strong>
      </div>

      <h2>3. TOP MÓN BÁN CHẠY NHẤT</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên Món / Sản Phẩm</th>
            <th class="number-col">Số Lượng Đã Bán</th>
            <th class="number-col">Thành Tiền (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          ${
            topItems.length > 0
              ? topItems
                  .map(
                    (item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${item.name}</strong></td>
                <td class="number-col">${item.qty}</td>
                <td class="number-col">${item.revenue.toLocaleString('vi-VN')} đ</td>
              </tr>
            `
                  )
                  .join('')
              : '<tr><td colspan="4" style="text-align: center;">Chưa có dữ liệu bán hàng</td></tr>'
          }
        </tbody>
      </table>

      <br/><br/>
      <table style="width: 100%; border: none; margin-top: 30px;">
        <tr style="border: none;">
          <td style="width: 50%; text-align: center; border: none;">
            <strong>THU NGÂN TRỰC CA</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
            <br/><br/><br/><br/>
            <strong>${shift.cashierName}</strong>
          </td>
          <td style="width: 50%; text-align: center; border: none;">
            <strong>CHỦ QUÁN / QUẢN LÝ</strong><br/>
            <em>(Ký và ghi rõ họ tên)</em>
            <br/><br/><br/><br/>
            <strong>${storeConfig.storeName}</strong>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + docHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const fileName = `Bao_Cao_Doanh_Thu_${storeConfig.storeName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.doc`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates a Printable Menu Showcase Word / Presentation Document
 */
export function exportMenuDocx(menuItems: MenuItem[], storeConfig: StoreConfig) {
  const docHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>THỰC ĐƠN THƯƠNG HIỆU ${storeConfig.storeName}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1A1A1A; }
        h1 { color: #5A5A40; font-size: 26px; text-align: center; margin-bottom: 5px; text-transform: uppercase; }
        .tagline { text-align: center; color: #808070; font-style: italic; font-size: 14px; margin-bottom: 30px; }
        .menu-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .menu-table th { background-color: #5A5A40; color: white; padding: 10px; font-size: 14px; }
        .menu-table td { border-bottom: 1px solid #E0E0D6; padding: 12px 10px; font-size: 13px; }
        .price { color: #C2410C; font-weight: bold; font-size: 14px; text-align: right; }
        .badge { background-color: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
      </style>
    </head>
    <body>
      <h1>🌽 ${storeConfig.storeName} 🌽</h1>
      <div className="tagline">Đặc sản Chả Giò Bắp Nóng Giòn & Thực Đơn Phong Phú | Hotline: ${storeConfig.phone}</div>

      <table class="menu-table">
        <thead>
          <tr>
            <th>Mã SKU</th>
            <th>Tên Món / Đồ Uống</th>
            <th>Danh Mục</th>
            <th style="text-align: right;">Đơn Giá (VNĐ)</th>
          </tr>
        </thead>
        <tbody>
          ${menuItems
            .map(
              (item) => `
            <tr>
              <td><code>${item.sku}</code></td>
              <td>
                <strong>${item.name}</strong> ${item.isBestSeller ? '<span class="badge">🔥 BÁN CHẠY</span>' : ''}<br/>
                <small style="color: #666;">${item.description || ''}</small>
              </td>
              <td>${item.category === 'mon-an' ? 'Món ăn' : item.category === 'nuoc-uong' ? 'Nước uống' : 'Combo'}</td>
              <td class="price">${item.price.toLocaleString('vi-VN')} đ</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + docHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const fileName = `Thuc_Don_${storeConfig.storeName.replace(/\s+/g, '_')}.doc`;
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
