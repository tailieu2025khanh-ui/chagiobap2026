import React, { useState, useRef } from 'react';
import { MenuItem, CategoryType, ModifierGroup } from '../types/pos';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Image as ImageIcon,
  Upload,
  Camera,
  Sparkles,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';

interface MenuManagerProps {
  menuItems: MenuItem[];
  setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  modifierGroups: ModifierGroup[];
}

const PRESET_SAMPLE_IMAGES = [
  { label: '🌽 Chả Giò Bắp Quảng Ngãi', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&auto=format&fit=crop&q=80' },
  { label: '🐟 Chả Giò Cá', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=400&auto=format&fit=crop&q=80' },
  { label: '🦐 Chả Giò Tôm', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80' },
  { label: '🥩 Chả Giò Thịt', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80' },
  { label: '🍢 Nem Nướng Quảng Ngãi', url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&auto=format&fit=crop&q=80' },
  { label: '🌿 Bò Lá Lốt', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80' },
  { label: '🥞 Bánh Xèo Miền Trung', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&auto=format&fit=crop&q=80' },
  { label: '🥟 Bánh Khọt Giòn Rụm', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80' },
  { label: '🍜 Bún Đậu Mắm Tôm', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80' },
  { label: '🌯 Gỏi Cuốn Tôm Thịt', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80' },
  { label: '🍺 Bia Ướp Lạnh', url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&auto=format&fit=crop&q=80' },
  { label: '🥤 Nước Ngọt Coca/Pepsi', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&auto=format&fit=crop&q=80' },
  { label: '🍹 Trà Tắc Khổng Lồ', url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80' },
  { label: '🥤 Nước Bí Đao Thanh Mát', url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=80' },
  { label: '🥛 Sữa Đậu Xanh / Đậu Nành', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&auto=format&fit=crop&q=80' },
  { label: '⚡ Bò Húc RedBull', url: 'https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=400&auto=format&fit=crop&q=80' },
  { label: '💧 Nước Suối Tinh Khiết', url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80' },
];

/**
 * Process Resized Image Canvas for Perfect Dish Frame Fitting
 */
const processResizedImageCanvas = (
  imageUrl: string,
  zoomScale: number,
  fitMode: 'cover' | 'contain' | 'fill',
  rotationDeg: number
): Promise<string> => {
  return new Promise((resolve) => {
    if (zoomScale === 100 && fitMode === 'cover' && rotationDeg === 0) {
      return resolve(imageUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const canvasSize = 400;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(imageUrl);

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvasSize, canvasSize);

      ctx.save();
      ctx.translate(canvasSize / 2, canvasSize / 2);
      ctx.rotate((rotationDeg * Math.PI) / 180);

      const scale = zoomScale / 100;
      let drawWidth = canvasSize * scale;
      let drawHeight = canvasSize * scale;

      const imgAspect = img.width / img.height;
      if (fitMode === 'contain') {
        if (imgAspect > 1) {
          drawWidth = canvasSize * scale;
          drawHeight = (canvasSize / imgAspect) * scale;
        } else {
          drawHeight = canvasSize * scale;
          drawWidth = (canvasSize * imgAspect) * scale;
        }
      } else if (fitMode === 'cover') {
        if (imgAspect > 1) {
          drawHeight = canvasSize * scale;
          drawWidth = (canvasSize * imgAspect) * scale;
        } else {
          drawWidth = canvasSize * scale;
          drawHeight = (canvasSize / imgAspect) * scale;
        }
      }

      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      try {
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      } catch {
        resolve(imageUrl);
      }
    };
    img.onerror = () => resolve(imageUrl);
    img.src = imageUrl;
  });
};

export const MenuManager: React.FC<MenuManagerProps> = ({
  menuItems,
  setMenuItems,
  modifierGroups,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Fit & Zoom Customization States
  const [imageZoomScale, setImageZoomScale] = useState<number>(100);
  const [imageFitMode, setImageFitMode] = useState<'cover' | 'contain' | 'fill'>('cover');
  const [imageRotation, setImageRotation] = useState<number>(0);
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);

  const [formData, setFormData] = useState<Partial<MenuItem>>({
    sku: '',
    name: '',
    category: 'mon-an',
    subcategory: 'Món đặc sản',
    price: 45000,
    image: PRESET_SAMPLE_IMAGES[0].url,
    isAvailable: true,
    isBestSeller: false,
    description: '',
    modifierGroupIds: ['mod_spicy'],
  });

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleAvailable = (id: string) => {
    setMenuItems(
      menuItems.map((item) =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa món này khỏi thực đơn?')) {
      setMenuItems(menuItems.filter((i) => i.id !== id));
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      sku: `FOOD${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      category: 'mon-an',
      subcategory: 'Món đặc sản',
      price: 45000,
      image: PRESET_SAMPLE_IMAGES[0].url,
      isAvailable: true,
      isBestSeller: false,
      description: '',
      modifierGroupIds: ['mod_spicy'],
    });
    setImageZoomScale(100);
    setImageFitMode('cover');
    setImageRotation(0);
    setIsCreating(true);
    setEditingItem(null);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setFormData({ ...item });
    setImageZoomScale(100);
    setImageFitMode('cover');
    setImageRotation(0);
    setEditingItem(item);
    setIsCreating(false);
  };

  // Upload image file from device (Laptop/POS/Phone)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa 8MB. Vui lòng chọn file nhỏ hơn!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFormData((prev) => ({
          ...prev,
          image: event.target?.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Image Change directly from Table Row
  const handleDirectQuickImageUpload = (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Dung lượng ảnh tối đa 8MB. Vui lòng chọn file nhỏ hơn!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setMenuItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, image: dataUrl } : item))
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Vui lòng điền đầy đủ tên món và đơn giá!');
      return;
    }

    setIsProcessingImage(true);

    // Process canvas scale & fit if zoom was adjusted
    let finalImageUrl = formData.image || PRESET_SAMPLE_IMAGES[0].url;
    try {
      finalImageUrl = await processResizedImageCanvas(
        finalImageUrl,
        imageZoomScale,
        imageFitMode,
        imageRotation
      );
    } catch {
      // Fallback if canvas process throws
    } finally {
      setIsProcessingImage(false);
    }

    if (isCreating) {
      const newItem: MenuItem = {
        id: `f_${Date.now()}`,
        sku: formData.sku || `FOOD${Math.floor(10 + Math.random() * 90)}`,
        name: formData.name || '',
        category: formData.category as CategoryType,
        subcategory: formData.subcategory || 'Chung',
        price: Number(formData.price) || 0,
        image: finalImageUrl,
        isAvailable: formData.isAvailable ?? true,
        isBestSeller: formData.isBestSeller ?? false,
        description: formData.description || '',
        modifierGroupIds: formData.modifierGroupIds || [],
      };
      setMenuItems([newItem, ...menuItems]);
    } else if (editingItem) {
      setMenuItems(
        menuItems.map((item) =>
          item.id === editingItem.id
            ? ({ ...item, ...formData, image: finalImageUrl } as MenuItem)
            : item
        )
      );
    }

    setIsCreating(false);
    setEditingItem(null);
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] p-4 sm:p-6 overflow-y-auto selection:bg-[#5A5A40] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-[#E0E0D6] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5A5A40]" />
              QUẢN LÝ THỰC ĐƠN & TÙY CHỈNH HÌNH ẢNH MÓN (CROP / ZOOM / SCALE)
            </h2>
            <p className="text-xs text-[#808070] mt-0.5 font-medium">
              Chả Giò Bắp Quảng Ngãi - Tùy chỉnh phóng to/thu nhỏ ảnh to nhỏ vừa khung, tải ảnh từ máy và lưu thực đơn.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>THÊM MÓN MỚI</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E0E0D6]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#808070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên món ăn, đồ uống hoặc SKU..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-[#E0E0D6] focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['all', 'mon-an', 'nuoc-uong', 'combo'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'bg-[#FAF9F6] border border-[#E0E0D6] text-[#808070] hover:bg-[#F0F0E8]'
                }`}
              >
                {cat === 'all'
                  ? 'Tất cả món'
                  : cat === 'mon-an'
                  ? 'Món ăn'
                  : cat === 'nuoc-uong'
                  ? 'Đồ uống'
                  : 'Combo'}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Table */}
        <div className="bg-white rounded-2xl border border-[#E0E0D6] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E0E0D6] text-[#808070] font-bold bg-[#FAF9F6]">
                  <th className="py-3 px-4">Ảnh & Tên Món</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Phân Loại</th>
                  <th className="py-3 px-4">Đơn Giá</th>
                  <th className="py-3 px-4 text-center">Trạng Thái Kho</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0D6]/60 font-medium">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {/* Interactive Image with Quick Camera Upload Overlay */}
                        <div className="relative group w-14 h-14 rounded-xl overflow-hidden border border-[#E0E0D6] shrink-0 bg-stone-100 shadow-2xs">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <label
                            className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold gap-0.5"
                            title="Bấm để đổi/chỉnh ảnh ngay"
                          >
                            <Camera className="w-4 h-4 text-amber-300" />
                            <span>Đổi Ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDirectQuickImageUpload(item.id, e)}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <p className="font-bold text-[#1A1A1A] text-xs flex items-center gap-1.5">
                            {item.name}
                            {item.isBestSeller && (
                              <span className="bg-[#5A5A40] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                HOT
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[#808070] line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#808070]">{item.sku}</td>
                    <td className="py-3 px-4">
                      <span className="bg-[#FAF9F6] border border-[#E0E0D6] text-[#1A1A1A] px-2.5 py-1 rounded-lg text-[10px] font-bold">
                        {item.category === 'mon-an'
                          ? 'Món Ăn'
                          : item.category === 'nuoc-uong'
                          ? 'Đồ Uống'
                          : 'Combo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#5A5A40] text-sm">
                      {item.price.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailable(item.id)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all inline-flex items-center gap-1 ${
                          item.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {item.isAvailable ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-emerald-700" />
                            <span>Còn Bán</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-700" />
                            <span>Hết Hàng</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#F5F5F0] border border-[#E0E0D6] text-[#1A1A1A] font-bold text-[11px] flex items-center gap-1 transition-colors"
                          title="Sửa thông tin & chỉnh ảnh món"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#5A5A40]" />
                          <span>Sửa / Đổi Ảnh</span>
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal with Enhanced Image Upload & Zoom/Scale Customizer */}
      {(isCreating || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C2C24]/60 backdrop-blur-xs p-4 animate-fadeIn">
          <form
            onSubmit={handleSaveItem}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5 border border-[#E0E0D6]"
          >
            <div className="flex items-center justify-between border-b border-[#E0E0D6] pb-3">
              <h3 className="font-extrabold text-base text-[#1A1A1A] flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#5A5A40]" />
                <span>{isCreating ? 'THÊM MÓN MỚI VÀO THỰC ĐƠN' : `THAY ĐỔI THÔNG TIN & HÌNH ẢNH: ${editingItem?.name}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
                className="text-[#808070] hover:text-[#1A1A1A]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* IMAGE SELECTION & INTERACTIVE ZOOM/FIT CUSTOMIZER BOX */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E0E0D6] space-y-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-[#1A1A1A] flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#5A5A40]" />
                  <span>CẤU HÌNH & TÙY CHỈNH HÌNH ẢNH MÓN (*):</span>
                </label>
                <span className="text-[11px] text-[#808070] font-medium">Tự động xẻ / chỉnh ảnh vừa khung</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Live Interactive Preview Box with Zoom & Rotation */}
                <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#5A5A40] shadow-md shrink-0 bg-stone-100 relative group flex items-center justify-center">
                  <img
                    src={formData.image || PRESET_SAMPLE_IMAGES[0].url}
                    alt="Preview món"
                    style={{
                      transform: `scale(${imageZoomScale / 100}) rotate(${imageRotation}deg)`,
                      objectFit: imageFitMode,
                    }}
                    className="w-full h-full transition-transform duration-150"
                  />
                  <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {imageZoomScale}%
                  </div>
                  <div className="absolute inset-0 bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                    <span>Khung Vuông POS</span>
                  </div>
                </div>

                {/* Upload & Scale Options */}
                <div className="flex-1 space-y-3 w-full">
                  {/* File Upload Button */}
                  <label className="px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                    <Upload className="w-4 h-4" />
                    <span>📸 Tải Ảnh Mới Từ Máy Tính / POS / Phone</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </label>

                  {/* Range Slider for Zooming Image Scale */}
                  <div className="bg-white p-2.5 rounded-xl border border-[#E0E0D6] space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1A1A1A]">
                      <span className="flex items-center gap-1">
                        <ZoomIn className="w-3.5 h-3.5 text-[#5A5A40]" />
                        Thu nhỏ / Phóng to ảnh:
                      </span>
                      <span className="text-[#5A5A40] font-mono text-xs">{imageZoomScale}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageZoomScale(Math.max(50, imageZoomScale - 10))}
                        className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#E0E0D6] font-bold text-xs hover:bg-[#E0E0D6] flex items-center justify-center shrink-0"
                        title="Thu nhỏ"
                      >
                        <ZoomOut className="w-3.5 h-3.5 text-[#1A1A1A]" />
                      </button>

                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="5"
                        value={imageZoomScale}
                        onChange={(e) => setImageZoomScale(Number(e.target.value))}
                        className="flex-1 accent-[#5A5A40] h-2 bg-[#E0E0D6] rounded-lg cursor-pointer"
                      />

                      <button
                        type="button"
                        onClick={() => setImageZoomScale(Math.min(200, imageZoomScale + 10))}
                        className="w-7 h-7 rounded-lg bg-[#FAF9F6] border border-[#E0E0D6] font-bold text-xs hover:bg-[#E0E0D6] flex items-center justify-center shrink-0"
                        title="Phóng to"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-[#1A1A1A]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setImageZoomScale(100);
                          setImageFitMode('cover');
                          setImageRotation(0);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#FAF9F6] border border-[#E0E0D6] text-[10px] font-bold text-[#808070] hover:bg-[#E0E0D6] shrink-0 flex items-center gap-1"
                        title="Reset 100%"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Đặt lại</span>
                      </button>
                    </div>
                  </div>

                  {/* Object Fit & Rotation Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-[#1A1A1A]">Kiểu vừa khung:</span>
                    <button
                      type="button"
                      onClick={() => setImageFitMode('cover')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        imageFitMode === 'cover'
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                          : 'bg-white text-[#1A1A1A] border-[#E0E0D6] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      Phủ Kín (Cover)
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageFitMode('contain')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        imageFitMode === 'contain'
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                          : 'bg-white text-[#1A1A1A] border-[#E0E0D6] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      Vừa Đủ (Contain)
                    </button>

                    <button
                      type="button"
                      onClick={() => setImageRotation((prev) => (prev + 90) % 360)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#E0E0D6] bg-white hover:bg-[#FAF9F6] text-[#1A1A1A] flex items-center gap-1"
                    >
                      <RotateCw className="w-3 h-3 text-[#5A5A40]" />
                      <span>Xoay 90°</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Image URL input */}
              <div>
                <span className="text-[11px] font-semibold text-[#808070] block mb-1">Hoặc dán Link ảnh URL trực tiếp từ mạng:</span>
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono text-xs bg-white focus:outline-hidden focus:border-[#5A5A40]"
                />
              </div>

              {/* Preset Sample Gallery for Chả Giò Bắp Quảng Ngãi */}
              <div className="pt-2 border-t border-[#E0E0D6]">
                <span className="text-[11px] font-bold text-[#1A1A1A] block mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Hoặc chọn nhanh từ kho ảnh thực đơn Quảng Ngãi gợi ý sẵn:</span>
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {PRESET_SAMPLE_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image: preset.url });
                        setImageZoomScale(100);
                        setImageFitMode('cover');
                        setImageRotation(0);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                        formData.image === preset.url
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40] shadow-2xs'
                          : 'bg-white text-[#1A1A1A] border-[#E0E0D6] hover:bg-[#F0F0E8]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Tên Món (*):</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Chả giò bắp Quảng Ngãi..."
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#1A1A1A] focus:outline-hidden focus:border-[#5A5A40] bg-[#FAF9F6]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Mã SKU / Code:</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Đơn Giá (VNĐ) (*):</label>
                  <input
                    type="number"
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#5A5A40] text-sm bg-[#FAF9F6]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Nhóm Thực Thể:</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as CategoryType })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                  >
                    <option value="mon-an">Món Ăn</option>
                    <option value="nuoc-uong">Đồ Uống</option>
                    <option value="combo">Combo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Nhóm Nhỏ (Subcategory):</label>
                  <input
                    type="text"
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder="Món đặc sản, Món nướng, Giải khát..."
                    className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#1A1A1A] mb-1">Mô Tả Ngắn:</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-medium bg-[#FAF9F6]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1A1A1A]">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller || false}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-4 h-4 rounded text-[#5A5A40] focus:ring-[#5A5A40]"
                  />
                  <span>Món Bán Chạy (HOT)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#1A1A1A]">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable ?? true}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-700"
                  />
                  <span>Sẵn Sàng Bán (In Stock)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E0E0D6]">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0D6] font-bold text-[#808070] hover:bg-[#FAF9F6] text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isProcessingImage}
                className="px-5 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                {isProcessingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang Xử Lý Ảnh...</span>
                  </>
                ) : (
                  <span>LƯU MÓN VÀ HÌNH ẢNH</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
