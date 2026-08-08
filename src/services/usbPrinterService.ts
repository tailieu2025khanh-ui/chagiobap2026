// USB & Sunmi D2 ESC/POS Thermal Printer Service (Rongta RP335UL, Sunmi, JP, XP, Epson, Canon...)

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
    usb?: any;
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
    sunmi?: any;
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
let autoDetectInitialized = false;

/**
 * Format friendly name for connected USB printers (recognizing Rongta RP335UL)
 */
export const formatPrinterName = (device: USBDevice): string => {
  const name = device.productName || '';
  const vidHex = device.vendorId.toString(16).toLowerCase();

  if (name.toUpperCase().includes('RP335') || name.toUpperCase().includes('RONGTA')) {
    return `Máy In Rongta RP335UL (${name || 'USB Thermal'})`;
  }

  // Common Rongta VIDs (0x0483, 0x0dd4, 0x1504, 0x0416, 0x1a86, 0x0fe6)
  if (['0483', '0dd4', '1504', '0416', '1a86', '0fe6'].includes(vidHex)) {
    return name ? `Máy In Rongta RP335UL (${name})` : 'Máy In USB Rongta RP335UL';
  }

  return name || `Máy In USB POS (${vidHex}:${device.productId.toString(16)})`;
};

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
  return typeof window !== 'undefined' && (!!window.sunmiInnerPrinter || !!window.SunmiPrinter || !!(window as any).sunmi);
};

/**
 * Auto-detect Rongta RP335UL printer when USB cable is plugged in (Plug & Play)
 */
export const initUsbAutoDetect = (onDeviceChange?: (deviceName: string | null) => void): void => {
  if (!isWebUsbSupported() || autoDetectInitialized) return;
  autoDetectInitialized = true;

  const usbApi = (navigator as any).usb;

  // Auto connect when USB cable is inserted
  usbApi.addEventListener('connect', async (event: { device: USBDevice }) => {
    console.log('Phát hiện máy in USB cắm vào:', event.device);
    try {
      await connectToUsbDevice(event.device);
      const name = formatPrinterName(event.device);
      if (onDeviceChange) onDeviceChange(name);
    } catch (err) {
      console.warn('Lỗi tự động kết nối máy in USB:', err);
    }
  });

  // Auto handle disconnect
  usbApi.addEventListener('disconnect', (event: { device: USBDevice }) => {
    console.log('Máy in USB đã ngắt kết nối:', event.device);
    if (activeUsbDevice === event.device) {
      activeUsbDevice = null;
      activeEndpointNumber = null;
      activeInterfaceNumber = null;
      if (onDeviceChange) onDeviceChange(null);
    }
  });

  // Check existing paired devices on load
  getConnectedUsbPrinterName().then((name) => {
    if (name && onDeviceChange) onDeviceChange(name);
  });
};

/**
 * Request user to pick a USB Thermal Printer device (Rongta RP335UL, Sunmi, JP, XP, Epson...)
 */
export const requestUsbPrinter = async (): Promise<string | null> => {
  if (!isWebUsbSupported()) {
    throw new Error('Trình duyệt hiện tại không hỗ trợ WebUSB. Hãy sử dụng Google Chrome trên Laptop hoặc Máy POS Sunmi D2.');
  }

  const usbApi = (navigator as any).usb;

  try {
    // Request device with empty filters to allow ALL USB printer models (Rongta RP335UL, JP, XP, Xprinter, Epson, Sunmi, Canon...)
    const device: USBDevice = await usbApi.requestDevice({ filters: [] });
    await connectToUsbDevice(device);
    return formatPrinterName(device);
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return null; // User cancelled
    }
    console.error('Lỗi chọn thiết bị USB:', err);
    throw new Error(err.message || 'Không thể kết nối với cổng USB máy in.');
  }
};

/**
 * Connect & claim interface for a USB device
 */
const connectToUsbDevice = async (device: USBDevice): Promise<void> => {
  try {
    await device.open();
  } catch (openErr: any) {
    if (
      openErr.name === 'SecurityError' ||
      openErr.message?.includes('Access denied') ||
      openErr.message?.includes('already open')
    ) {
      console.warn('Thiết bị USB Rongta RP335UL đã được Windows / Sunmi OS Driver quản lý. Tự động chuyển sang chế độ in Driver Hệ Thống.');
      activeUsbDevice = device;
      activeEndpointNumber = null;
      return;
    }
    throw openErr;
  }

  if (device.configuration === null) {
    try {
      await device.selectConfiguration(1);
    } catch {
      // Ignore if OS already configured interface
    }
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

  activeUsbDevice = device;
  if (targetInterface && targetEndpoint) {
    try {
      await device.claimInterface(targetInterface.interfaceNumber);
      activeInterfaceNumber = targetInterface.interfaceNumber;
      activeEndpointNumber = targetEndpoint.endpointNumber;
    } catch (claimErr) {
      console.warn('Cổng USB đã được quản lý bởi Driver hệ thống, sử dụng fallback in hệ thống:', claimErr);
      activeEndpointNumber = null;
    }
  } else {
    activeEndpointNumber = null;
  }
};

/**
 * Get name of currently connected USB printer
 */
export const getConnectedUsbPrinterName = async (): Promise<string | null> => {
  if (activeUsbDevice) {
    return formatPrinterName(activeUsbDevice);
  }

  if (isWebUsbSupported()) {
    try {
      const usbApi = (navigator as any).usb;
      const paired: USBDevice[] = await usbApi.getDevices();
      if (paired.length > 0) {
        const device = paired[0];
        try {
          await connectToUsbDevice(device);
          return formatPrinterName(device);
        } catch {
          return formatPrinterName(device) + ' (Driver OS)';
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
 * Generate ESC/POS Binary Buffer for an Order (Optimized for Rongta RP335UL)
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
  ];

  // Enforce strictly maximum 2 copies for Sunmi D2 POS / Rongta RP335UL
  const actualCopies = copiesCount === 1 ? 1 : 2;

  for (let copyIdx = 0; copyIdx < actualCopies; copyIdx++) {
    // ESC @ Initialize Printer (Rongta RP335UL ESC/POS Reset)
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
    addStr('Rongta RP335UL - CHA CHI BAP POS\n');

    // Feed lines & Auto Cut command for Rongta RP335UL (GS V 66 3 / GS V 1)
    addBytes(0x1d, 0x56, 0x42, 0x03);
    addBytes(0x0a, 0x0a, 0x0a);
  }

  return new Uint8Array(bytes);
};

/**
 * Print order via USB printer device (Rongta RP335UL / XP / JP), Sunmi JS Bridge, or System Print
 */
export const printOrderUsb = async (
  order: Order,
  storeConfig: StoreConfig,
  copiesCount: number = 2
): Promise<boolean> => {
  const safeCopies = copiesCount === 1 ? 1 : 2;

  // 1. Try WebUSB active device or paired USB printer FIRST (Supports Rongta RP335UL plugged into Sunmi D2 or Laptop)
  if (isWebUsbSupported()) {
    const usbApi = (navigator as any).usb;
    if (!activeUsbDevice && usbApi) {
      try {
        const paired: USBDevice[] = await usbApi.getDevices();
        if (paired.length > 0) {
          await connectToUsbDevice(paired[0]);
        }
      } catch (err) {
        console.warn('Không kết nối lại được thiết bị USB tự động:', err);
      }
    }

    if (activeUsbDevice && activeEndpointNumber !== null) {
      try {
        const buffer = buildEscPosBuffer(order, storeConfig, safeCopies);
        await activeUsbDevice.transferOut(activeEndpointNumber, buffer);
        return true;
      } catch (err: any) {
        console.error('Lỗi khi gửi dữ liệu ESC/POS qua cổng USB Rongta RP335UL:', err);
      }
    }
  }

  // 2. Try Sunmi Native Inner Printer (if inner printer exists and no active external USB Rongta printer claimed)
  if (isSunmiNativePrinter()) {
    try {
      const p = window.sunmiInnerPrinter || (window as any).SunmiPrinter || (window as any).sunmi;
      if (p && typeof p.printText === 'function') {
        for (let i = 0; i < safeCopies; i++) {
          if (p.setAlignment) p.setAlignment(1);
          if (p.setFontSize) p.setFontSize(32);
          if (p.printText) p.printText(`${storeConfig.storeName}\n`);
          if (p.setFontSize) p.setFontSize(22);
          if (p.printText) p.printText(`*** LIÊN ${i + 1} ***\n`);
          if (p.printText) p.printText(`Mã HD: ${order.id}\n`);
          if (p.printText) p.printText(`Tổng tiền: ${order.grandTotal.toLocaleString('vi-VN')} đ\n`);
          if (p.lineWrap) p.lineWrap(3);
          if (p.cutPaper) p.cutPaper();
        }
        return true;
      }
    } catch (err) {
      console.warn('Lỗi Sunmi Native Printer, fallback sang System Print:', err);
    }
  }

  // 3. Fallback: window.print() (System Print Driver for Rongta RP335UL / Canon / JP / XP)
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
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỡ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
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
