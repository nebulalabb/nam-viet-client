import { z } from 'zod'

const createInvoiceSchema = z
  .object({
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
    isPickupOrder: z.boolean().default(true),
    dueDate: z.string().nullable().optional(),
    orderDate: z.string().nullable().optional(),
    recipientName: z.string().optional().nullable(),
    recipientPhone: z.string().optional().nullable(),
    deliveryAddress: z.string().optional().nullable(),
    shippingFee: z.number().min(0, 'Phí vận chuyển phải >= 0').optional().nullable(),
    expectedDeliveryDate: z.string().optional().nullable(),
    requireApproval: z.boolean().default(false),
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
  dueDate: z.string().nullable().optional(),
  orderDate: z.string().nullable().optional(),
  isPickupOrder: z.boolean().default(true),
  recipientName: z.string().optional().nullable(),
  recipientPhone: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  shippingFee: z.number().min(0).optional().nullable(),
  expectedDeliveryDate: z.string().optional().nullable(),
  requireApproval: z.boolean().default(false),
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
