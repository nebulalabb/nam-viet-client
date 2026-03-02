import { z } from 'zod'

const updateGeneralSettingSchema = z.object({
  generalSetting: z.object({
    brandName: z.string().min(1, 'Tên công ty không được để trống'),
    logo: z.string().optional().nullable(),
    name: z.string().min(1, 'Tên website không được để trống'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().min(1, 'Số điện thoại không được để trống'),
    address: z.string().min(1, 'Địa chỉ không được để trống'),
    taxCode: z.string().min(1, 'Mã số thuế không được để trống'),
    website: z.string().min(1, 'Địa chỉ website không được để trống'),
    banks: z
      .array(
        z.object({
          accountNumber: z.string().min(1, 'Số tài khoản không được để trống'),
          accountName: z.string().min(1, 'Tên tài khoản không được để trống'),
          bankName: z.string().min(1, 'Tên ngân hàng không được để trống'),
          bankBranch: z.string().min(1, 'Chi nhánh không được để trống'),
        }),
      )
      .min(1, 'Phải có ít nhất một tài khoản ngân hàng'),
  }),
})

export {
  updateGeneralSettingSchema,
}
