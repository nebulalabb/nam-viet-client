import { z } from 'zod'

const phoneRegex = /^\+?\d{1,}$/

const createCustomerSchema = z.object({
  customerCode: z.string().min(1, { message: 'Mã khách hàng không được để trống' }),
  customerName: z.string().min(1, { message: 'Tên khách hàng không được để trống' }),
  phone: z
    .string()
    .min(1, { message: 'Số điện thoại không được để trống' })
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .or(z.literal(''))
    .optional(),
  address: z
    .string()
    .min(1, { message: 'Địa chỉ không được để trống' })
    .max(120, { message: 'Địa chỉ không được vượt quá 120 ký tự' }),
  contactPerson: z
    .string()
    .max(120, { message: 'Người liên hệ không được vượt quá 120 ký tự' })
    .nullable(),
  notes: z
    .string()
    .max(120, { message: 'Ghi chú không được vượt quá 120 ký tự' })
    .nullable(),
  customerType: z
    .enum(['individual', 'company'], {
      message: 'Loại khách hàng không hợp lệ',
    }),
  taxCode: z
    .string()
    .max(120, { message: 'Mã số thuế không được vượt quá 120 ký tự' })
    .nullable(),
  cccd: z
    .string()
    .length(12, { message: 'CCCD phải có đúng 12 số' })
    .regex(/^\d+$/, { message: 'CCCD chỉ được chứa các chữ số' }),
  issuedAt: z.string().nullable(),
  issuedBy: z
    .string()
    .max(255, { message: 'Nơi cấp không được vượt quá 255 ký tự' })
    .nullable(),
  creditLimit: z.coerce.number().min(0, { message: 'Hạn mức công nợ phải lớn hơn hoặc bằng 0' }).optional(),
  rewardPoints: z.coerce.number().min(0, { message: 'Điểm thưởng phải lớn hơn hoặc bằng 0' }).optional(),
  rewardCode: z.string().max(50, { message: 'Mã thưởng không được vượt quá 50 ký tự' }).nullable().optional(),
  assignedUserId: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'blacklisted'], { message: 'Trạng thái không hợp lệ' }).optional(),
})

const updateCustomerSchema = z.object({
  customerName: z.string().min(1, { message: 'Tên khách hàng không được để trống' }),
  phone: z
    .string()
    .min(1, { message: 'Số điện thoại không được để trống' })
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .or(z.literal(''))
    .optional(),
  address: z
    .string()
    .min(1, { message: 'Địa chỉ không được để trống' })
    .max(120, { message: 'Địa chỉ không được vượt quá 120 ký tự' }),
  contactPerson: z
    .string()
    .max(120, { message: 'Người liên hệ không được vượt quá 120 ký tự' })
    .nullable(),
  notes: z
    .string()
    .max(120, { message: 'Ghi chú không được vượt quá 120 ký tự' })
    .nullable(),
  customerType: z
    .enum(['individual', 'company'], {
      message: 'Loại khách hàng không hợp lệ',
    }),
  taxCode: z
    .string()
    .max(120, { message: 'Mã số thuế không được vượt quá 120 ký tự' })
    .nullable(),
  cccd: z
    .string()
    .length(12, { message: 'CCCD phải có đúng 12 số' })
    .regex(/^\d+$/, { message: 'CCCD chỉ được chứa các chữ số' }),
  issuedAt: z.string().nullable(),
  issuedBy: z
    .string()
    .max(255, { message: 'Nơi cấp không được vượt quá 255 ký tự' })
    .nullable(),
  creditLimit: z.coerce.number().min(0, { message: 'Hạn mức công nợ phải lớn hơn hoặc bằng 0' }).optional(),
  rewardPoints: z.coerce.number().min(0, { message: 'Điểm thưởng phải lớn hơn hoặc bằng 0' }).optional(),
  rewardCode: z.string().max(50, { message: 'Mã thưởng không được vượt quá 50 ký tự' }).nullable().optional(),
  assignedUserId: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive', 'blacklisted'], { message: 'Trạng thái không hợp lệ' }).optional(),
})

const updateCustomerStatusSchema = z.object({
  status: z.string({ required_error: 'Vui lòng chọn trạng thái' }),
})

export { createCustomerSchema, updateCustomerSchema, updateCustomerStatusSchema }
