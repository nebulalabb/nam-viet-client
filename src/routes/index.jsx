import DashboardPage from '../views/admin/dashboard/DashboardPage'
import LoginPage from '../views/auth/LoginPage'
import ForgotPasswordPage from '../views/auth/ForgotPasswordPage'
import ResetPasswordPage from '../views/auth/ResetPasswordPage'
import CallbackGoogle from '../views/auth/components/CallbackGoogle'
import ErrorPage from '../views/error/ErrorPage'
import AdminLayout from '../views/layouts/AdminLayout'
import AuthLayout from '../views/layouts/AuthLayout'
import ErrorLayout from '../views/layouts/ErrorLayout'
import CustomerPage from '../views/admin/customer/CustomerPage'
import EmployeePage from '../views/admin/employee/EmployeePage'
import PromotionPage from '../views/admin/promotion/PromotionPage'
import ActivePromotionPage from '../views/admin/promotion/ActivePromotionPage'
import SupplierPage from '../views/admin/supplier/SupplierPage'
import CustomerDebtPage from '@/views/admin/debt/CustomerDebtPage'
import CategoryPage from '../views/admin/category/CategoryPage'
import WarehousePage from '../views/admin/warehouse/WarehousePage'
import UserPage from '../views/admin/user/UserPage' // Giữ nguyên UserPage cho trang User
import RolePage from '../views/admin/role/RolePage'
import SystemLogPage from '../views/admin/setting/system-log/SystemLogPage'
import SettingPage from '../views/admin/setting/SettingPage'
import GeneralSettingPage from '../views/admin/setting/general/GeneralSettingPage'
import SystemInformationPage from '../views/admin/setting/system-information/SystemInformationPage'
import AccessLogPage from '../views/admin/setting/access-log/AccessLogPage'
import ActivePromotionsPage from '../views/admin/promotion/active-promotions/ActivePromotionsPage'
import UnitPage from '../views/admin/unit/UnitPage'
import ProductPage from '../views/admin/product/ProductPage'
// import WarehouseInPage from '../views/admin/warehouse-in/WarehouseInPage'
// import WarehouseOutPage from '../views/admin/warehouse-out/WarehouseOutPage'
import InventoryWarningPage from '../views/admin/inventory-warning/InventoryWarningPage'
import AttributePage from '../views/admin/attribute/AttributePage'
import TaxPage from '../views/admin/tax/TaxPage'

import TicketPage from '@/views/admin/ticket/TicketPage'
import TaskPage from '@/views/admin/task/TaskPage'
import MaterialPage from '@/views/admin/material/MaterialPage'
import AttendancePage from '@/views/admin/attendance/AttendancePage'

import OvertimePage from '@/views/admin/overtime/OvertimePage'
import InvoicePage from '@/views/admin/invoice/InvoicePage'
import MyInvoicePage from '@/views/admin/invoice/MyInvoicePage'
import PurchaseOrderPage from '@/views/admin/purchase-order/PurchaseOrderPage'
import MyPurchaseOrderPage from '@/views/admin/purchase-order/MyPurchaseOrderPage'
import ReceiptPage from '@/views/admin/receipt/ReceiptPage'
import MyReceiptPage from '@/views/admin/receipt/MyReceiptPage'
import PaymentPage from '@/views/admin/payment/PaymentPage'
import MyPaymentPage from '@/views/admin/payment/MyPaymentPage'
import WarehouseInPage from '@/views/admin/warehouse-receipt/WarehouseInPage'
import WarehouseOutPage from '@/views/admin/warehouse-receipt/WarehouseOutPage'

import SalaryPage from '@/views/admin/salary/SalaryPage'
import SalaryCalculatePage from '@/views/admin/salary/SalaryCalculatePage'

const routes = [
  {
    path: '/attendance',
    element: AttendancePage,
    layout: AdminLayout,
  },
  {
    path: '/overtime',
    element: OvertimePage,
    layout: AdminLayout,
  },
  {
    path: '/salary',
    element: SalaryPage,
    layout: AdminLayout,
  },
  {
    path: '/salary/calculate',
    element: SalaryCalculatePage,
    layout: AdminLayout,
  },
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: AdminLayout,
  },
  {
    path: '/ticket',
    element: TicketPage,
    layout: AdminLayout,
  },
  {
    path: '/task',
    element: TaskPage,
    layout: AdminLayout,
  },
  {
    path: '/system-log',
    element: SystemLogPage,
    layout: AdminLayout,
  },
  {
    path: '/setting',
    element: SettingPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/general-information',
    element: GeneralSettingPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/system-information',
    element: SystemInformationPage,
    layout: AdminLayout,
  },
  {
    path: '/setting/access-log',
    element: AccessLogPage,
    layout: AdminLayout,
  },
  {
    path: '/active-promotions',
    element: ActivePromotionsPage,
    layout: AdminLayout,
  },
  {
    path: '/role-and-permissions',
    element: RolePage,
    layout: AdminLayout,
  },
  {
    path: '/customer',
    element: CustomerPage,
    layout: AdminLayout,
  },
  {
    path: '/employee',
    element: EmployeePage,
    layout: AdminLayout,
  },
  {
    path: '/promotion',
    element: PromotionPage,
    layout: AdminLayout,
  },
  {
    path: '/active-promotions',
    element: ActivePromotionPage,
    layout: AdminLayout,
  },
  {
    path: '/unit',
    element: UnitPage,
    layout: AdminLayout,
  },
  {
    path: '/product',
    element: ProductPage,
    layout: AdminLayout,
  },
  {
    path: '/attribute',
    element: AttributePage,
    layout: AdminLayout,
  },
  {
    path: '/tax',
    element: TaxPage,
    layout: AdminLayout,
  },

  //Công nợ khách hàng
  {
    path: '/customer-debt',
    element: CustomerDebtPage,
    layout: AdminLayout,
  },
  {
    path: '/invoice',
    element: InvoicePage,
    layout: AdminLayout,
  },
  {
    path: '/invoice-user',
    element: MyInvoicePage,
    layout: AdminLayout,
  },

  {
    path: '/purchase-order',
    element: PurchaseOrderPage,
    layout: AdminLayout,
  },
  {
    path: '/purchase-order-user',
    element: MyPurchaseOrderPage,
    layout: AdminLayout,
  },
  {
    path: '/receipt',
    element: ReceiptPage,
    layout: AdminLayout,
  },
  {
    path: '/receipt-user',
    element: MyReceiptPage,
    layout: AdminLayout,
  },
  {
    path: '/payment',
    element: PaymentPage,
    layout: AdminLayout,
  },
  {
    path: '/payment-user',
    element: MyPaymentPage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-in',
    element: WarehouseInPage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-out',
    element: WarehouseOutPage,
    layout: AdminLayout,
  },
  {
    path: '/category',
    element: CategoryPage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-list',
    element: WarehousePage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-in',
    element: WarehouseInPage,
    layout: AdminLayout,
  },
  {
    path: '/warehouse-out',
    element: WarehouseOutPage,
    layout: AdminLayout,
  },
  {
    path: '/inventory-warning',
    element: InventoryWarningPage,
    layout: AdminLayout,
  },
  {
    path: '/user',
    element: UserPage, // Trang người dùng hệ thống
    layout: AdminLayout,
  },
  {
    path: '/supplier',
    element: SupplierPage,
    layout: AdminLayout,
  },
  {
    path: '/material',
    element: MaterialPage,
    layout: AdminLayout,
  },
  {
    path: '/forgot-password',
    element: ForgotPasswordPage,
    layout: AuthLayout,
  },
  {
    path: '/reset-password',
    element: ResetPasswordPage,
    layout: AuthLayout,
  },
  {
    path: '/auth/google/callback',
    element: CallbackGoogle,
    layout: AuthLayout,
  },
  {
    path: '/',
    element: LoginPage,
    layout: AuthLayout,
  },
  {
    path: '*',
    element: ErrorPage,
    layout: ErrorLayout,
  },
]

export default routes