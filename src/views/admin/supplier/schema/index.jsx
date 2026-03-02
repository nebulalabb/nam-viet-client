import { z } from 'zod'

const phoneRegex = /^\+?\d{1,}$/

const createSupplierSchema = z.object({
    supplierCode: z.string().min(1, { message: 'Mã nhà cung cấp không được để trống' }).max(50, { message: 'Tối đa 50 ký tự' }),
    supplierName: z
        .string()
        .min(1, { message: 'Tên nhà cung cấp không được để trống' })
        .max(200, { message: 'Tối đa 200 ký tự' })
        .refine((value) => !/\d/.test(value), {
            message: 'Tên nhà cung cấp không được chứa số',
        }),
    supplierType: z.enum(['local', 'foreign'], { message: 'Loại NCC không hợp lệ' }),
    contactName: z
        .string()
        .max(100, { message: 'Người liên hệ tối đa 100 ký tự' })
        .refine((value) => !value || !/\d/.test(value), {
            message: 'Tên người liên hệ không được chứa số',
        })
        .nullable()
        .optional(),
    phone: z
        .string()
        .refine((value) => !value || phoneRegex.test(value), {
            message: 'Số điện thoại không hợp lệ',
        })
        .nullable()
        .optional(),
    email: z
        .string()
        .email({ message: 'Email không hợp lệ' })
        .or(z.literal(''))
        .nullable()
        .optional(),
    address: z.string().max(255, { message: 'Địa chỉ tối đa 255 ký tự' }).nullable().optional(),
    taxCode: z.string().max(50, { message: 'MST tối đa 50 ký tự' }).nullable().optional(),
    paymentTerms: z.string().max(255, { message: 'Điều khoản tối đa 255 ký tự' }).nullable().optional(),
    notes: z.string().max(500, { message: 'Ghi chú tối đa 500 ký tự' }).nullable().optional(),
    status: z.enum(['active', 'inactive'], { message: 'Trạng thái không hợp lệ' }).optional(),
})

const updateSupplierSchema = z.object({
    supplierName: z
        .string()
        .min(1, { message: 'Tên nhà cung cấp không được để trống' })
        .max(200, { message: 'Tối đa 200 ký tự' })
        .refine((value) => !/\d/.test(value), {
            message: 'Tên nhà cung cấp không được chứa số',
        }),
    supplierType: z.enum(['local', 'foreign'], { message: 'Loại NCC không hợp lệ' }),
    contactName: z
        .string()
        .max(100, { message: 'Người liên hệ tối đa 100 ký tự' })
        .refine((value) => !value || !/\d/.test(value), {
            message: 'Tên người liên hệ không được chứa số',
        })
        .nullable()
        .optional(),
    phone: z
        .string()
        .refine((value) => !value || phoneRegex.test(value), {
            message: 'Số điện thoại không hợp lệ',
        })
        .nullable()
        .optional(),
    email: z
        .string()
        .email({ message: 'Email không hợp lệ' })
        .or(z.literal(''))
        .nullable()
        .optional(),
    address: z.string().max(255, { message: 'Địa chỉ tối đa 255 ký tự' }).nullable().optional(),
    taxCode: z.string().max(50, { message: 'MST tối đa 50 ký tự' }).nullable().optional(),
    paymentTerms: z.string().max(255, { message: 'Điều khoản tối đa 255 ký tự' }).nullable().optional(),
    notes: z.string().max(500, { message: 'Ghi chú tối đa 500 ký tự' }).nullable().optional(),
    status: z.enum(['active', 'inactive'], { message: 'Trạng thái không hợp lệ' }).optional(),
})

const updateSupplierStatusSchema = z.object({
    status: z.enum(['active', 'inactive'], { message: 'Trạng thái không hợp lệ' }),
})

export { createSupplierSchema, updateSupplierSchema, updateSupplierStatusSchema }
