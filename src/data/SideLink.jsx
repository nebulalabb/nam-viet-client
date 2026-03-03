import {
  LayoutDashboard,
  ScrollText,
  ClipboardList,
  UserCheck,
  Receipt,
  ReceiptText,
  Truck,
  CircleDollarSign,
  CreditCard,
  HeartHandshake,
  Shield,
  Users,
  DatabaseBackup,
  MessageSquare,
  ListChecks,
  Gift,
  Sparkles,
  PackageSearch,
  LayoutGrid,
  Box,
  Package,
  Settings2,
  Ruler,
  Store,
  BadgePercent,
  Warehouse,
  BarChart3,
  BellRing,
  UserCog,
  Calendar,
  Activity,
  PieChart,
  Archive,
  FileJson,
  Settings
} from 'lucide-react'

export const sideLinks = [
  {
    title: 'Tổng quan (Dashboard)',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
    permission: 'OVERVIEW_MANAGEMENT',
  },
  {
    title: 'Đơn bán',
    icon: <ScrollText size={20} strokeWidth={1.5} />,
    permission: ['GET_INVOICE', 'GET_INVOICE_USER', 'RECEIPT_VIEW_ALL', 'RECEIPT_VIEW_OWN'],
    sub: [
      {
        title: 'Đơn bán',
        href: '/invoice',
        icon: <ClipboardList size={18} strokeWidth={1.5} />,
        permission: 'GET_INVOICE',
      },
      {
        title: 'Đơn bán của tôi',
        href: '/invoice-user',
        icon: <UserCheck size={18} strokeWidth={1.5} />,
        permission: 'GET_INVOICE_USER',
      },
      {
        title: 'Phiếu thu',
        href: '/receipt',
        icon: <Receipt size={18} strokeWidth={1.5} />,
        permission: 'RECEIPT_VIEW_ALL',
      },
      {
        title: 'Phiếu thu của tôi',
        href: '/receipt-user',
        icon: <ReceiptText size={18} strokeWidth={1.5} />,
        permission: 'RECEIPT_VIEW_OWN',
      },
      {
        title: 'Giao hàng',
        href: '/delivery',
        icon: <Truck size={18} strokeWidth={1.5} />,
        permission: 'GET_INVOICE',
      },
    ],
  },
  {
    title: 'Đơn mua',
    icon: <CircleDollarSign size={20} strokeWidth={1.5} />,
    permission: ['PURCHASE_ORDER_VIEW_ALL', 'PAYMENT_VIEW_ALL', 'PAYMENT_VIEW_OWN'],
    sub: [
      {
        title: 'Đơn mua',
        href: '/purchase-order',
        icon: <ClipboardList size={18} strokeWidth={1.5} />,
        permission: 'PURCHASE_ORDER_VIEW_ALL',
      },
      {
        title: 'Đơn mua của tôi',
        href: '/purchase-order-user',
        icon: <UserCheck size={18} strokeWidth={1.5} />,
        permission: 'PURCHASE_ORDER_VIEW_ALL',
      },
      {
        title: 'Phiếu chi',
        href: '/payment',
        icon: <CreditCard size={18} strokeWidth={1.5} />,
        permission: 'PAYMENT_VIEW_ALL',
      },
      {
        title: 'Phiếu chi của tôi',
        href: '/payment-user',
        icon: <CreditCard size={18} strokeWidth={1.5} />,
        permission: 'PAYMENT_VIEW_OWN',
      },
    ],
  },
  {
    title: 'Sau bán hàng',
    icon: <HeartHandshake size={20} strokeWidth={1.5} />,
    permission: ['GET_WARRANTY'],
    sub: [
      {
        title: 'Bảo hành',
        href: '/warranty',
        icon: <Shield size={18} strokeWidth={1.5} />,
        permission: 'GET_WARRANTY',
      },
    ],
  },
  {
    title: 'Khách hàng',
    icon: <Users size={20} strokeWidth={1.5} />,
    permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER', 'GET_CUSTOMER_CARE', 'GET_TASK'],
    sub: [
      {
        title: 'Danh sách khách hàng',
        href: '/customer',
        icon: <Users size={18} strokeWidth={1.5} />,
        permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER'],
      },
      {
        title: 'Công nợ',
        href: '/customer-debt',
        icon: <DatabaseBackup size={18} strokeWidth={1.5} />,
        permission: 'GET_CUSTOMER',
      },
      {
        title: 'Phiếu hỗ trợ (nếu có)',
        href: '/ticket',
        icon: <MessageSquare size={18} strokeWidth={1.5} />,
        permission: 'GET_CUSTOMER_CARE',
      },
      {
        title: 'Nhiệm vụ CSKH',
        href: '/task',
        icon: <ListChecks size={18} strokeWidth={1.5} />,
        permission: 'GET_TASK',
      },
    ],
  },
  {
    title: 'Khuyến mãi',
    icon: <Gift size={20} strokeWidth={1.5} />,
    permission: 'GET_PRODUCT',
    sub: [
      {
        title: 'DS Khuyến mãi (Mua X tặng Y, ...)',
        href: '/promotions',
        icon: <Gift size={18} strokeWidth={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'KM đang hoạt động',
        href: '/active-promotions',
        icon: <Sparkles size={18} strokeWidth={1.5} />,
        permission: 'GET_PRODUCT',
      }
    ]
  },
  {
    title: 'Sản phẩm',
    icon: <PackageSearch size={20} strokeWidth={1.5} />,
    permission: [
      'GET_PRODUCT',
      'GET_CATEGORY',
      'GET_ATTRIBUTE',
      'GET_SUPPLIER',
      'GET_TAX'
    ],
    sub: [
      {
        title: 'Danh mục',
        href: '/category',
        icon: <LayoutGrid size={18} strokeWidth={1.5} />,
        permission: 'GET_CATEGORY',
      },
      {
        title: 'Nguyên liệu',
        href: '/material',
        icon: <Box size={18} strokeWidth={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Sản phẩm',
        href: '/product',
        icon: <Package size={18} strokeWidth={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Thuộc tính SP (nếu có)',
        href: '/attribute',
        icon: <Settings2 size={18} strokeWidth={1.5} />,
        permission: 'GET_ATTRIBUTE',
      },
      {
        title: 'Đơn vị tính',
        href: '/unit',
        icon: <Ruler size={18} strokeWidth={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Nhà cung cấp',
        href: '/supplier',
        icon: <Store size={18} strokeWidth={1.5} />,
        permission: 'GET_SUPPLIER',
      },
      {
        title: 'Thuế',
        href: '/tax',
        icon: <BadgePercent size={18} strokeWidth={1.5} />,
        permission: 'GET_TAX',
      },
    ],
  },
  {
    title: 'Kho',
    icon: <Warehouse size={20} strokeWidth={1.5} />,
    permission: [
      'WAREHOUSE_MANAGEMENT',
      'WAREHOUSE_EXPORT_VIEW_ALL',
      'INVENTORY_NXT_VIEW',
      'INVENTORY_LEDGER_VIEW'
    ],
    sub: [
      {
        title: 'Danh sách kho',
        href: '/warehouse-list',
        icon: <Warehouse size={18} strokeWidth={1.5} />,
        permission: 'WAREHOUSE_IMPORT_VIEW_ALL',
      },
      {
        title: 'Nhập kho',
        href: '/warehouse-in',
        icon: <Box size={18} strokeWidth={1.5} />,
        permission: 'WAREHOUSE_IMPORT_VIEW_ALL',
      },
      {
        title: 'Xuất kho',
        href: '/warehouse-out',
        icon: <Box size={18} strokeWidth={1.5} />,
        permission: 'WAREHOUSE_EXPORT_VIEW_ALL',
      },
      {
        title: 'Tổng hợp X-N-T',
        href: '/warehouse-report/summary',
        icon: <BarChart3 size={18} strokeWidth={1.5} />,
        permission: 'INVENTORY_NXT_VIEW',
      },
      {
        title: 'Sổ chi tiết',
        href: '/warehouse-report/detail',
        icon: <ClipboardList size={18} strokeWidth={1.5} />,
        permission: 'INVENTORY_LEDGER_VIEW',
      },
      {
        title: 'Cảnh báo tồn kho',
        href: '/inventory-warning',
        icon: <BellRing size={18} strokeWidth={1.5} />,
        permission: 'GET_STOCK',
      },
    ],
  },
  {
    title: 'Nhân sự',
    icon: <UserCog size={20} strokeWidth={1.5} />,
    permission: ['USER_MANAGEMENT'],
    sub: [
      {
        title: 'Nhân viên',
        href: '/employee',
        icon: <Users size={18} strokeWidth={1.5} />,
        permission: 'GET_USER',
      },
      {
        title: 'Chấm công',
        href: '/attendance',
        icon: <Calendar size={18} strokeWidth={1.5} />,
        permission: 'USER_MANAGEMENT',
      },
      {
        title: 'Lương',
        href: '/salary',
        icon: <CircleDollarSign size={18} strokeWidth={1.5} />,
        permission: 'USER_MANAGEMENT',
      },
      {
        title: 'Tăng ca',
        href: '/overtime',
        icon: <Activity size={18} strokeWidth={1.5} />,
        permission: 'USER_MANAGEMENT',
      },
    ]
  },
  {
    title: 'Báo Cáo',
    icon: <PieChart size={20} strokeWidth={1.5} />,
    permission: ['GET_REPORT', 'REPORT_PURCHASE_VIEW', 'REPORT_UNDELIVERED_VIEW', 'REPORT_UNRECEIVED_VIEW'],
    sub: [
      {
        title: 'Doanh thu',
        href: '/revenue',
        icon: <CircleDollarSign size={18} strokeWidth={1.5} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Tồn kho',
        href: '/inventory-report',
        icon: <Archive size={18} strokeWidth={1.5} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Bán hàng',
        href: '/sales-report',
        icon: <CircleDollarSign size={18} strokeWidth={1.5} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Tài chính',
        href: '/financial-report',
        icon: <DatabaseBackup size={18} strokeWidth={1.5} />,
        permission: 'GET_REPORT',
      },
    ],
  },
  {
    title: 'Cài đặt',
    icon: <Settings size={20} strokeWidth={1.5} />,
    permission: ['GET_USER', 'GET_ROLE', 'SESSION_SETTING', 'GET_AUDIT_LOG', 'GET_SETTING'],
    sub: [
      {
        title: 'Danh sách người dùng',
        href: '/user',
        icon: <UserCog size={18} strokeWidth={1.5} />,
        permission: 'GET_USER',
      },
      {
        title: 'Vai trò & Quyền',
        href: '/role-and-permissions',
        icon: <Shield size={18} strokeWidth={1.5} />,
        permission: 'GET_ROLE',
      },
      {
        title: 'Nhật ký hệ thống',
        href: '/system-log',
        icon: <FileJson size={18} strokeWidth={1.5} />,
        permission: 'GET_AUDIT_LOG',
      },
      {
        title: 'Hệ thống',
        href: '/setting',
        icon: <Settings size={18} strokeWidth={1.5} />,
        permission: 'GET_SETTING',
      },
    ],
  },
]
