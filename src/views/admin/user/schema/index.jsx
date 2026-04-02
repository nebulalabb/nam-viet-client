import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  .regex(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa' })
  .regex(/[a-z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái thường' })
  .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
  .regex(/[\W_]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })

const createUserFormSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' }),
  email: z.string().email({ message: 'Email không hợp lệ' }).optional().or(z.literal('')),
  password: passwordSchema.optional().or(z.literal('')),
  employeeCode: z
    .string()
    .min(3, { message: 'Mã nhân viên phải có ít nhất 3 ký tự' })
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message: 'Mã nhân viên chỉ được chứa chữ cái, số, dấu - và _',
    })
    .optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, { message: 'Số điện thoại không hợp lệ' })
    .optional()
    .or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  cccd: z.string().max(20, { message: 'CCCD không được quá 20 ký tự' }).optional().or(z.literal('')),
  issuedAt: z.string().optional().or(z.literal('')),
  issuedBy: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  roleId: z.number({ required_error: 'Vui lòng chọn vai trò' }).int().positive(),
  warehouseId: z.number().int().positive().optional(),
  status: z.enum(['active', 'inactive', 'locked']).optional().default('active'),
})

const updateUserFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
    .optional(),
  email: z.string().email({ message: 'Email không hợp lệ' }).optional(),
  password: passwordSchema.optional().or(z.literal('')),
  employeeCode: z
    .string()
    .min(3, { message: 'Mã nhân viên phải có ít nhất 3 ký tự' })
    .max(50)
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message: 'Mã nhân viên chỉ được chứa chữ cái, số, dấu - và _',
    })
    .optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, { message: 'Số điện thoại không hợp lệ' })
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().max(255).optional().nullable().or(z.literal('')),
  cccd: z.string().max(20, { message: 'CCCD không được quá 20 ký tự' }).optional().or(z.literal('')),
  issuedAt: z.string().optional().or(z.literal('')),
  issuedBy: z.string().max(100).optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional().nullable().or(z.literal('')),
  dateOfBirth: z.string().optional().nullable().or(z.literal('')),
  roleId: z.number().int().positive().optional(),
  warehouseId: z.number().int().positive().optional().nullable(),
  status: z.enum(['active', 'inactive', 'locked']).optional(),
})

export { createUserFormSchema, updateUserFormSchema }
