import { z } from 'zod'

const phoneRegex =
  /^(?:\+84|0)(?:2|3|5|7|8|9)[0-9]{8,9}$/

const passwordSchema = z
  .string()
  .min(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
  .regex(/[A-Z]/, {
    message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa',
  })
  .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
  .regex(/[\W_]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })

const createUserFormSchema = z.object({
  fullName: z.string().min(1, { message: 'Không được để trống' }),
  password: passwordSchema,
  roleId: z.string().min(1, { message: 'Không được để trống' }),
  employeeCode: z.string().optional(),
  username: z.string().optional(),
  phone: z
    .string()
    .nullable()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  bankCode: z.string().optional(),
  bankName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  status: z.string().min(1, { message: 'Không được để trống' }),
})

const updateUserFormSchema = z.object({
  fullName: z.string().min(1, { message: 'Không được để trống' }),
  username: z.string().optional(),
  roleId: z.string().min(1, { message: 'Không được để trống' }),
  employeeCode: z.string().optional(),
  phone: z
    .string()
    .nullable()
    .refine((value) => !value || phoneRegex.test(value), {
      message: 'Số điện thoại không hợp lệ',
    }),
  bankCode: z.string().optional(),
  bankName: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  status: z.string().min(1, { message: 'Không được để trống' }),
})
export { createUserFormSchema, updateUserFormSchema }
