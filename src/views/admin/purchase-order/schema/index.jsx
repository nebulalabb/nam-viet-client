import { z } from 'zod'

const createPurchaseOrderSchema = z.object({
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  orderDate: z.coerce.date({
    required_error: 'Ngày đặt hàng là bắt buộc',
  }),
  expectedDeliveryDate: z.coerce.date({
    required_error: 'Ngày dự kiến giao hàng là bắt buộc',
    invalid_type_error: 'Ngày dự kiến giao hàng là bắt buộc',
  }),
  contractNumber: z.string().optional(),
  note: z.string().max(500).nullable().optional(),
  paymentTerms: z.string().max(500).nullable().optional(),
  status: z.string().nonempty('Trạng thái là bắt buộc'),
  paymentMethod: z.string().nonempty('Bắt buộc'),
  paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
  bankAccount: z.any().nullable(),
  isAutoApprove: z.boolean().default(true).optional(),
})

const updatePurchaseOrderSchema = z.object({
  supplierId: z.string().optional(),
  customerId: z.string().optional(),
  expectedDeliveryDate: z.union([
    z.date({
      invalid_type_error: 'Ngày dự kiến giao hàng là bắt buộc',
      required_error: 'Ngày dự kiến giao hàng là bắt buộc',
    }),
    z.string().min(1, 'Ngày dự kiến giao hàng là bắt buộc')
  ]),
  contractNumber: z.string().optional(),
  note: z.string().max(500).nullable().optional(),
  paymentTerms: z.string().max(500).nullable().optional(),
  paymentMethod: z.string().nonempty('Bắt buộc'),
  paymentNote: z.string().max(190, 'Tối đa 190 ký tự'),
  bankAccount: z.any().nullable(),
})

export { createPurchaseOrderSchema, updatePurchaseOrderSchema }
