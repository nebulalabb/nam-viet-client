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
import CategoryPage from '../views/admin/category/CategoryPage'
import WarehousePage from '../views/admin/warehouse/WarehousePage'

const routes = [
  {
    path: '/dashboard',
    element: DashboardPage,
    layout: AdminLayout,
  },
  {
    path: '/customer',
    element: CustomerPage,
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
