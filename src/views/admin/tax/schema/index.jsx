import { z } from 'zod'

const createTaxSchema = z.object({
  title: z.string().min(1, { message: 'Không được để trống' }),
  percentage: z.preprocess(
    (value) => {
      return typeof value === 'string' ? parseFloat(value) : value
    },
    z
      .number({ invalid_type_error: 'Phải là số' })
      .min(0, { message: 'Phải lớn hơn hoặc bằng 0' })
      .max(100, { message: 'Phải nhỏ hơn hoặc bằng 100' }),
  ),
  status: z.string().min(1, { message: 'Không được để trống' }),
})

const updateTaxSchema = z.object({
  title: z.string().min(1, { message: 'Không được để trống' }),
  percentage: z.preprocess(
    (value) => {
      return typeof value === 'string' ? parseFloat(value) : value
    },
    z
      .number({ invalid_type_error: 'Phải là số' })
      .min(0, { message: 'Phải lớn hơn hoặc bằng 0' })
      .max(100, { message: 'Phải nhỏ hơn hoặc bằng 100' }),
  ),
  status: z.string().min(1, { message: 'Không được để trống' }),
})

export { createTaxSchema, updateTaxSchema }
