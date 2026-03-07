import { z } from 'zod'

const createInvoiceSchema = z
  .object({
    schoolId: z.string().nullable(),
    customerId: z.string().optional().nullable(),
    status: z.string().nonempty('Trạng thái là bắt buộc'),
    note: z.string().max(120).nullable(),
    revenueSharing: z
      .union([
        z.null(),
        z.object({
          ratio: z.union([z.string().optional(), z.null()]),
          userId: z.union([z.string().optional(), z.null()]),
        }),
      ])
      .optional(),
    paymentMethod: z.string().nonempty('Bắt buộc'),
    paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
    transactionType: z.enum(['RETAIL', 'WHOLESALE']).default('RETAIL'),
    dueDate: z.string().nullable().optional(),
    orderDate: z.string().nullable().optional(),
  })

const updateInvoiceSchema = z.object({
  schoolId: z.string().nullable(),
  customerId: z.string().optional().nullable(),
  note: z.string().max(120).nullable(),
  revenueSharing: z
    .union([
      z.null(),
      z.object({
        ratio: z.union([z.string().optional(), z.null()]),
        userId: z.union([z.string().optional(), z.null()]),
      }),
    ])
    .optional(),
  paymentMethod: z.string().nonempty('Bắt buộc'),
  paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
  dueDate: z.string().nullable().optional(),
  orderDate: z.string().nullable().optional(),
})

const createOtherExpensesSchema = z.object({
  price: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((val) => !isNaN(val), {
      message: 'Giá phải là số',
    }),
  description: z.string().max(100000, { message: 'Tối đa 100000' }).nullable(),
})

const createCreditNoteSchema = z.object({
  note: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
})

const updateCreditNoteSchema = z.object({
  note: z.string().optional(),
})

export {
  createInvoiceSchema,
  createOtherExpensesSchema,
  updateInvoiceSchema,
  createCreditNoteSchema,
  updateCreditNoteSchema,
}
