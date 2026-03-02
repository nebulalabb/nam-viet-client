import { z } from 'zod'

const createRoleSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().min(1, { message: 'Không được để trống' }),
})

const updateRoleSchema = z.object({
  name: z.string().min(1, { message: 'Không được để trống' }),
  code: z.string().min(1, { message: 'Không được để trống' }),
})

export { createRoleSchema, updateRoleSchema }
