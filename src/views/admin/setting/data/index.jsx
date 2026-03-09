import {
  IconInfoSquareRounded,
  IconLogs,
  IconSettings2,
  IconReceiptDollar,
} from '@tabler/icons-react'

const settings = [
  {
    name: 'Cài đặt thông tin cơ bản',
    icon: <IconSettings2 />,
    link: '/setting/general-information',
    action: 'Thiết lập',
    description:
      'Cài đặt thông tin cơ bản cho hệ thống (bao gồm tên, email, số điện thoại, địa chỉ, mã số thuế...)',
  },
  {
    name: 'Lịch sử đăng nhập',
    icon: <IconLogs />,
    link: '/setting/access-log',
    action: 'Quản lý',
    description: 'Xem lịch sử đăng nhập của bản thân mình',
  },

  {
    name: 'Thông tin hệ thống',
    icon: <IconInfoSquareRounded />,
    link: '/setting/system-information',
    action: 'Xem',
    description: 'Cài đặt thông tin hệ thống',
  },

]

export { settings }
