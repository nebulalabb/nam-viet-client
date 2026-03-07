import { z } from 'zod'

// const createReceiptSchema = z.object({
//   totalAmount: z
//     .union([z.string(), z.number()])
//     .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
//     .refine((val) => !isNaN(val) && val >= 0, {
//       message: 'Số tiền không hợp lệ',
//     }),
//   note: z.string().max(190, 'Tối đa 190 ký tự'),
//   paymentMethod: z.string().nonempty('Bắt buộc'),
//   paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
// })
const createReceiptSchema = z
  .object({
    totalAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val) && val > 0, {
        message: 'Số tiền phải lớn hơn 0',
      }),

    note: z.string().max(190, 'Tối đa 190 ký tự').optional().nullable(),

    paymentMethod: z.string().nonempty('Bắt buộc chọn phương thức thanh toán'),

    paymentNote: z.string().max(190, 'Tối đa 190 ký tự').optional().nullable(),

    bankAccount: z.any().optional().nullable(),



    isDeposit: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'transfer' && !data.bankAccount) {
      ctx.addIssue({
        path: ['bankAccount'],
        message: 'Vui lòng chọn tài khoản nhận tiền',
      })
    }

  })

const createPaymentSchema = z
  .object({
    paymentMethod: z.string().nonempty('Bắt buộc'),
    paymentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      .refine((val) => !isNaN(val) && val > 0, {
        message: 'Số tiền phải lớn hơn 0',
      }),
    status: z.string().nonempty('Bắt buộc'),
    note: z.string().max(190, 'Tối đa 190 ký tự').optional().nullable(),
    paymentNote: z.string().max(190, 'Tối đa 190 ký tự').optional().nullable(),
    bankAccount: z.any().optional().nullable(),
    dueDate: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === 'transfer' && !data.bankAccount) {
      ctx.addIssue({
        path: ['bankAccount'],
        message: 'Vui lòng chọn tài khoản ngân hàng',
      })
    }
    if (data.dueDate && isNaN(Date.parse(data.dueDate))) {
      ctx.addIssue({
        path: ['dueDate'],
        message: 'Hạn chót đóng tiền không hợp lệ',
      })
    }
  })

export { createReceiptSchema, createPaymentSchema }
