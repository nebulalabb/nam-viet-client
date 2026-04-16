import { z } from 'zod'

const phoneRegex =
  /^(?:\+84|0)(?:2|3|5|7|8|9)[0-9]{8,9}$/

const createSupplierSchema = z.object({
  supplierCode: z.string().optional().or(z.literal('')),
  supplierName: z.string().min(1, { message: 'Tên NCC là bắt buộc' }),
  email: z.string().optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  taxCode: z.string().optional(),
  contactName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().nonempty('Trạng thái là bắt buộc'),
})

const updateSupplierSchema = z.object({
  supplierCode: z.string().optional().or(z.literal('')),
  supplierName: z.string().min(1, { message: 'Tên NCC là bắt buộc' }),
  email: z.string().optional().or(z.literal('')),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  taxCode: z.string().optional(),
  contactName: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().nonempty('Trạng thái là bắt buộc'),
})

const updateSupplierStatusSchema = z.object({
  status: z.string().nonempty('Trạng thái là bắt buộc'),
})

export {
  createSupplierSchema,
  updateSupplierSchema,
  updateSupplierStatusSchema,
}
