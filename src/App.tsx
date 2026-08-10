import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  ModifierGroup,
  Table,
  Order,
  Shift,
  StoreConfig,
  CartItem,
  StaffMember,
} from './types/pos';
import {
  DEFAULT_STORE_CONFIG,
  INITIAL_MODIFIERS,
  INITIAL_MENU,
  INITIAL_TABLES,
  INITIAL_SHIFT,
  INITIAL_PAST_ORDERS,
  INITIAL_STAFF,
} from './data/initialData';
import { Header, ViewTab } from './components/Header';
import { CashierPOS } from './components/CashierPOS';
import { TableManager } from './components/TableManager';
import { KitchenDisplay } from './components/KitchenDisplay';
import { ReportsAnalytics } from './components/ReportsAnalytics';
import { MenuManager } from './components/MenuManager';
import { ShiftManager } from './components/ShiftManager';
import { StaffManager } from './components/StaffManager';
import { SettingsHardware } from './components/SettingsHardware';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptPrinterModal } from './components/ReceiptPrinterModal';
import { TodayOrdersModal } from './components/TodayOrdersModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { StaffQuizModal } from './components/StaffQuizModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { printOrderUsb, initUsbAutoDetect } from './services/usbPrinterService';

export default function App() {
  // Persistence Helper
  const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        return initialValue;
      }
    });

    useEffect(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(error);
      }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
  };

  // Main App State
  const [activeTab, setActiveTab] = useState<ViewTab>('pos');
  const [storeConfig, setStoreConfig] = useLocalStorage<StoreConfig>('fnb_store_config', DEFAULT_STORE_CONFIG);
  const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>('fnb_menu_items', INITIAL_MENU);
  const [modifierGroups, setModifierGroups] = useLocalStorage<ModifierGroup[]>('fnb_modifier_groups', INITIAL_MODIFIERS);
  const [tables, setTables] = useLocalStorage<Table[]>('fnb_tables', INITIAL_TABLES);
  const [orders, setOrders] = useLocalStorage<Order[]>('fnb_orders', INITIAL_PAST_ORDERS);
  const [shift, setShift] = useLocalStorage<Shift>('fnb_shift', INITIAL_SHIFT);
  const [staffList, setStaffList] = useLocalStorage<StaffMember[]>('fnb_staff_list', INITIAL_STAFF);

  // Cashier Cart & Active Order State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('table');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [vatPercent, setVatPercent] = useState<number>(0);
  const [customerNote, setCustomerNote] = useState<string>('');

  // Payment & Receipt & Today Orders & Google Sheet & Quiz & API Key Modals
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [lastPrintedOrder, setLastPrintedOrder] = useState<Order | null>(null);
  const [isTodayOrdersModalOpen, setIsTodayOrdersModalOpen] = useState<boolean>(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState<boolean>(false);
  const [isStaffQuizModalOpen, setIsStaffQuizModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  // Auto-migrate & Synchronize Store Config & Menu Items across all devices/browsers to CHẢ GIÒ BẮP QUẢNG NGÃI
  useEffect(() => {
    initUsbAutoDetect();

    // 1. Force update Store Config
    setStoreConfig((prev) => ({
      ...prev,
      storeName: 'CHẢ GIÒ BẮP QUẢNG NGÃI',
      address: '87, Hùng Vương, Phường Bà Rịa, TP HCM',
      phone: '0972371722',
      wifiName: 'khanh vi',
      wifiPass: '0914683351',
      accountHolder: 'CHA GIO BAP QUANG NGAI',
      printCopies: prev.printCopies === 1 ? 1 : 2,
      printerType: prev.printerType || 'usb',
    }));

    // 2. Strict menu migration to exact 26 PDF items
    const CURRENT_VERSION = 'v5_pdf_quangngai';
    const storedVersion = localStorage.getItem('fnb_menu_version');

    setMenuItems((prevItems) => {
      const hasThapCam = prevItems.some((i) => i.name === 'Thập cẩm');
      const hasRauCau = prevItems.some((i) => i.name === 'Rau câu');

      if (storedVersion !== CURRENT_VERSION || !hasThapCam || !hasRauCau || prevItems.length !== 26) {
        localStorage.setItem('fnb_menu_version', CURRENT_VERSION);
        return INITIAL_MENU;
      }
      return prevItems;
    });

    // 3. Cross-Tab Real-time Synchronization Listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fnb_menu_items' && e.newValue) {
        try {
          const updatedMenu = JSON.parse(e.newValue);
          setMenuItems(updatedMenu);
        } catch {}
      }
      if (e.key === 'fnb_store_config' && e.newValue) {
        try {
          const updatedConfig = JSON.parse(e.newValue);
          setStoreConfig(updatedConfig);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Sync selected table's order if exists
  useEffect(() => {
    if (selectedTable && selectedTable.currentOrderId) {
      const activeOrder = orders.find((o) => o.id === selectedTable.currentOrderId);
      if (activeOrder && activeOrder.paymentStatus === 'unpaid') {
        setCartItems(activeOrder.items);
        setDiscountPercent(activeOrder.discountPercent || 0);
        setVatPercent(activeOrder.vatPercent || 0);
        setCustomerNote(activeOrder.customerNote || '');
      }
    }
  }, [selectedTable]);

  // Handle Select Table for Order
  const handleSelectTableForOrder = (table: Table) => {
    setSelectedTable(table);
    setOrderType('table');

    if (table.currentOrderId) {
      const activeOrder = orders.find((o) => o.id === table.currentOrderId);
      if (activeOrder && activeOrder.paymentStatus === 'unpaid') {
        setCartItems(activeOrder.items);
        setDiscountPercent(activeOrder.discountPercent);
        setVatPercent(activeOrder.vatPercent);
        setCustomerNote(activeOrder.customerNote || '');
      } else {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }

    setActiveTab('pos');
  };

  // Send Order to Kitchen KDS
  const handleSendToKitchen = () => {
    if (cartItems.length === 0) return;

    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = Math.round((afterDiscount * vatPercent) / 100);
    const grandTotal = afterDiscount + vatAmount;

    let existingOrderIdx = -1;
    if (selectedTable && selectedTable.currentOrderId) {
      existingOrderIdx = orders.findIndex((o) => o.id === selectedTable.currentOrderId);
    }

    const orderId = existingOrderIdx >= 0 ? orders[existingOrderIdx].id : `HD-${1000 + orders.length + 1}`;

    const newOrder: Order = {
      id: orderId,
      orderCode: `POS${1000 + orders.length + 1}`,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      orderType,
      items: cartItems,
      subtotal,
      discountPercent,
      discountAmount,
      vatPercent,
      vatAmount,
      grandTotal,
      paymentStatus: 'unpaid',
      kitchenStatus: 'pending',
      cashierName: shift.cashierName,
      customerNote,
      createdAt: existingOrderIdx >= 0 ? orders[existingOrderIdx].createdAt : new Date().toISOString(),
    };

    if (existingOrderIdx >= 0) {
      const updatedOrders = [...orders];
      updatedOrders[existingOrderIdx] = newOrder;
      setOrders(updatedOrders);
    } else {
      setOrders([newOrder, ...orders]);
    }

    // Update Table status if table order
    if (selectedTable) {
      setTables(
        tables.map((t) =>
          t.id === selectedTable.id
            ? { ...t, status: 'occupied', currentOrderId: orderId }
            : t
        )
      );
    }

    alert(`Đã gửi đơn ${orderId} xuống Bếp & Pha chế chế biến!`);
  };

  // Instant 1-Click Payment & Print when clicking THANH TOÁN (Direct Checkout, 0 Modals)
  const handleOpenPayment = () => {
    if (cartItems.length === 0) return;

    const orderType: OrderType = selectedTable ? 'table' : 'takeaway';
    const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const afterDiscount = subtotal - discountAmount;
    const vatAmount = Math.round((afterDiscount * vatPercent) / 100);
    const grandTotal = afterDiscount + vatAmount;

    let orderId = `HD-${1000 + orders.length + 1}`;
    if (selectedTable && selectedTable.currentOrderId) {
      orderId = selectedTable.currentOrderId;
    }

    const completedOrder: Order = {
      id: orderId,
      orderCode: `POS${1000 + orders.length + 1}`,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      orderType,
      items: cartItems,
      subtotal,
      discountPercent,
      discountAmount,
      vatPercent,
      vatAmount,
      grandTotal,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      kitchenStatus: 'pending',
      cashierName: shift.cashierName,
      customerNote,
      paidAmount: grandTotal,
      changeAmount: 0,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    // Upsert completed order into history
    const existingIdx = orders.findIndex((o) => o.id === completedOrder.id);
    if (existingIdx >= 0) {
      const updated = [...orders];
      updated[existingIdx] = completedOrder;
      setOrders(updated);
    } else {
      setOrders([completedOrder, ...orders]);
    }

    // Release table if associated
    if (completedOrder.tableId) {
      setTables(
        tables.map((t) =>
          t.id === completedOrder.tableId
            ? { ...t, status: 'empty', currentOrderId: undefined }
            : t
        )
      );
    }

    // Update Shift Revenue
    setShift((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + grandTotal,
      totalOrders: prev.totalOrders + 1,
      cashRevenue: prev.cashRevenue + grandTotal,
      closingCashCalculated: prev.closingCashCalculated + grandTotal,
    }));

    // Reset Cart
    setCartItems([]);
    setSelectedTable(null);
    setDiscountPercent(0);
    setVatPercent(0);
    setCustomerNote('');
    setPayingOrder(null);
    setLastPrintedOrder(completedOrder);

    // Instant Direct USB Hardware Print - 0 Modals, 0 Dialogs
    setTimeout(() => {
      printOrderUsb(completedOrder, storeConfig, storeConfig.printCopies || 2);
    }, 50);
  };

  // Pay directly from Table Manager
  const handlePayTableOrder = (order: Order) => {
    setPayingOrder(order);
  };

  // Confirm Payment
  const handleConfirmPayment = (
    method: PaymentMethod,
    paidAmount: number,
    changeAmount: number,
    autoPrint: boolean
  ) => {
    if (!payingOrder) return;

    const completedOrder: Order = {
      ...payingOrder,
      paymentMethod: method,
      paymentStatus: 'paid',
      paidAmount,
      changeAmount,
      completedAt: new Date().toISOString(),
    };

    // Upsert completed order into history
    const existingIdx = orders.findIndex((o) => o.id === completedOrder.id);
    if (existingIdx >= 0) {
      const updated = [...orders];
      updated[existingIdx] = completedOrder;
      setOrders(updated);
    } else {
      setOrders([completedOrder, ...orders]);
    }

    // Release table if associated
    if (completedOrder.tableId) {
      setTables(
        tables.map((t) =>
          t.id === completedOrder.tableId
            ? { ...t, status: 'empty', currentOrderId: undefined }
            : t
        )
      );
    }

    // Update Shift Revenue
    const rev = completedOrder.grandTotal;
    setShift((prev) => ({
      ...prev,
      totalRevenue: prev.totalRevenue + rev,
      totalOrders: prev.totalOrders + 1,
      cashRevenue: method === 'cash' ? prev.cashRevenue + rev : prev.cashRevenue,
      transferRevenue: method === 'transfer' ? prev.transferRevenue + rev : prev.transferRevenue,
      cardRevenue: method === 'card' || method === 'momo' ? prev.cardRevenue + rev : prev.cardRevenue,
      closingCashCalculated: method === 'cash' ? prev.closingCashCalculated + rev : prev.closingCashCalculated,
    }));

    // Reset Cart
    setCartItems([]);
    setSelectedTable(null);
    setDiscountPercent(0);
    setVatPercent(0);
    setCustomerNote('');
    setPayingOrder(null);

    // Auto Print Trigger - In bill trực tiếp 100% qua cổng USB (LOẠI BỎ hoàn toàn bảng chọn in Chrome)
    if (autoPrint) {
      printOrderUsb(completedOrder, storeConfig, storeConfig.printCopies || 2);
    }
  };

  // Update Kitchen Status in KDS
  const handleUpdateKitchenStatus = (orderId: string, status: KitchenStatus) => {
    setOrders(
      orders.map((o) => (o.id === orderId ? { ...o, kitchenStatus: status } : o))
    );
  };

  // Reset to Sample Data
  const handleResetData = () => {
    setStoreConfig(DEFAULT_STORE_CONFIG);
    setMenuItems(INITIAL_MENU);
    setModifierGroups(INITIAL_MODIFIERS);
    setTables(INITIAL_TABLES);
    setOrders(INITIAL_PAST_ORDERS);
    setShift(INITIAL_SHIFT);
    setCartItems([]);
    setSelectedTable(null);
    alert('Đã khôi phục toàn bộ dữ liệu mẫu POS F&B ban đầu thành công!');
  };

  const kitchenPendingCount = orders.filter(
    (o) => o.kitchenStatus === 'pending' || o.kitchenStatus === 'preparing'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F0] font-sans text-[#1A1A1A] antialiased selection:bg-[#5A5A40] selection:text-white">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shift={shift}
        storeConfig={storeConfig}
        kitchenPendingCount={kitchenPendingCount}
        onOpenTodayOrdersModal={() => setIsTodayOrdersModalOpen(true)}
        onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
        onOpenStaffQuizModal={() => setIsStaffQuizModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 flex flex-col overflow-hidden no-print">
        {activeTab === 'pos' && (
          <CashierPOS
            menuItems={menuItems}
            modifierGroups={modifierGroups}
            tables={tables}
            cartItems={cartItems}
            setCartItems={setCartItems}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            orderType={orderType}
            setOrderType={setOrderType}
            discountPercent={discountPercent}
            setDiscountPercent={setDiscountPercent}
            vatPercent={vatPercent}
            setVatPercent={setVatPercent}
            customerNote={customerNote}
            setCustomerNote={setCustomerNote}
            onSendToKitchen={handleSendToKitchen}
            onOpenPayment={handleOpenPayment}
            onOpenTableSelector={() => setActiveTab('tables')}
          />
        )}

        {activeTab === 'tables' && (
          <TableManager
            tables={tables}
            setTables={setTables}
            activeOrders={orders.filter((o) => o.paymentStatus === 'unpaid')}
            onSelectTableForOrder={handleSelectTableForOrder}
            onPayTableOrder={handlePayTableOrder}
          />
        )}

        {activeTab === 'kds' && (
          <KitchenDisplay
            orders={orders}
            onUpdateKitchenStatus={handleUpdateKitchenStatus}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsAnalytics orders={orders} setOrders={setOrders} menuItems={menuItems} />
        )}

        {activeTab === 'menu' && (
          <MenuManager
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            modifierGroups={modifierGroups}
          />
        )}

        {activeTab === 'shift' && (
          <ShiftManager
            shift={shift}
            setShift={setShift}
            storeConfig={storeConfig}
          />
        )}

        {activeTab === 'staff' && (
          <StaffManager
            staffList={staffList}
            setStaffList={setStaffList}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsHardware
            storeConfig={storeConfig}
            setStoreConfig={setStoreConfig}
            onResetData={handleResetData}
            onOpenGoogleSheetsModal={() => setIsGoogleSheetsModalOpen(true)}
          />
        )}
      </main>

      {/* Fast Payment Modal */}
      {payingOrder && (
        <PaymentModal
          order={payingOrder}
          storeConfig={storeConfig}
          isOpen={!!payingOrder}
          onClose={() => setPayingOrder(null)}
          onConfirmPayment={handleConfirmPayment}
        />
      )}

      {/* ESC/POS Thermal Receipt Printer Modal */}
      {(printingOrder || lastPrintedOrder) && (
        <ReceiptPrinterModal
          order={printingOrder || lastPrintedOrder}
          storeConfig={storeConfig}
          isOpen={!!printingOrder}
          onClose={() => setPrintingOrder(null)}
        />
      )}

      {/* Today Bills Archive Modal */}
      <TodayOrdersModal
        orders={orders}
        storeConfig={storeConfig}
        isOpen={isTodayOrdersModalOpen}
        onClose={() => setIsTodayOrdersModalOpen(false)}
      />

      {/* Google Sheets Synchronization Modal */}
      <GoogleSheetsModal
        isOpen={isGoogleSheetsModalOpen}
        onClose={() => setIsGoogleSheetsModalOpen(false)}
        storeConfig={storeConfig}
        setStoreConfig={setStoreConfig}
        setMenuItems={setMenuItems}
        setTables={setTables}
        orders={orders}
      />

      {/* Staff Quiz Learning Minigame Modal */}
      <StaffQuizModal
        isOpen={isStaffQuizModalOpen}
        onClose={() => setIsStaffQuizModalOpen(false)}
        storeConfig={storeConfig}
      />

      {/* Gemini AI API Key Configuration Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}
