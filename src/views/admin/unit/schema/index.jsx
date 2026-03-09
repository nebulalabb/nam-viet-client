import { z } from 'zod'

const createUnitSchema = z.object({
  unitCode: z.string().min(1, 'Mã đơn vị tính là bắt buộc').max(50),
  unitName: z.string().min(1, 'Tên đơn vị tính là bắt buộc').max(100),
})

const updateUnitSchema = z.object({
  unitCode: z.string().min(1, 'Mã đơn vị tính là bắt buộc').max(50),
  unitName: z.string().min(1, 'Tên đơn vị tính là bắt buộc').max(100),
})

export { createUnitSchema, updateUnitSchema }
