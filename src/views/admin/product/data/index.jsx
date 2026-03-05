import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const PRODUCT_SOURCE = [
  { id: 1, value: 'company', name: 'Công ty' },
  { id: 2, value: 'partner', name: 'Đối tác' },
  { id: 3, value: 'other', name: 'Khác' },
]

const PRODUCT_TYPE = [
  { id: 1, value: 'digital', name: 'Điện tử, kỹ thuật số' },
  { id: 2, value: 'physical', name: 'Vật lý' },
  { id: 3, value: 'service', name: 'Dịch vụ' },
]

const SALARY_COEFFICIENT_TYPE = [
  { id: 1, value: 'percentage', description: 'Theo phần trăm (%)' },
  { id: 2, value: 'multiplier', description: 'Theo cấp số nhân' },
]

const TAX_STATUS = {
  PUBLISHED: 'published',
  PENDING: 'pending',
  DRAFT: 'draft',
}

const CATEGORY_STATUS = {
  PUBLISHED: 'published',
  PENDING: 'pending',
  DRAFT: 'draft',
}

const matchAttributes = {
  none: 'không có đơn vị',
  pcs: 'cái',
  box: 'hộp',
  set: 'bộ',
  pack: 'gói',
  bottle: 'chai',
  roll: 'cuộn',
  kg: 'kg',
  g: 'gram',
  mg: 'miligram',
  l: 'lít',
  ml: 'mililít',
  m: 'mét',
  cm: 'centimét',
  mm: 'milimét',
  m2: 'mét vuông',
  m3: 'mét khối',
  hour: 'giờ',
  minute: 'phút',
  second: 'giây',
  percent: 'phần trăm (%)',
  slot: 'chỗ',
  months: 'tháng',
  years: 'năm',
  users: 'người dùng',
  orders: 'đơn hàng',
}

export const productStatuses = [
  { value: 'active', label: 'Đang bán', icon: CheckCircle, color: 'text-green-600', variant: 'outline', badgeClass: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400' },
  { value: 'inactive', label: 'Ngừng bán', icon: XCircle, color: 'text-red-600', variant: 'outline', badgeClass: 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400' },
  { value: 'discontinued', label: 'Bỏ mẫu', icon: AlertCircle, color: 'text-yellow-600', variant: 'outline', badgeClass: 'border-yellow-400 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' },
]

export const productTypes = [
  { value: 'raw_material', label: 'Nguyên vật liệu' },
  { value: 'packaging', label: 'Bao bì' },
  { value: 'finished_product', label: 'Thành phẩm' },
  { value: 'goods', label: 'Hàng hóa' },
]

export {
  PRODUCT_SOURCE,
  PRODUCT_TYPE,
  SALARY_COEFFICIENT_TYPE,
  TAX_STATUS,
  CATEGORY_STATUS,
  matchAttributes,
}
