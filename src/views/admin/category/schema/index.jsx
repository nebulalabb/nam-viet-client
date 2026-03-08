import { z } from 'zod'

const createCategorySchema = z.object({
  categoryName: z.string().min(1, { message: 'Không được để trống' }),
  categoryCode: z.string().min(1, { message: 'Không được để trống' }),
  status: z.string().min(1, { message: 'Không được để trống' }),
  type: z.string().min(1, { message: 'Không được để trống' }),
})

const updateCategorySchema = z.object({
  categoryName: z.string().min(1, { message: 'Không được để trống' }),
  categoryCode: z.string().min(1, { message: 'Không được để trống' }),
  status: z.string().min(1, { message: 'Không được để trống' }),
  type: z.string().min(1, { message: 'Không được để trống' }),
})

const updateCategoryStatusSchema = z.object({
  status: z.string().min(1, { message: 'Không được để trống' }),
})

export { createCategorySchema, updateCategorySchema, updateCategoryStatusSchema }
