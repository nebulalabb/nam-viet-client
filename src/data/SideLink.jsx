import {
  IconAdjustments,
  IconBox,
  IconBuildingStore,
  IconCalendar,
  IconCategory,
  IconDatabaseDollar,
  IconHeadset,
  IconLayoutDashboard,
  IconListCheck,
  IconLogs,
  IconReceipt,
  IconReceiptDollar,
  IconReceiptPound,
  IconReceiptRupee,
  IconReceiptTax,
  IconRulerMeasure2,
  IconSettings,
  IconShield,
  IconUserCog,
  IconUsers,
  // Added icons for redesign
  IconTruckDelivery,
  IconBusinessplan,
  IconCreditCard,
  IconReportMoney,
  IconHeartHandshake,
  IconMessages,
  IconGift,
  IconStars,
  IconChartInfographic,
  IconReportAnalytics,
  IconArchive,
  IconBuildingWarehouse,
  IconClipboardList,
  IconPackages,
  IconBellRinging,
  IconUserStar,
  IconActivityHeartbeat
} from '@tabler/icons-react'

export const sideLinks = [
  {
    title: 'Tổng quan (Dashboard)',
    href: '/dashboard',
    icon: <IconLayoutDashboard size={20} stroke={1.5} />,
    permission: 'OVERVIEW_MANAGEMENT',
  },
  {
    title: 'Đơn bán',
    icon: <IconBusinessplan size={20} stroke={1.5} />,
    permission: ['GET_INVOICE', 'GET_INVOICE_USER', 'RECEIPT_VIEW_ALL', 'RECEIPT_VIEW_OWN'],
    sub: [
      {
        title: 'Đơn bán',
        href: '/invoice',
        icon: <IconClipboardList size={18} stroke={1.5} />,
        permission: 'GET_INVOICE',
      },
      {
        title: 'Đơn bán của tôi',
        href: '/invoice-user',
        icon: <IconUserStar size={18} stroke={1.5} />,
        permission: 'GET_INVOICE_USER',
      },
      {
        title: 'Phiếu thu',
        href: '/receipt',
        icon: <IconReceipt size={18} stroke={1.5} />,
        permission: 'RECEIPT_VIEW_ALL',
      },
      {
        title: 'Phiếu thu của tôi',
        href: '/receipt-user',
        icon: <IconReceiptRupee size={18} stroke={1.5} />,
        permission: 'RECEIPT_VIEW_OWN',
      },
      {
        title: 'Giao hàng',
        href: '/delivery',
        icon: <IconTruckDelivery size={18} stroke={1.5} />,
        permission: 'GET_INVOICE',
      },
    ],
  },
  {
    title: 'Đơn mua',
    icon: <IconReportMoney size={20} stroke={1.5} />,
    permission: ['PURCHASE_ORDER_VIEW_ALL', 'PAYMENT_VIEW_ALL', 'PAYMENT_VIEW_OWN'],
    sub: [
      {
        title: 'Đơn mua',
        href: '/purchase-order',
        icon: <IconClipboardList size={18} stroke={1.5} />,
        permission: 'PURCHASE_ORDER_VIEW_ALL',
      },
      {
        title: 'Đơn mua của tôi',
        href: '/purchase-order-user',
        icon: <IconUserStar size={18} stroke={1.5} />,
        permission: 'PURCHASE_ORDER_VIEW_ALL',
      },
      {
        title: 'Phiếu chi',
        href: '/payment',
        icon: <IconCreditCard size={18} stroke={1.5} />,
        permission: 'PAYMENT_VIEW_ALL',
      },
      {
        title: 'Phiếu chi của tôi',
        href: '/payment-user',
        icon: <IconCreditCard size={18} stroke={1.5} />,
        permission: 'PAYMENT_VIEW_OWN',
      },
    ],
  },
  {
    title: 'Sau bán hàng',
    icon: <IconHeartHandshake size={20} stroke={1.5} />,
    permission: ['GET_WARRANTY'],
    sub: [
      {
        title: 'Bảo hành',
        href: '/warranty',
        icon: <IconShield size={18} stroke={1.5} />,
        permission: 'GET_WARRANTY',
      },
    ],
  },
  {
    title: 'Khách hàng',
    icon: <IconUsers size={20} stroke={1.5} />,
    permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER', 'GET_CUSTOMER_CARE', 'GET_TASK'],
    sub: [
      {
        title: 'Danh sách khách hàng',
        href: '/customer',
        icon: <IconUsers size={18} stroke={1.5} />,
        permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER'],
      },
      {
        title: 'Công nợ',
        href: '/customer-debt',
        icon: <IconDatabaseDollar size={18} stroke={1.5} />,
        permission: 'GET_CUSTOMER',
      },
      {
        title: 'Phiếu hỗ trợ (nếu có)',
        href: '/ticket',
        icon: <IconMessages size={18} stroke={1.5} />,
        permission: 'GET_CUSTOMER_CARE',
      },
      {
        title: 'Nhiệm vụ CSKH',
        href: '/task',
        icon: <IconListCheck size={18} stroke={1.5} />,
        permission: 'GET_TASK',
      },
    ],
  },
  {
    title: 'Khuyến mãi',
    icon: <IconGift size={20} stroke={1.5} />,
    permission: 'GET_PRODUCT',
    sub: [
      {
        title: 'DS Khuyến mãi (Mua X tặng Y, ...)',
        href: '/promotions',
        icon: <IconGift size={18} stroke={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'KM đang hoạt động',
        href: '/active-promotions',
        icon: <IconStars size={18} stroke={1.5} />,
        permission: 'GET_PRODUCT',
      }
    ]
  },
  {
    title: 'Sản phẩm',
    icon: <IconPackages size={20} stroke={1.5} />,
    permission: [
      'GET_PRODUCT',
      'GET_CATEGORY',
      'GET_ATTRIBUTE',
      'GET_UNIT',
      'GET_SUPPLIER',
      'GET_TAX'
    ],
    sub: [
      {
        title: 'Danh mục',
        href: '/category',
        icon: <IconCategory size={18} stroke={1.5} />,
        permission: 'GET_CATEGORY',
      },
      {
        title: 'Nguyên liệu',
        href: '/material',
        icon: <IconBox size={18} stroke={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Sản phẩm',
        href: '/product',
        icon: <IconPackages size={18} stroke={1.5} />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Thuộc tính SP (nếu có)',
        href: '/attribute',
        icon: <IconAdjustments size={18} stroke={1.5} />,
        permission: 'GET_ATTRIBUTE',
      },
      {
        title: 'Đơn vị tính (nếu có)',
        href: '/unit',
        icon: <IconRulerMeasure2 size={18} stroke={1.5} />,
        permission: 'GET_UNIT',
      },
      {
        title: 'Nhà cung cấp',
        href: '/supplier',
        icon: <IconBuildingStore size={18} stroke={1.5} />,
        permission: 'GET_SUPPLIER',
      },
      {
        title: 'Thuế',
        href: '/tax',
        icon: <IconReceiptTax size={18} stroke={1.5} />,
        permission: 'GET_TAX',
      },
    ],
  },
  {
    title: 'Kho',
    icon: <IconBuildingWarehouse size={20} stroke={1.5} />,
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
        icon: <IconBuildingWarehouse size={18} stroke={1.5} />,
        permission: 'WAREHOUSE_MANAGEMENT',
      },
      {
        title: 'Nhập kho',
        href: '/warehouse-in',
        icon: <IconBox size={18} stroke={1.5} />,
        permission: 'WAREHOUSE_IMPORT_VIEW_ALL',
      },
      {
        title: 'Xuất kho',
        href: '/warehouse-out',
        icon: <IconBox size={18} stroke={1.5} />,
        permission: 'WAREHOUSE_EXPORT_VIEW_ALL',
      },
      {
        title: 'Tổng hợp X-N-T',
        href: '/warehouse-report/summary',
        icon: <IconChartInfographic size={18} stroke={1.5} />,
        permission: 'INVENTORY_NXT_VIEW',
      },
      {
        title: 'Sổ chi tiết',
        href: '/warehouse-report/detail',
        icon: <IconClipboardList size={18} stroke={1.5} />,
        permission: 'INVENTORY_LEDGER_VIEW',
      },
      {
        title: 'Cảnh báo tồn kho',
        href: '/inventory-warning',
        icon: <IconBellRinging size={18} stroke={1.5} />,
        permission: 'GET_STOCK',
      },
    ],
  },
  {
    title: 'Nhân sự',
    icon: <IconUserCog size={20} stroke={1.5} />,
    permission: ['USER_MANAGEMENT'],
    sub: [
      {
        title: 'Nhân viên',
        href: '/employee',
        icon: <IconUsers size={18} stroke={1.5} />,
        permission: 'GET_USER',
      },
      {
        title: 'Chấm công',
        href: '/attendance',
        icon: <IconCalendar size={18} stroke={1.5} />,
        permission: 'USER_MANAGEMENT',
      },
      {
        title: 'Lương',
        href: '/salary',
        icon: <IconReportMoney size={18} stroke={1.5} />,
        permission: 'USER_MANAGEMENT',
      },
      {
        title: 'Tăng ca',
        href: '/overtime',
        icon: <IconActivityHeartbeat size={18} stroke={1.5} />,
        permission: 'USER_MANAGEMENT',
      },
    ]
  },
  {
    title: 'Báo Cáo',
    icon: <IconReportAnalytics size={20} stroke={1.5} />,
    permission: ['GET_REPORT', 'REPORT_PURCHASE_VIEW', 'REPORT_UNDELIVERED_VIEW', 'REPORT_UNRECEIVED_VIEW'],
    sub: [
      {
        title: 'Doanh thu',
        href: '/revenue',
        icon: <IconReportMoney size={18} stroke={1.5} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Tồn kho',
        href: '/inventory-report',
        icon: <IconArchive size={18} stroke={1.5} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Bán hàng',
        href: '/sales-report',
        icon: <IconReportMoney size={18} stroke={1.5} />,
        permission: 'GET_REPORT',
      },
      {
        title: 'Tài chính',
        href: '/financial-report',
        icon: <IconDatabaseDollar size={18} stroke={1.5} />,
        permission: 'GET_REPORT',
      },
    ],
  },
  {
    title: 'Cài đặt',
    icon: <IconSettings size={20} stroke={1.5} />,
    permission: ['GET_USER', 'GET_ROLE', 'SESSION_SETTING', 'GET_AUDIT_LOG', 'GET_SETTING'],
    sub: [
      {
        title: 'Danh sách người dùng',
        href: '/user',
        icon: <IconUserCog size={18} stroke={1.5} />,
        permission: 'GET_USER',
      },
      {
        title: 'Vai trò & Quyền',
        href: '/role-and-permissions',
        icon: <IconShield size={18} stroke={1.5} />,
        permission: 'GET_ROLE',
      },
      {
        title: 'Nhật ký hệ thống',
        href: '/system-log',
        icon: <IconLogs size={18} stroke={1.5} />,
        permission: 'GET_AUDIT_LOG',
      },
      {
        title: 'Hệ thống',
        href: '/setting',
        icon: <IconSettings size={18} stroke={1.5} />,
        permission: 'GET_SETTING',
      },
    ],
  },
]
