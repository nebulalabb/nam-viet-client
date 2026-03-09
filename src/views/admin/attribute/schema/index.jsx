import { z } from 'zod'

const createAttributeSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().min(1, { message: 'Không được để trống' }),
  dataType: z.string().min(1, { message: 'Không được để trống' }),
  unit: z.string().min(1, { message: 'Không được để trống' }),
})

const updateAttributeSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().min(1, { message: 'Không được để trống' }),
  dataType: z.string().min(1, { message: 'Không được để trống' }),
  unit: z.string().min(1, { message: 'Không được để trống' }),
})

export { createAttributeSchema, updateAttributeSchema }
