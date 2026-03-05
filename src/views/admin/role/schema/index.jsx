import { z } from 'zod'

const createRoleSchema = z.object({
  roleName: z.string().min(1, { message: 'Không được để trống' }),
  roleKey: z.string().min(1, { message: 'Không được để trống' }),
})

const updateRoleSchema = z.object({
  roleName: z.string().min(1, { message: 'Không được để trống' }),
  roleKey: z.string().min(1, { message: 'Không được để trống' }),
})

export { createRoleSchema, updateRoleSchema }
