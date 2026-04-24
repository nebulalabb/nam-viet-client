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
  Settings,
  Wallet,
  Scale,
  FileText,
  FolderOpen,
} from 'lucide-react'

export const sideLinks = [
  {
    title: 'Tổng quan',
    href: '/dashboard',
    icon: <img src="/icons/Dashboard.png" className="w-[20px] h-[20px]" alt="Tổng quan" />,
    permission: 'GET_DASHBOARD',
  },
  {
    title: 'Đơn bán',
    icon: <img src="/icons/đơn bán.png" className="w-[20px] h-[20px] " alt="Đơn bán" />,
    permission: ['GET_INVOICE', 'GET_INVOICE_USER', 'GET_RECEIPT', 'GET_RECEIPT_USER'],
    sub: [
      {
        title: 'Đơn bán',
        href: '/invoice',
        icon: <img src="/icons/đơn bán trong .png" className="w-[18px] h-[18px] " alt="Đơn bán" />,
        permission: 'GET_INVOICE',
      },
      {
        title: 'Đơn bán của tôi',
        href: '/invoice-user',
        icon: <img src="/icons/Đơn bán của tôi .png" className="w-[18px] h-[18px] " alt="Đơn bán của tôi" />,
        permission: 'GET_INVOICE_USER',
      },
      // {
      //   title: 'Phiếu thu',
      //   href: '/receipt',
      //   icon: <Receipt size={18} strokeWidth={1.5} />,
      //   permission: 'GET_RECEIPT',
      // },
      // {
      //   title: 'Phiếu thu của tôi',
      //   href: '/receipt-user',
      //   icon: <ReceiptText size={18} strokeWidth={1.5} />,
      //   permission: 'GET_RECEIPT_USER',
      // },
      // {
      //   title: 'Giao hàng',
      //   href: '/delivery',
      //   icon: <Truck size={18} strokeWidth={1.5} />,
      //   permission: 'VIEW_DELIVERIES',
      // },
    ],
  },
  {
    title: 'Đơn mua',
    icon: <img src="/icons/đơn mua.png" className="w-[20px] h-[20px] " alt="Đơn mua" />,
    permission: ['GET_PURCHASE_ORDER', 'GET_PURCHASE_ORDER_USER'],
    sub: [
      {
        title: 'Đơn mua',
        href: '/purchase-order',
        icon: <img src="/icons/đơn mua trong.png" className="w-[18px] h-[18px] " alt="Đơn mua" />,
        permission: 'GET_PURCHASE_ORDER',
      },
      {
        title: 'Đơn mua của tôi',
        href: '/purchase-order-user',
        icon: <img src="/icons/đơn mua của tôi.png" className="w-[18px] h-[18px] " alt="Đơn mua của tôi" />,
        permission: 'GET_PURCHASE_ORDER_USER',
      },
    ],
  },
  // {
  //   title: 'Sau bán hàng',
  //   icon: <HeartHandshake size={20} strokeWidth={1.5} />,
  //   permission: ['GET_WARRANTY'],
  //   sub: [
  //     {
  //       title: 'Bảo hành',
  //       href: '/warranty',
  //       icon: <Shield size={18} strokeWidth={1.5} />,
  //       permission: 'GET_WARRANTY',
  //     },
  //   ],
  // },
  {
    title: 'Tài chính',
    icon: <img src="/icons/tài chính.png" className="w-[20px] h-[20px] " alt="Tài chính" />,
    permission: ['GET_RECEIPT', 'GET_PAYMENT', 'GET_DEBT'],
    sub: [
      {
        title: 'Phiếu thu',
        href: '/receipt',
        icon: <img src="/icons/phiếu thu.png" className="w-[18px] h-[18px] " alt="Phiếu thu" />,
        permission: 'GET_RECEIPT',
      },
      {
        title: 'Phiếu chi',
        href: '/payment',
        icon: <img src="/icons/phiếu chi.png" className="w-[18px] h-[18px] " alt="Phiếu chi" />,
        permission: 'GET_PAYMENT',
      },
      {
        title: 'Công nợ khách hàng',
        href: '/customer-debt',
        icon: <img src="/icons/công nợ khách hàng.png" className="w-[18px] h-[18px] " alt="Công nợ khách hàng" />,
        permission: 'GET_DEBT',
      },
      {
        title: 'Công nợ nhà cung cấp',
        href: '/partner-debt',
        icon: <img src="/icons/công nợ nhà cung cấp.png" className="w-[18px] h-[18px] " alt="Công nợ nhà cung cấp" />,
        permission: 'GET_DEBT',
      },
      {
        title: 'Sổ quỹ thu chi',
        href: '/cash-flow',
        icon: <img src="/icons/sổ quỹ thu chi .png" className="w-[18px] h-[18px] " alt="Sổ quỹ thu chi" />,
        permission: 'GET_DEBT',
      },
    ],
  },
  {
    title: 'Khách hàng / Đối tác',
    icon: <img src="/icons/khách hàng, đối tác  .png" className="w-[20px] h-[20px] " alt="Khách hàng Đối tác" />,
    permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER', 'GET_CUSTOMER_CARE', 'GET_TASK', 'GET_SUPPLIER'],
    sub: [
      {
        title: 'Danh sách khách hàng',
        href: '/customer',
        icon: <img src="/icons/danh sach khách hàng .png" className="w-[18px] h-[18px] " alt="Danh sách khách hàng" />,
        permission: ['GET_CUSTOMER', 'GET_CUSTOMER_USER'],
      },
      {
        title: 'Nhà cung cấp / Đối tác',
        href: '/partner',
        icon: <img src="/icons/nhà cung cấp đối tác .png" className="w-[18px] h-[18px] " alt="Nhà cung cấp / Đối tác" />,
        permission: 'GET_SUPPLIER',
      },
      // {
      //   title: 'Công nợ',
      //   href: '/customer-debt',
      //   icon: <DatabaseBackup size={18} strokeWidth={1.5} />,
      //   permission: 'GET_DEBT',
      // },
      {
        title: 'Phiếu hỗ trợ (nếu có)',
        href: '/ticket',
        icon: <img src="/icons/phiếu hỗ trợ.png" className="w-[18px] h-[18px] " alt="Phiếu hỗ trợ" />,
        permission: 'GET_CUSTOMER_CARE',
      },
      {
        title: 'Nhiệm vụ CSKH',
        href: '/task',
        icon: <img src="/icons/nv CSKH.png" className="w-[18px] h-[18px] " alt="Nhiệm vụ CSKH" />,
        permission: 'GET_TASK',
      },
    ],
  },
  {
    title: 'Khuyến mãi',
    icon: <Gift size={20} strokeWidth={1.5} />,
    permission: 'DISABLED_FEATURE', // Tạm tắt tính năng khuyến mãi
    sub: [
      {
        title: 'DS Khuyến mãi',
        href: '/promotion',
        icon: <Gift size={18} strokeWidth={1.5} />,
        permission: 'DISABLED_FEATURE',
      },
      {
        title: 'KM đang hoạt động',
        href: '/active-promotions',
        icon: <Sparkles size={18} strokeWidth={1.5} />,
        permission: 'DISABLED_FEATURE',
      }
    ]
  },
  {
    title: 'Nguyên liệu / Sản phẩm',
    icon: <img src="/icons/nguyên liệu, sản phẩm.png" className="w-[20px] h-[20px] " alt="Nguyên liệu / Sản phẩm" />,
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
        icon: <img src="/icons/danh mục .png" className="w-[18px] h-[18px] " alt="Danh mục" />,
        permission: 'GET_CATEGORY',
      },
      {
        title: 'Nguyên liệu / Sản phẩm',
        href: '/product',
        icon: <img src="/icons/Nguyên liệu sản phẩm trong.png" className="w-[18px] h-[18px] " alt="Nguyên liệu / Sản phẩm" />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Thuộc tính SP (nếu có)',
        href: '/attribute',
        icon: <img src="/icons/thuộc tính sản phẩm .png" className="w-[18px] h-[18px] " alt="Thuộc tính SP" />,
        permission: 'GET_ATTRIBUTE',
      },
      {
        title: 'Đơn vị tính',
        href: '/unit',
        icon: <img src="/icons/Đơn vị tính .png" className="w-[18px] h-[18px] " alt="Đơn vị tính" />,
        permission: 'GET_PRODUCT',
      },
      {
        title: 'Nhà cung cấp',
        href: '/supplier',
        icon: <img src="/icons/nhà cung cấp.png" className="w-[18px] h-[18px] " alt="Nhà cung cấp" />,
        permission: 'GET_SUPPLIER',
      },
      {
        title: 'Thuế',
        href: '/tax',
        icon: <img src="/icons/thuế.png" className="w-[18px] h-[18px] " alt="Thuế" />,
        permission: 'GET_TAX',
      },
    ],
  },
  {
    title: 'Kho',
    icon: <img src="/icons/kho.png" className="w-[20px] h-[20px] " alt="Kho" />,
    permission: [
      'GET_WAREHOUSE_IMPORT',
      'GET_WAREHOUSE_EXPORT',
      'INVENTORY_NXT_VIEW',
      'INVENTORY_LEDGER_VIEW',
      'GET_STOCK'
    ],
    sub: [
      {
        title: 'Danh sách kho',
        href: '/warehouse-list',
        icon: <img src="/icons/danh sách kho.png" className="w-[18px] h-[18px] " alt="Danh sách kho" />,
        permission: 'GET_WAREHOUSE_IMPORT',
      },
      {
        title: 'Nhập kho',
        href: '/warehouse-in',
        icon: <img src="/icons/nhập kho.png" className="w-[18px] h-[18px] " alt="Nhập kho" />,
        permission: 'GET_WAREHOUSE_IMPORT',
      },
      {
        title: 'Xuất kho',
        href: '/warehouse-out',
        icon: <img src="/icons/xuất kho.png" className="w-[18px] h-[18px] " alt="Xuất kho" />,
        permission: 'GET_WAREHOUSE_EXPORT',
      },
      {
        title: 'Tổng hợp X-N-T',
        href: '/warehouse-report/summary',
        icon: <img src="/icons/tông hợp X-N-k.png" className="w-[18px] h-[18px] " alt="Tổng hợp X-N-T" />,
        permission: 'INVENTORY_NXT_VIEW',
      },
      {
        title: 'Sổ chi tiết',
        href: '/warehouse-report/detail',
        icon: <img src="/icons/sổ chi tiết .png" className="w-[18px] h-[18px] " alt="Sổ chi tiết" />,
        permission: 'INVENTORY_LEDGER_VIEW',
      },
      {
        title: 'Báo cáo tồn kho',
        href: '/inventory-report',
        icon: <img src="/icons/Báo cáo tồn kho.png" className="w-[18px] h-[18px] " alt="Báo cáo tồn kho" />,
        permission: 'GET_INVENTORY_REPORT',
      },
      {
        title: 'Cảnh báo tồn kho',
        href: '/inventory-warning',
        icon: <img src="/icons/cảnh báo tồn kho .png" className="w-[18px] h-[18px] " alt="Cảnh báo tồn kho" />,
        permission: 'GET_STOCK',
      },
    ],
  },
  {
    title: 'Nhân sự',
    icon: <img src="/icons/nhân sự.png" className="w-[20px] h-[20px] " alt="Nhân sự" />,
    permission: ['GET_USER'],
    sub: [
      {
        title: 'Nhân viên',
        href: '/employee',
        icon: <img src="/icons/nhân viên.png" className="w-[18px] h-[18px] " alt="Nhân viên" />,
        permission: 'GET_USER',
      },
      {
        title: 'Chấm công',
        href: '/attendance',
        icon: <img src="/icons/chấm công.png" className="w-[18px] h-[18px] " alt="Chấm công" />,
        permission: 'GET_USER',
      },
      {
        title: 'Lương',
        href: '/salary',
        icon: <img src="/icons/lương.png" className="w-[18px] h-[18px] " alt="Lương" />,
        permission: 'GET_USER',
      },
      {
        title: 'Tăng ca',
        href: '/overtime',
        icon: <img src="/icons/tăng ca.png" className="w-[18px] h-[18px] " alt="Tăng ca" />,
        permission: 'GET_USER',
      },
    ]
  },
  {
    title: 'Báo Cáo',
    icon: <img src="/icons/báo cáo.png" className="w-[20px] h-[20px] " alt="Báo Cáo" />,
    permission: ['GET_REVENUE_REPORT', 'GET_INVENTORY_REPORT', 'GET_SALES_REPORT', 'GET_PRODUCTION_REPORT', 'GET_FINANCIAL_REPORT'],
    sub: [
      {
        title: 'Doanh thu',
        href: '/revenue',
        icon: <img src="/icons/doanh thu.png" className="w-[18px] h-[18px] " alt="Doanh thu" />,
        permission: 'GET_REVENUE_REPORT',
      },

      {
        title: 'Bán hàng',
        href: '/sales-report',
        icon: <img src="/icons/Bán hàng.png" className="w-[18px] h-[18px] " alt="Bán hàng" />,
        permission: 'GET_SALES_REPORT',
      },
      {
        title: 'Sản xuất',
        href: '/production-report',
        icon: <Package size={18} strokeWidth={1.5} />,
        permission: 'GET_PRODUCTION_REPORT',
      },
      {
        title: 'Tài chính',
        href: '/financial-report',
        icon: <img src="/icons/tài chính báp cáo.png" className="w-[18px] h-[18px] " alt="Tài chính báp cáo" />,
        permission: 'GET_FINANCIAL_REPORT',
      },
    ],
  },
  {
    title: 'Bài viết',
    icon: <img src="/icons/bài viết.png" className="w-[20px] h-[20px] " alt="Bài viết" />,
    permission: 'GET_REVENUE_REPORT',
    sub: [
      {
        title: 'Quản lý bài viết',
        href: '/news',
        icon: <img src="/icons/quản lý bài viết.png" className="w-[18px] h-[18px] " alt="Quản lý bài viết" />,
        permission: 'GET_REVENUE_REPORT',
      },
      {
        title: 'Danh mục bài viết',
        href: '/news-categories',
        icon: <img src="/icons/danh mục bài viết.png" className="w-[18px] h-[18px] " alt="Danh mục bài viết" />,
        permission: 'GET_REVENUE_REPORT',
      },
      {
        title: 'Duyệt bình luận',
        href: '/news-comments',
        icon: <img src="/icons/Bình luận .png" className="w-[18px] h-[18px] " alt="Duyệt bình luận" />,
        permission: 'GET_REVENUE_REPORT',
      },
    ],
  },
  {
    title: 'Cài đặt',
    icon: <img src="/icons/Cài đặc.png" className="w-[20px] h-[20px] " alt="Cài đặt" />,
    permission: ['GET_USER', 'GET_ROLE', 'GET_AUDIT_LOG', 'GET_SETTING'],
    sub: [
      {
        title: 'Danh sách người dùng',
        href: '/user',
        icon: <img src="/icons/Ds người dùng .png" className="w-[18px] h-[18px] " alt="Danh sách người dùng" />,
        permission: 'GET_USER',
      },
      {
        title: 'Vai trò & Quyền',
        href: '/role-and-permissions',
        icon: <img src="/icons/role.png" className="w-[18px] h-[18px] " alt="Vai trò & Quyền" />,
        permission: 'GET_ROLE',
      },
      {
        title: 'Nhật ký hệ thống',
        href: '/system-log',
        icon: <img src="/icons/nhật ký hệ thống .png" className="w-[18px] h-[18px] " alt="Nhật ký hệ thống" />,
        permission: 'GET_AUDIT_LOG',
      },
      {
        title: 'Hệ thống',
        href: '/setting',
        icon: <img src="/icons/hệ thống.png" className="w-[18px] h-[18px] " alt="Hệ thống" />,
        permission: 'GET_SETTING',
      },
    ],
  },
]
