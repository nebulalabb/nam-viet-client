import { z } from 'zod'

export const createPromotionSchema = z.object({
    promotionCode: z.string().min(1, 'Mã khuyến mãi là bắt buộc').max(50),
    promotionName: z.string().min(1, 'Tên khuyến mãi là bắt buộc').max(200),
    promotionType: z.enum(['buy_x_get_y', 'gift']),
    productId: z.coerce.number().optional(),
    giftProductId: z.coerce.number().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày bắt đầu không hợp lệ',
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày kết thúc không hợp lệ',
    }),
    isRecurring: z.boolean().optional(),
    applicableTo: z.enum(['all', 'category', 'product_group', 'specific_product', 'customer_group', 'specific_customer']),
    minOrderValue: z.coerce.number().min(0, 'Giá trị nhỏ nhất là 0').optional(),
    minQuantity: z.coerce.number().min(0, 'Số lượng nhỏ nhất là 0').optional(),
    quantityLimit: z.coerce.number().min(1, 'Giới hạn dùng ít nhất là 1').optional(),
    buyQuantity: z.coerce.number().min(1, 'Vui lòng nhập số lượng mua').optional(),
    getQuantity: z.coerce.number().min(1, 'Vui lòng nhập số lượng tặng').optional(),
    customerId: z.coerce.number().optional(),
    customerType: z.enum(['individual', 'company']).optional(),
    unit: z.string().optional(),
})

export const updatePromotionSchema = z.object({
    promotionName: z.string().min(1, 'Tên khuyến mãi là bắt buộc').max(200).optional(),
    promotionType: z.enum(['buy_x_get_y', 'gift']).optional(),
    applicableTo: z.enum(['all', 'category', 'product_group', 'specific_product', 'customer_group', 'specific_customer']).optional(),
    productId: z.coerce.number().optional(),
    giftProductId: z.coerce.number().optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày bắt đầu không hợp lệ',
    }).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Ngày kết thúc không hợp lệ',
    }).optional(),
    isRecurring: z.boolean().optional(),
    minOrderValue: z.coerce.number().min(0, 'Giá trị nhỏ nhất là 0').optional(),
    minQuantity: z.coerce.number().min(0, 'Số lượng nhỏ nhất là 0').optional(),
    quantityLimit: z.coerce.number().min(1, 'Giới hạn dùng ít nhất là 1').optional(),
    buyQuantity: z.coerce.number().min(1, 'Vui lòng nhập số lượng mua').optional(),
    getQuantity: z.coerce.number().min(1, 'Vui lòng nhập số lượng tặng').optional(),
    customerId: z.coerce.number().optional(),
    customerType: z.enum(['individual', 'company']).optional(),
    unit: z.string().optional(),
})
