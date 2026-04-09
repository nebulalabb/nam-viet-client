import { IconBuildingBank, IconCash, IconCircleCheck, IconFileText } from '@tabler/icons-react'

const receiptStatus = [
  {
    value: 'draft',
    label: 'Chờ duyệt',
    icon: IconFileText,
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    value: 'posted',
    label: 'Đã ghi sổ',
    icon: IconCircleCheck,
    color: 'bg-green-100 text-green-700',
  },
]

const paymentMethods = [
  {
    value: 'cash',
    label: 'Tiền mặt',
    icon: IconCash,
    color: 'text-green-600',
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    icon: IconBuildingBank,
    color: 'text-blue-600',
  },
]

const debts = [
  {
    value: 'partial',
    label: 'Thanh toán một phần',
    color: 'text-yellow-500',
  },
  {
    value: 'closed',
    label: 'Thanh toán toàn bộ',
    color: 'text-green-500',
  },
  {
    value: 'unpaid',
    label: 'Chưa thanh toán',
    color: 'text-red-500',
  },
]

const paymentStatus = [
  {
    label: 'Đang chờ',
    color: 'text-yellow-500',
    value: 'pending',
  },
  {
    label: 'Đã thanh toán',
    color: 'text-green-500',
    value: 'success',
  },
]

const receiptTypes = [
  { value: 'sales', label: 'Bán hàng' },
  { value: 'debt_collection', label: 'Thu công nợ' },
  { value: 'refund', label: 'Hoàn tiền' },
  { value: 'other', label: 'Thu khác' },
]

const voucherTypes = [
  { value: 'salary', label: 'Lương nhân viên' },
  { value: 'operating_cost', label: 'Chi phí vận hành' },
  { value: 'supplier_payment', label: 'Chi nhà cung cấp' },
  { value: 'refund', label: 'Hoàn tiền' },
  { value: 'other', label: 'Chi khác' },
]

export { paymentMethods, debts, paymentStatus, receiptStatus, receiptTypes, voucherTypes }
