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
import SupplierPage from '../views/admin/supplier/SupplierPage'
import CustomerDebtPage from '@/views/admin/debt/CustomerDebtPage'
import CategoryPage from '../views/admin/category/CategoryPage'
import WarehousePage from '../views/admin/warehouse/WarehousePage'
import UserPage from '../views/admin/user/UserPage'
import RolePage from '../views/admin/role/RolePage'
import SystemLogPage from '../views/admin/setting/system-log/SystemLogPage'
import SettingPage from '../views/admin/setting/SettingPage'
import GeneralSettingPage from '../views/admin/setting/general/GeneralSettingPage'
import SystemInformationPage from '../views/admin/setting/system-information/SystemInformationPage'
import AccessLogPage from '../views/admin/setting/access-log/AccessLogPage'
import ActivePromotionsPage from '../views/admin/promotion/active-promotions/ActivePromotionsPage'
import UnitPage from '../views/admin/unit/UnitPage'
import ProductPage from '../views/admin/product/ProductPage'


const routes = [
  {
    path: '/dashboard',
    element: DashboardPage,
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
    path: '/unit',
    element: UnitPage,
    layout: AdminLayout,
  },
  {
    path: '/product',
    element: ProductPage,
    layout: AdminLayout,
  },

  //Công nợ khách hàng
  {
    path: '/customer-debt',
    element: CustomerDebtPage,
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
    path: '/user',
    element: UserPage,
    layout: AdminLayout,
  },
  {
    path: '/supplier',
    element: SupplierPage,
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
