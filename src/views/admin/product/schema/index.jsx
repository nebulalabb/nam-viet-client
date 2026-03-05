// schema.js
import { z } from 'zod'

const dateString = z.string().or(z.date())

// NEW: helper parse number (support "1,000")
const parseNumber = (val) => {
  if (val === null || val === undefined || val === '') return NaN
  if (typeof val === 'number') return val
  const cleaned = String(val).replace(/,/g, '').trim()
  return cleaned === '' ? NaN : Number(cleaned)
}

// NEW: Unit conversion schema (current DB design)
// Meaning: 1 (base unit) = conversionFactor * unitId
const unitConversionSchema = z.object({
  unitId: z.string().nullable().optional(),
  conversionFactor: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((val) => parseNumber(val)),
})

const baseCreateSchema = z.object({
  taxIds: z
    .array(z.union([z.string(), z.number()]))
    .nullable()
    .default([]),

  attributeIdsWithValue: z
    .array(
      z
        .object({
          attributeId: z.string().nullable(),
          value: z.string().nullable(),
        })
        .refine(
          (data) =>
            !data.attributeId || (data.value !== null && data.value !== ''),
          {
            message: 'Giá trị là bắt buộc khi thuộc tính tồn tại',
            path: ['value'],
          },
        ),
    )
    .min(1, 'Cần ít nhất một thuộc tính'),

  // NEW: unit conversions (optional, allow empty rows in UI)
  unitConversions: z.array(unitConversionSchema).optional().default([]),

  categoryId: z.string().nonempty('Danh mục là bắt buộc'),
  supplierId: z.string().nonempty('Nhà cung cấp là bắt buộc'),
  unitId: z.string().nonempty('Đơn vị là bắt buộc'),

  price: z.union([z.string(), z.number()]).optional(),

  name: z.string().nonempty('Tên là bắt buộc'),
  description: z.string().nullable(),
  note: z.string().nullable(),
  type: z.string().nonempty('Loại là bắt buộc'),
  // source: z.string().nonempty('Nguồn là bắt buộc'),

  // salaryCoefficient: z.object({
  //   coefficient: z
  //     .union([z.string(), z.number()])
  //     .transform((val) => parseNumber(val))
  //     .refine((val) => !isNaN(val) && val >= 0, {
  //       message: 'Hệ số phải là số và lớn hơn hoặc bằng 0',
  //     }),
  //   type: z.string().nonempty('Loại lương là bắt buộc'),
  //   effectiveDate: dateString,
  // }),

  image: z.instanceof(File),
  hasExpiry: z.boolean().optional(),
  code: z.string().optional(),

  applyWarranty: z.boolean().default(false),
  warrantyPolicy: z.any().optional(), // validate bằng superRefine

  basePrice: z.union([z.string(), z.number()]).optional(), // giá gốc
  manageSerial: z.boolean().default(false), // quản lý serial

  // Price Sync fields
  syncEnabled: z.boolean().optional().default(false),
  syncExternalCode: z.string().optional().nullable(),
})

const createProductSchema = baseCreateSchema.superRefine((data, ctx) => {
  // =========================
  // Warranty validation
  // =========================
  if (data.applyWarranty) {
    if (!data.warrantyPolicy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Thông tin bảo hành là bắt buộc',
        path: ['warrantyPolicy'],
      })
    } else {
      const wp = data.warrantyPolicy

      if (!wp.periodMonths || Number(wp.periodMonths) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Số tháng phải lớn hơn 0',
          path: ['warrantyPolicy', 'periodMonths'],
        })
      }

      const cost = parseNumber(wp.warrantyCost)
      if (isNaN(cost) || cost < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Chi phí không hợp lệ',
          path: ['warrantyPolicy', 'warrantyCost'],
        })
      }
    }
  }

  // =========================
  // Unit conversion validation
  // =========================
  // Accept empty rows (UI) but validate rows where user typed something
  const baseUnitId = data.unitId
  const rows = Array.isArray(data.unitConversions) ? data.unitConversions : []

  const usedUnitIds = new Set()
  rows.forEach((row, index) => {
    const rawUnitId = row?.unitId
    const factor = row?.conversionFactor

    const isEmptyRow =
      (rawUnitId === null || rawUnitId === undefined || rawUnitId === '') &&
      (factor === null || factor === undefined || Number.isNaN(factor))

    if (isEmptyRow) return

    // unitId required if row not empty
    if (!rawUnitId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đơn vị quy đổi là bắt buộc',
        path: ['unitConversions', index, 'unitId'],
      })
      return
    }

    // cannot be same as base unit
    if (String(rawUnitId) === String(baseUnitId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đơn vị quy đổi không được trùng đơn vị gốc',
        path: ['unitConversions', index, 'unitId'],
      })
    }

    // conversionFactor required and > 0
    if (!Number.isFinite(factor) || factor <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Hệ số quy đổi phải là số và lớn hơn 0',
        path: ['unitConversions', index, 'conversionFactor'],
      })
    }

    // no duplicate unitId
    const key = String(rawUnitId)
    if (usedUnitIds.has(key)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Đơn vị quy đổi bị trùng',
        path: ['unitConversions', index, 'unitId'],
      })
    } else {
      usedUnitIds.add(key)
    }
  })
})

const updateProductSchema = baseCreateSchema
  .extend({
    // Make image optional for update (user may not change image)
    image: z.instanceof(File).optional(),

    attributeIdsWithValue: z
      .array(
        z
          .object({
            attributeId: z.string().nullable(),
            value: z.string().nullable(),
          })
          .refine(
            (data) =>
              !data.attributeId || (data.value !== null && data.value !== ''),
            {
              message: 'Giá trị là bắt buộc khi thuộc tính tồn tại',
              path: ['value'],
            },
          ),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // =========================
    // Warranty validation
    // =========================
    if (data.applyWarranty) {
      if (!data.warrantyPolicy) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Thông tin bảo hành là bắt buộc',
          path: ['warrantyPolicy'],
        })
        return
      }

      const wp = data.warrantyPolicy

      if (!wp.periodMonths || Number(wp.periodMonths) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Số tháng phải lớn hơn 0',
          path: ['warrantyPolicy', 'periodMonths'],
        })
      }

      const cost = parseNumber(wp.warrantyCost)
      if (isNaN(cost) || cost < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Chi phí không hợp lệ',
          path: ['warrantyPolicy', 'warrantyCost'],
        })
      }
    }

    // =========================
    // Unit conversion validation (same rules)
    // =========================
    const baseUnitId = data.unitId
    const rows = Array.isArray(data.unitConversions) ? data.unitConversions : []

    const usedUnitIds = new Set()
    rows.forEach((row, index) => {
      const rawUnitId = row?.unitId
      const factor = row?.conversionFactor

      const isEmptyRow =
        (rawUnitId === null || rawUnitId === undefined || rawUnitId === '') &&
        (factor === null || factor === undefined || Number.isNaN(factor))

      if (isEmptyRow) return

      if (!rawUnitId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đơn vị quy đổi là bắt buộc',
          path: ['unitConversions', index, 'unitId'],
        })
        return
      }

      if (String(rawUnitId) === String(baseUnitId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đơn vị quy đổi không được trùng đơn vị gốc',
          path: ['unitConversions', index, 'unitId'],
        })
      }

      if (!Number.isFinite(factor) || factor <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Hệ số quy đổi phải là số và lớn hơn 0',
          path: ['unitConversions', index, 'conversionFactor'],
        })
      }

      const key = String(rawUnitId)
      if (usedUnitIds.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Đơn vị quy đổi bị trùng',
          path: ['unitConversions', index, 'unitId'],
        })
      } else {
        usedUnitIds.add(key)
      }
    })
  })

export { createProductSchema, updateProductSchema }
