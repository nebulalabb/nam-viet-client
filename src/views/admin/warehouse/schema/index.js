import { z } from 'zod'

export const createWarehouseSchema = z.object({
    warehouseCode: z
        .string()
        .min(1, 'Mã kho là bắt buộc')
        .max(50, 'Mã kho quá dài')
        .regex(/^[A-Z0-9-]+$/, 'Mã kho phải là chữ số viết hoa có dấu gạch ngang.')
        .trim(),
    warehouseName: z.string().min(1, 'Tên kho là bắt buộc').max(200, 'Tên kho quá dài').trim(),
    warehouseType: z
        .enum(['raw_material', 'packaging', 'finished_product', 'goods'], {
            errorMap: () => ({ message: 'Loại kho không hợp lệ' })
        }),
    address: z.string().max(255, 'Địa chỉ quá dài').optional().or(z.literal('')),
    city: z.string().max(100, 'Tên thành phố quá dài').optional().or(z.literal('')),
    region: z.string().max(100, 'Tên vùng quá dài').optional().or(z.literal('')),
    description: z.string().max(255, 'Mô tả quá dài').optional().or(z.literal('')),
    managerId: z.number().int().positive('ID người quản lý không hợp lệ').optional().nullable(),
    capacity: z.number().positive('Sức chứa phải là số dương').optional().nullable(),
    status: z.enum(['active', 'inactive']).optional().default('active'),
})

export const updateWarehouseSchema = z.object({
    warehouseCode: z
        .string()
        .max(50, 'Mã kho quá dài')
        .regex(/^[A-Z0-9-]+$/, 'Mã kho phải là chữ số viết hoa có dấu gạch ngang.')
        .trim()
        .optional(),
    warehouseName: z.string().max(200, 'Tên kho quá dài').trim().optional(),
    warehouseType: z.enum(['raw_material', 'packaging', 'finished_product', 'goods']).optional(),
    address: z.string().max(255, 'Địa chỉ quá dài').optional().or(z.literal('')),
    city: z.string().max(100, 'Tên thành phố quá dài').optional().or(z.literal('')),
    region: z.string().max(100, 'Tên vùng quá dài').optional().or(z.literal('')),
    description: z.string().max(255, 'Mô tả quá dài').optional().or(z.literal('')),
    managerId: z.number().int().positive('ID người quản lý không hợp lệ').optional().nullable(),
    capacity: z.number().positive('Sức chứa phải là số dương').optional().nullable(),
    status: z.enum(['active', 'inactive']).optional(),
})

export const updateWarehouseStatusSchema = z.object({
    status: z.enum(['active', 'inactive'], {
        required_error: 'Vui lòng chọn trạng thái',
        invalid_type_error: 'Trạng thái không hợp lệ',
    }),
})
