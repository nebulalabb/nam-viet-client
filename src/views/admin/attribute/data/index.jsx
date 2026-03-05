import { IconCircleCheck, IconLock } from '@tabler/icons-react'

export const statuses = [
  {
    value: 'published',
    label: 'Cho phép sử dụng',
    icon: IconCircleCheck,
  },
  {
    value: 'draft',
    label: 'Nháp',
    icon: IconLock,
  },
  {
    value: 'pending',
    label: 'Chưa sẵn dùng',
    icon: IconLock,
  },
]

export const dataTypes = [
  { value: 'string', label: 'chuỗi (text)' },
  { value: 'integer', label: 'số nguyên' },
  { value: 'number', label: 'số' },
  { value: 'boolean', label: 'đúng / sai' },
  { value: 'date', label: 'ngày' },
  { value: 'datetime', label: 'ngày giờ' },
  { value: 'enum', label: 'danh sách lựa chọn' },
]

export const units = [
  { value: 'none', label: 'không có đơn vị' },
  { value: 'pcs', label: 'cái' },
  { value: 'box', label: 'hộp' },
  { value: 'set', label: 'bộ' },
  { value: 'pack', label: 'gói' },
  { value: 'bottle', label: 'chai' },
  { value: 'roll', label: 'cuộn' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'gram' },
  { value: 'mg', label: 'miligram' },
  { value: 'l', label: 'lít' },
  { value: 'ml', label: 'mililít' },
  { value: 'm', label: 'mét' },
  { value: 'cm', label: 'centimét' },
  { value: 'mm', label: 'milimét' },
  { value: 'm2', label: 'mét vuông' },
  { value: 'm3', label: 'mét khối' },
  { value: 'hour', label: 'giờ' },
  { value: 'minute', label: 'phút' },
  { value: 'second', label: 'giây' },
  { value: 'percent', label: 'phần trăm (%)' },
  { value: 'slot', label: 'chỗ' },
  { value: 'months', label: 'tháng' },
  { value: 'years', label: 'năm' },
  { value: 'users', label: 'người dùng' },
  { value: 'orders', label: 'đơn hàng' },
]
