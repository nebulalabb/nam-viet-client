import { z } from 'zod'

const createMaterialSchema = z.object({
    materialCode: z.string().min(1, { message: 'Mã nguyên liệu không được để trống' }).max(50, { message: 'Tối đa 50 ký tự' }),
    name: z
        .string()
        .min(1, { message: 'Tên nguyên liệu không được để trống' })
        .max(200, { message: 'Tối đa 200 ký tự' }),
    cost: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
        .refine((val) => !isNaN(val) && val >= 0, { message: 'Giá thành phải là số không âm' }),
    supplierId: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => {
            if (val === null || val === '' || val === undefined) return null
            const num = typeof val === 'string' ? parseInt(val) : val
            return isNaN(num) ? null : num
        })
        .optional()
        .nullable(),
    categoryId: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => {
            if (val === null || val === '' || val === undefined) return null
            const num = typeof val === 'string' ? parseInt(val) : val
            return isNaN(num) ? null : num
        })
        .optional()
        .nullable(),
    unit: z.string().max(50, { message: 'Đơn vị tính tối đa 50 ký tự' }).optional().nullable(),
    materialType: z.string().max(100, { message: 'Loại NL tối đa 100 ký tự' }).optional().nullable(),
    priority: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
        .refine((val) => !isNaN(val) && val >= 0 && val <= 6, { message: 'Độ ưu tiên từ 0 đến 6' })
        .optional()
        .default(0),
    purchaseDate: z.string().optional().nullable(),
    effectiveDate: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
})

const updateMaterialSchema = z.object({
    materialCode: z.string().max(50, { message: 'Tối đa 50 ký tự' }).optional(),
    name: z
        .string()
        .min(1, { message: 'Tên nguyên liệu không được để trống' })
        .max(200, { message: 'Tối đa 200 ký tự' }),
    cost: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
        .refine((val) => !isNaN(val) && val >= 0, { message: 'Giá thành phải là số không âm' }),
    supplierId: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => {
            if (val === null || val === '' || val === undefined) return null
            const num = typeof val === 'string' ? parseInt(val) : val
            return isNaN(num) ? null : num
        })
        .optional()
        .nullable(),
    categoryId: z
        .union([z.string(), z.number(), z.null()])
        .transform((val) => {
            if (val === null || val === '' || val === undefined) return null
            const num = typeof val === 'string' ? parseInt(val) : val
            return isNaN(num) ? null : num
        })
        .optional()
        .nullable(),
    unit: z.string().max(50, { message: 'Đơn vị tính tối đa 50 ký tự' }).optional().nullable(),
    materialType: z.string().max(100, { message: 'Loại NL tối đa 100 ký tự' }).optional().nullable(),
    priority: z
        .union([z.string(), z.number()])
        .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
        .refine((val) => !isNaN(val) && val >= 0 && val <= 6, { message: 'Độ ưu tiên từ 0 đến 6' })
        .optional(),
    purchaseDate: z.string().optional().nullable(),
    effectiveDate: z.string().optional().nullable(),
    imageUrl: z.string().optional().nullable(),
})

export { createMaterialSchema, updateMaterialSchema }
