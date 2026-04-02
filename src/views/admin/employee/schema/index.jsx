import * as z from 'zod'

export const createUserSchema = z.object({
    employeeCode: z
        .string()
        .min(3, { message: 'Mã nhân viên phải có ít nhất 3 ký tự' })
        .max(50, { message: 'Mã nhân viên không được vượt quá 50 ký tự' })
        .regex(/^[a-zA-Z0-9-_]+$/, { message: 'Mã nhân viên chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' }),
    fullName: z
        .string()
        .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
        .max(200, { message: 'Họ và tên không được vượt quá 200 ký tự' }),
    email: z.string().email({ message: 'Email không hợp lệ' }).optional().or(z.literal('')),
    phone: z
        .string()
        .regex(/^[0-9+\-\s()]+$/, { message: 'Định dạng số điện thoại không hợp lệ' })
        .max(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' })
        .optional()
        .or(z.literal('')),
    password: z
        .string()
        .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
        .regex(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa' })
        .regex(/[a-z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái thường' })
        .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })
        .optional()
        .or(z.literal('')),
    roleId: z.coerce.number().min(1, { message: 'Vui lòng chọn chức vụ' }),
    status: z.string().default('active'),
})

export const updateUserSchema = z.object({
    employeeCode: z
        .string()
        .min(3, { message: 'Mã nhân viên phải có ít nhất 3 ký tự' })
        .max(50, { message: 'Mã nhân viên không được vượt quá 50 ký tự' })
        .regex(/^[a-zA-Z0-9-_]+$/, { message: 'Mã nhân viên chỉ được chứa chữ cái, số, dấu gạch ngang và gạch dưới' })
        .optional()
        .or(z.literal('')),
    fullName: z
        .string()
        .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự' })
        .max(200, { message: 'Họ và tên không được vượt quá 200 ký tự' })
        .optional()
        .or(z.literal('')),
    email: z
        .string()
        .email({ message: 'Email không hợp lệ' })
        .optional()
        .or(z.literal('')),
    phone: z
        .string()
        .regex(/^[0-9+\-\s()]+$/, { message: 'Định dạng số điện thoại không hợp lệ' })
        .max(20, { message: 'Số điện thoại không được vượt quá 20 ký tự' })
        .optional()
        .or(z.literal('')),
    password: z
        .string()
        .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
        .regex(/[A-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa' })
        .regex(/[a-z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái thường' })
        .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một số' })
        .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { message: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' })
        .optional()
        .or(z.literal('')),
    roleId: z.coerce.number().min(1, { message: 'Vui lòng chọn chức vụ' }).optional(),
    status: z.string().optional(),
})
