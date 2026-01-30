import toast from 'react-hot-toast';
import { create } from 'zustand';
import { roleService } from '../infrastructure/api.service';

interface RoleStore {
    roles: any[];
    loading: boolean;
    fetchRoles: () => Promise<void>;
    createRole: (data: any) => Promise<void>;
    updateRole: (id: string, data: any) => Promise<void>;
    deleteRole: (id: string) => Promise<void>;
}

export const useRoleStore = create<RoleStore>((set, get) => ({
    roles: [],
    loading: false,
    fetchRoles: async () => {
        set({ loading: true });
        try {
            const roles = await roleService.getRoles();
            set({ roles });
        } catch (error) {
            // toast.error('Lỗi tải danh sách vai trò');
            console.error(error);
        } finally {
            set({ loading: false });
        }
    },
    createRole: async (data) => {
        try {
            await roleService.createRole(data);
            toast.success('Tạo vai trò thành công');
            get().fetchRoles();
        } catch (error) {
            toast.error('Lỗi tạo vai trò');
            throw error;
        }
    },
    updateRole: async (id, data) => {
        try {
            await roleService.updateRole(id, data);
            toast.success('Cập nhật thành công');
            get().fetchRoles();
        } catch (error) {
            toast.error('Lỗi cập nhật');
            throw error;
        }
    },
    deleteRole: async (id) => {
        try {
            await roleService.deleteRole(id);
            toast.success('Đã xóa vai trò');
            get().fetchRoles();
        } catch (error) {
            toast.error('Lỗi xóa vai trò');
            throw error;
        }
    }
}));
