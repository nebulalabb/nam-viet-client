import { Banknote, CreditCard } from 'lucide-react'
import { IconCircleCheck, IconCircleX, IconFileText } from '@tabler/icons-react'

export const receiptTypes = [
  { value: 1, label: 'Nhập kho', color: 'bg-blue-500' },
  { value: 2, label: 'Xuất kho', color: 'bg-orange-500' },
  { value: 3, label: 'Kiểm kê', color: 'bg-purple-500' },
]

export const warehouseReceiptStatuses = [
  { value: 'draft', label: 'Nháp', color: 'bg-yellow-500', icon: IconFileText },
  { value: 'posted', label: 'Đã ghi sổ', color: 'bg-green-500', icon: IconCircleCheck },
  { value: 'cancelled', label: 'Đã hủy', color: 'bg-red-500', icon: IconCircleX },
]

export const fulfillmentStatuses = [
  { value: 'pending', label: 'Chờ giao', color: 'bg-yellow-500' },
  { value: 'delivered', label: 'Đã giao', color: 'bg-green-500' },
]

export const businessTypes = [
  { value: 'sale_out', label: 'Bán hàng' },
  { value: 'purchase_in', label: 'Mua hàng' },
  { value: 'return_in', label: 'Trả hàng nhập' },
  { value: 'return_out', label: 'Trả hàng xuất' },
  { value: 'transfer_in', label: 'Chuyển kho nhập' },
  { value: 'transfer_out', label: 'Chuyển kho xuất' },
  { value: 'adjustment', label: 'Điều chỉnh' },
  { value: 'other', label: 'Khác' },
]

export const paymentMethods = [
  {
    value: 'cash',
    label: 'Tiền mặt',
    icon: Banknote,
  },
  {
    value: 'transfer',
    label: 'Chuyển khoản',
    icon: CreditCard,
  },
]
