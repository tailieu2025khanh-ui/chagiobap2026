import React, { useState } from 'react';
import { StaffMember } from '../types/pos';
import { Users, UserPlus, Search, Edit2, Trash2, CheckCircle, XCircle, Phone, BadgeCheck } from 'lucide-react';

interface StaffManagerProps {
  staffList: StaffMember[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

export const StaffManager: React.FC<StaffManagerProps> = ({ staffList, setStaffList }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    role: 'cashier' | 'manager' | 'kitchen' | 'waiter';
    phone: string;
    status: 'active' | 'inactive';
  }>({
    code: '',
    name: '',
    role: 'cashier',
    phone: '',
    status: 'active',
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormData({
      code: `NV${Math.floor(10 + Math.random() * 90)}`,
      name: '',
      role: 'cashier',
      phone: '',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      code: staff.code,
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      status: staff.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa nhân viên "${name}" khỏi hệ thống?`)) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Vui lòng nhập tên nhân viên và số điện thoại!');
      return;
    }

    if (editingStaff) {
      const editingId = editingStaff.id;
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, code: formData.code, name: formData.name, role: formData.role, phone: formData.phone, status: formData.status }
            : s
        )
      );
    } else {
      const newStaff: StaffMember = {
        id: `st_${Date.now()}`,
        code: formData.code || `NV${Math.floor(10 + Math.random() * 90)}`,
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        status: formData.status,
        createdAt: new Date().toISOString(),
      };
      setStaffList((prev) => [newStaff, ...prev]);
    }
    setIsModalOpen(false);
  };

  const filteredStaff = (staffList || []).filter(
    (s) =>
      (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.phone || '').includes(searchQuery)
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'manager':
        return <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Quản Lý</span>;
      case 'cashier':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Thu Ngân</span>;
      case 'kitchen':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Đầu Bếp</span>;
      case 'waiter':
      default:
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">Phục Vụ</span>;
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F0] p-4 sm:p-6 overflow-y-auto selection:bg-[#5A5A40] selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-2xl p-5 shadow-2xs border border-[#E0E0D6] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#5A5A40]" />
              QUẢN LÝ DANH SÁCH NHÂN VIÊN
            </h2>
            <p className="text-xs text-[#808070] mt-0.5 font-medium">
              Thêm mới, chỉnh sửa thông tin, phân quyền chức vụ và quản lý trạng thái nhân viên quán.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>THÊM NHÂN VIÊN MỚI</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3 rounded-2xl border border-[#E0E0D6] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#808070]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên nhân viên, mã NV hoặc số điện thoại..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-[#E0E0D6] focus:outline-none focus:border-[#5A5A40] bg-[#FAF9F6]"
            />
          </div>
          <span className="text-xs text-[#808070] font-bold px-2">Tong: {filteredStaff.length} nhân viên</span>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl border border-[#E0E0D6] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E0E0D6] text-[#808070] font-bold bg-[#FAF9F6]">
                  <th className="py-3 px-4">Mã NV</th>
                  <th className="py-3 px-4">Họ & Tên Nhân Viên</th>
                  <th className="py-3 px-4">Chức Vụ</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0D6]/60 font-medium">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#FAF9F6] transition-colors">
                    <td className="py-3 px-4 font-bold text-[#5A5A40]">{staff.code}</td>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] text-sm">{staff.name}</td>
                    <td className="py-3 px-4">{getRoleBadge(staff.role)}</td>
                    <td className="py-3 px-4 font-mono text-[#808070]">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#5A5A40]" />
                        {staff.phone}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {staff.status === 'active' ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-700" />
                          Đang Làm Việc
                        </span>
                      ) : (
                        <span className="bg-stone-200 text-stone-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-stone-500" />
                          Đã Nghỉ
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(staff)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[#5A5A40] font-bold transition-all flex items-center gap-1 text-[11px]"
                          title="Sửa nhân viên"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id, staff.name)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-all flex items-center gap-1 text-[11px]"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#808070] font-medium">
                      Chưa có nhân viên nào trong danh sách.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E0E0D6] animate-scaleUp">
            <h3 className="text-base font-bold text-[#1A1A1A] flex items-center gap-2">
              <BadgeCheck className="w-5 h-5 text-[#5A5A40]" />
              {editingStaff ? 'CHỈNH SỬA THÔNG TIN NHÂN VIÊN' : 'THÊM NHÂN VIÊN MỚI'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[#1A1A1A] mb-1">Mã Nhân Viên:</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="NV01"
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono bg-[#FAF9F6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] mb-1">Họ và Tên Nhân Viên:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên nhân viên..."
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] bg-[#FAF9F6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] mb-1">Số Điện Thoại:</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0908 123 456"
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] font-mono bg-[#FAF9F6]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#1A1A1A] mb-1">Chức Vụ:</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] bg-[#FAF9F6] font-bold"
                >
                  <option value="cashier">Thu Ngân (Cashier)</option>
                  <option value="waiter">Phục Vụ (Waiter)</option>
                  <option value="kitchen">Đầu Bếp (Kitchen)</option>
                  <option value="manager">Quản Lý (Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#1A1A1A] mb-1">Trạng Thái Làm Việc:</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-[#E0E0D6] bg-[#FAF9F6] font-bold"
                >
                  <option value="active">Đang Làm Việc (Active)</option>
                  <option value="inactive">Đã Nghỉ Việc (Inactive)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E0E0D6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0E0D6] text-[#808070] font-bold hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#5A5A40] hover:bg-[#4A4A34] text-white font-bold shadow-xs"
                >
                  {editingStaff ? 'Cập Nhật' : 'Tạo Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
