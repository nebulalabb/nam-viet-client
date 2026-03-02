import { z } from 'zod'

const createCategorySchema = z.object({
    categoryCode: z
        .string()
        .min(1, { message: 'Mã danh mục không được để trống' })
        .max(50, { message: 'Mã danh mục không được vượt quá 50 ký tự' })
        .regex(/^[A-Z0-9-]+$/, { message: 'Mã danh mục chỉ chứa chữ in hoa, số và dấu gạch ngang' }),
    categoryName: z
        .string()
        .min(1, { message: 'Tên danh mục không được để trống' })
        .max(200, { message: 'Tên danh mục không được vượt quá 200 ký tự' }),
    slug: z
        .string()
        .min(1, { message: 'Slug không được để trống' })
        .max(200, { message: 'Slug không được vượt quá 200 ký tự' })
        .regex(/^[a-z0-9-]+$/, { message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' }),
    parentId: z.coerce.number().positive({ message: 'Danh mục cha không hợp lệ' }).nullable().optional(),
    description: z.string().max(500, { message: 'Mô tả không được vượt quá 500 ký tự' }).nullable().optional(),
    status: z.enum(['active', 'inactive'], { message: 'Trạng thái không hợp lệ' }).optional().default('active'),
})

const updateCategorySchema = z.object({
    categoryCode: z
        .string()
        .max(50, { message: 'Mã danh mục không được vượt quá 50 ký tự' })
        .regex(/^[A-Z0-9-]+$/, { message: 'Mã danh mục chỉ chứa chữ in hoa, số và dấu gạch ngang' })
        .optional(),
    categoryName: z
        .string()
        .min(1, { message: 'Tên danh mục không được để trống' })
        .max(200, { message: 'Tên danh mục không được vượt quá 200 ký tự' }),
    slug: z
        .string()
        .min(1, { message: 'Slug không được để trống' })
        .max(200, { message: 'Slug không được vượt quá 200 ký tự' })
        .regex(/^[a-z0-9-]+$/, { message: 'Slug chỉ chứa chữ thường, số và dấu gạch ngang' }),
    parentId: z.coerce.number().positive({ message: 'Danh mục cha không hợp lệ' }).nullable().optional(),
    description: z.string().max(500, { message: 'Mô tả không được vượt quá 500 ký tự' }).nullable().optional(),
    status: z.enum(['active', 'inactive'], { message: 'Trạng thái không hợp lệ' }).optional().default('active'),
})

const updateCategoryStatusSchema = z.object({
    status: z.string({ required_error: 'Vui lòng chọn trạng thái' }),
})

export { createCategorySchema, updateCategorySchema, updateCategoryStatusSchema }
