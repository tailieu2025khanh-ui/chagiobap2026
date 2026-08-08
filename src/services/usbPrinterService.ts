// USB & Sunmi D2 ESC/POS Thermal Printer Service

import { Order, StoreConfig } from '../types/pos';

// Full WebUSB and Sunmi Printer API Ambient Type Declarations for Vercel / TypeScript compilation
declare global {
  interface USBEndpoint {
    endpointNumber: number;
    direction: 'in' | 'out';
    type: 'bulk' | 'interrupt' | 'isochronous';
  }

  interface USBAlternateInterface {
    alternateSetting: number;
    endpoints: USBEndpoint[];
  }

  interface USBInterface {
    interfaceNumber: number;
    claimed: boolean;
    alternates: USBAlternateInterface[];
  }

  interface USBConfiguration {
    configurationValue: number;
    interfaces: USBInterface[];
  }

  interface USBDevice {
    vendorId: number;
    productId: number;
    opened: boolean;
    productName?: string;
    configuration: USBConfiguration | null;
    open: () => Promise<void>;
    selectConfiguration: (configurationValue: number) => Promise<void>;
    claimInterface: (interfaceNumber: number) => Promise<void>;
    transferOut: (endpointNumber: number, data: BufferSource) => Promise<any>;
  }

  interface Navigator {
    usb?: {
      requestDevice: (options: { filters: any[] }) => Promise<USBDevice>;
      getDevices: () => Promise<USBDevice[]>;
    };
  }

  interface Window {
    sunmiInnerPrinter?: {
      printOriginalText: (text: string, callback?: any) => void;
      printText: (text: string, callback?: any) => void;
      setFontSize: (size: number, callback?: any) => void;
      setAlignment: (alignment: number, callback?: any) => void; // 0: left, 1: center, 2: right
      printBarCode: (data: string, sym: number, h: number, w: number, alignment: number) => void;
      printQRCode: (data: string, moduleSize: number, errorLevel: number) => void;
      lineWrap: (lines: number, callback?: any) => void;
      cutPaper: (callback?: any) => void;
    };
    SunmiPrinter?: any;
  }
}

export interface UsbPrinterDevice {
  device: USBDevice;
  name: string;
  interfaceNumber: number;
  endpointNumber: number;
}

let activeUsbDevice: USBDevice | null = null;
let activeEndpointNumber: number | null = null;
let activeInterfaceNumber: number | null = null;

/**
 * Check if WebUSB API is supported by current browser/webview
 */
export const isWebUsbSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'usb' in navigator && !!(navigator as any).usb;
};

/**
 * Check if running inside Sunmi POS OS native JS Bridge
 */
export const isSunmiNativePrinter = (): boolean => {
  return typeof window !== 'undefined' && (!!window.sunmiInnerPrinter || !!window.SunmiPrinter);
};

/**
 * Request user to pick a USB Thermal Printer device
 */
export const requestUsbPrinter = async (): Promise<string | null> => {
  if (!isWebUsbSupported()) {
    throw new Error('Trình duyệt hiện tại không hỗ trợ WebUSB. Hãy sử dụng Google Chrome trên Máy POS Sunmi D2.');
  }

  const usbApi = (navigator as any).usb;

  try {
    // Request device with printer filter or open filter
    const device: USBDevice = await usbApi.requestDevice({
      filters: [
        { classCode: 7 }, // USB Printer Class
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x1fc9 }, // NXP / Sunmi
        { vendorId: 0x0483 }, // STMicroelectronics / Xprinter
        { vendorId: 0x0dd4 }, // Custom POS
        { vendorId: 0x1a86 }, // QinHeng / Winpal
        { vendorId: 0x0416 }, // Winbond / Pos printer
      ],
    });

    await connectToUsbDevice(device);
    return device.productName || `Máy In USB (${device.vendorId.toString(16)}:${device.productId.toString(16)})`;
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return null; // User cancelled
    }
    // Fallback: try request device without filters if vendor filter rejected
    try {
      const device: USBDevice = await usbApi.requestDevice({ filters: [] });
      await connectToUsbDevice(device);
      return device.productName || 'Máy In USB';
    } catch (fallbackErr: any) {
      console.error('Lỗi chọn thiết bị USB:', fallbackErr);
      throw new Error(fallbackErr.message || 'Không thể kết nối với cổng USB máy in.');
    }
  }
};

/**
 * Connect & claim interface for a USB device
 */
const connectToUsbDevice = async (device: USBDevice): Promise<void> => {
  await device.open();
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }

  // Find interface with OUT endpoint
  let targetInterface: USBInterface | null = null;
  let targetEndpoint: USBEndpoint | null = null;

  for (const iface of device.configuration?.interfaces || []) {
    for (const alt of iface.alternates) {
      // Class 7 is Printer, or fallback to bulk out endpoint
      const outEp = alt.endpoints.find((ep) => ep.direction === 'out' && ep.type === 'bulk');
      if (outEp) {
        targetInterface = iface;
        targetEndpoint = outEp;
        break;
      }
    }
    if (targetEndpoint) break;
  }

  if (!targetInterface || !targetEndpoint) {
    throw new Error('Không tìm thấy cổng dữ liệu (Bulk Out Endpoint) trên máy in USB này.');
  }

  await device.claimInterface(targetInterface.interfaceNumber);
  activeUsbDevice = device;
  activeInterfaceNumber = targetInterface.interfaceNumber;
  activeEndpointNumber = targetEndpoint.endpointNumber;
};

/**
 * Get name of currently connected USB printer
 */
export const getConnectedUsbPrinterName = async (): Promise<string | null> => {
  if (activeUsbDevice) {
    return activeUsbDevice.productName || 'Máy in USB POS';
  }

  if (isWebUsbSupported()) {
    try {
      const usbApi = (navigator as any).usb;
      const paired: USBDevice[] = await usbApi.getDevices();
      if (paired.length > 0) {
        const device = paired[0];
        try {
          await connectToUsbDevice(device);
          return device.productName || 'Máy in USB Sunmi D2';
        } catch {
          return paired[0].productName || 'Máy in USB Sunmi D2 (Chưa mở kết nối)';
        }
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra máy in USB:', err);
    }
  }

  if (isSunmiNativePrinter()) {
    return 'Máy In Tích Hợp Sunmi D2 (Sunmi JS Bridge)';
  }

  return null;
};

/**
 * Generate ESC/POS Binary Buffer for an Order
 */
export const buildEscPosBuffer = (order: Order, storeConfig: StoreConfig, copiesCount: number = 2): Uint8Array => {
  const bytes: number[] = [];

  const addStr = (str: string) => {
    // Basic Vietnamese accent remover for thermal printers that lack UTF-8 fonts
    const normalizedStr = removeVietnameseTones(str);
    for (let i = 0; i < normalizedStr.length; i++) {
      bytes.push(normalizedStr.charCodeAt(i) & 0xff);
    }
  };

  const addBytes = (...cmds: number[]) => {
    bytes.push(...cmds);
  };

  const is58mm = storeConfig.paperSize === '58mm';
  const maxChars = is58mm ? 32 : 42;

  const copyLabels = [
    'LIÊN 1: DÀNH CHO KHÁCH HÀNG',
    'LIÊN 2: LƯU TẠI CỬA HÀNG',
    'LIÊN 3: GIAO NHẬN / BẾP',
  ];

  const actualCopies = Math.max(1, copiesCount);

  for (let copyIdx = 0; copyIdx < actualCopies; copyIdx++) {
    // ESC @ Initialize Printer
    addBytes(0x1b, 0x40);

    // Set code page CP858 / standard
    addBytes(0x1b, 0x74, 0x00);

    // ESC a 1 Center Alignment
    addBytes(0x1b, 0x61, 0x01);

    // Double Height + Width for Store Header
    addBytes(0x1d, 0x21, 0x11);
    addStr((storeConfig.storeName || 'CHA CHI BAP') + '\n');

    // Normal Text
    addBytes(0x1d, 0x21, 0x00);
    addStr((storeConfig.address || '') + '\n');
    addStr(`SDT: ${storeConfig.phone || ''}\n`);
    addStr(`Wifi: ${storeConfig.wifiName || ''} - MK: ${storeConfig.wifiPass || ''}\n`);
    addStr('-'.repeat(maxChars) + '\n');

    // Copy Label Badge (If 2 or more copies)
    if (actualCopies > 1) {
      addBytes(0x1b, 0x45, 0x01); // Bold ON
      addStr(`*** ${copyLabels[copyIdx] || `LIEN ${copyIdx + 1}`} ***\n`);
      addBytes(0x1b, 0x45, 0x00); // Bold OFF
      addStr('-'.repeat(maxChars) + '\n');
    }

    // Title
    addBytes(0x1d, 0x21, 0x01); // Double height
    addStr('HOA DON THANH TOAN\n');
    addBytes(0x1d, 0x21, 0x00);
    addStr(`Ma HD: ${order.id}\n`);
    addStr(`Ngay: ${new Date(order.createdAt).toLocaleString('vi-VN')}\n`);

    const orderTypeStr =
      order.orderType === 'table'
        ? `Tai ban: ${order.tableName || 'N/A'}`
        : order.orderType === 'takeaway'
        ? 'Mang ve'
        : 'Giao hang';
    addStr(`Loai: ${orderTypeStr} | Thu ngan: ${order.cashierName}\n`);
    addStr('='.repeat(maxChars) + '\n');

    // ESC a 0 Left Alignment
    addBytes(0x1b, 0x61, 0x00);

    // Table items header
    addBytes(0x1b, 0x45, 0x01); // Bold ON
    if (is58mm) {
      addStr('Ten Mon         SL   T.Tien\n');
    } else {
      addStr('Ten Mon                  SL   D.Gia     T.Tien\n');
    }
    addBytes(0x1b, 0x45, 0x00); // Bold OFF
    addStr('-'.repeat(maxChars) + '\n');

    // Items
    for (const item of order.items) {
      const name = removeVietnameseTones(item.menuItem?.name || 'Mon ăn');
      const qtyStr = item.quantity.toString();
      const priceStr = item.unitPrice.toLocaleString('vi-VN');
      const totalStr = item.totalPrice.toLocaleString('vi-VN');

      if (is58mm) {
        addStr(name.slice(0, 16).padEnd(16, ' ') + ' ' + qtyStr.padStart(2, ' ') + ' ' + totalStr.padStart(10, ' ') + '\n');
      } else {
        addStr(
          name.slice(0, 20).padEnd(20, ' ') +
            ' ' +
            qtyStr.padStart(3, ' ') +
            ' ' +
            priceStr.padStart(8, ' ') +
            ' ' +
            totalStr.padStart(8, ' ') +
            '\n'
        );
      }

      // Modifiers
      if (item.selectedModifiers) {
        for (const mod of item.selectedModifiers) {
          const modName = removeVietnameseTones(mod.optionName);
          addStr(` + ${modName}\n`);
        }
      }
      if (item.itemNote) {
        addStr(` * Ghi chu: ${removeVietnameseTones(item.itemNote)}\n`);
      }
    }

    addStr('-'.repeat(maxChars) + '\n');

    // Totals
    addBytes(0x1b, 0x61, 0x02); // Right align
    addStr(`Tam tinh: ${order.subtotal.toLocaleString('vi-VN')} d\n`);
    if (order.discountPercent > 0) {
      addStr(`Giam gia (${order.discountPercent}%): -${order.discountAmount.toLocaleString('vi-VN')} d\n`);
    }
    if (order.vatPercent > 0) {
      addStr(`Thue VAT (${order.vatPercent}%): +${order.vatAmount.toLocaleString('vi-VN')} d\n`);
    }

    addBytes(0x1b, 0x45, 0x01); // Bold ON
    addBytes(0x1d, 0x21, 0x01); // Double height
    addStr(`TONG CONG: ${order.grandTotal.toLocaleString('vi-VN')} d\n`);
    addBytes(0x1d, 0x21, 0x00);
    addBytes(0x1b, 0x45, 0x00); // Bold OFF

    const payMethodMap: Record<string, string> = {
      cash: 'Tien Mat',
      transfer: 'Chuyen Khoan VietQR',
      card: 'The ATM / POS',
      momo: 'Vi Dien Tu',
    };
    addStr(`Hinh thuc TT: ${payMethodMap[order.paymentMethod || 'cash'] || 'Tien Mat'}\n`);
    if (order.paymentMethod === 'cash' && order.paidAmount) {
      addStr(`Khach dua: ${order.paidAmount.toLocaleString('vi-VN')} d\n`);
      addStr(`Tien tra lai: ${(order.changeAmount || 0).toLocaleString('vi-VN')} d\n`);
    }

    // Center align footer
    addBytes(0x1b, 0x61, 0x01);
    addStr('-'.repeat(maxChars) + '\n');
    addStr('CAM ON VA HEN GAP LAI QUY KHACH!\n');
    addStr('POS Sunmi D2 - CHA CHI BAP F&B\n');

    // Feed lines before cut
    addBytes(0x1d, 0x56, 0x42, 0x03); // GS V 66 3 (Partial Cut with paper feed)
    addBytes(0x0a, 0x0a, 0x0a);
  }

  return new Uint8Array(bytes);
};

/**
 * Print order via USB printer device or Sunmi JS Bridge
 */
export const printOrderUsb = async (
  order: Order,
  storeConfig: StoreConfig,
  copiesCount: number = 2
): Promise<boolean> => {
  // 1. Try Sunmi Native JS Bridge first if on Sunmi POS
  if (isSunmiNativePrinter()) {
    try {
      const p = window.sunmiInnerPrinter;
      if (p) {
        for (let i = 0; i < copiesCount; i++) {
          p.setAlignment(1);
          p.setFontSize(32);
          p.printText(`${storeConfig.storeName}\n`);
          p.setFontSize(22);
          p.printText(`*** LIÊN ${i + 1} ***\n`);
          p.printText(`Mã HD: ${order.id}\n`);
          p.printText(`Tổng tiền: ${order.grandTotal.toLocaleString('vi-VN')} đ\n`);
          p.lineWrap(3);
          p.cutPaper();
        }
        return true;
      }
    } catch (err) {
      console.warn('Lỗi Sunmi Native Printer, fallback sang WebUSB:', err);
    }
  }

  // 2. Try WebUSB active device or reconnect paired device
  if (isWebUsbSupported()) {
    const usbApi = (navigator as any).usb;
    if (!activeUsbDevice && usbApi) {
      const paired: USBDevice[] = await usbApi.getDevices();
      if (paired.length > 0) {
        try {
          await connectToUsbDevice(paired[0]);
        } catch (err) {
          console.warn('Không kết nối lại được thiết bị USB tự động:', err);
        }
      }
    }

    if (activeUsbDevice && activeEndpointNumber !== null) {
      try {
        const buffer = buildEscPosBuffer(order, storeConfig, copiesCount);
        await activeUsbDevice.transferOut(activeEndpointNumber, buffer);
        return true;
      } catch (err: any) {
        console.error('Lỗi khi gửi dữ liệu ESC/POS qua cổng USB:', err);
        throw new Error('Lỗi in USB: ' + (err.message || 'Không thể truyền dữ liệu tới máy in'));
      }
    }
  }

  // 3. Fallback: window.print()
  return false;
};

/**
 * Helper to remove Vietnamese tones for thermal printers without UTF-8 fonts
 */
export const removeVietnameseTones = (str: string): string => {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
};
