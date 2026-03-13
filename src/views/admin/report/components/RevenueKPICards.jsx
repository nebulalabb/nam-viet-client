import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, ShoppingCart, TrendingUp, AlertCircle, Percent, CreditCard } from 'lucide-react'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value)
}

const formatNumber = (value) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatPercentage = (value) => {
  return `${value.toFixed(1)}%`
}

const RevenueKPICards = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border bg-gray-100"
          />
        ))}
      </div>
    )
  }

  if (!data || !data.summary) return null

  const { summary } = data

  // API getSalesReport trả về: netRevenue, totalOrders, newDebt, totalDebt (không có grossRevenue, paidAmount, totalDiscount)
  const grossRevenue = Number(summary.grossRevenue ?? summary.netRevenue ?? 0)
  const totalDiscount = Number(summary.totalDiscount || 0)
  const netRevenue = Number(summary.netRevenue || 0)
  const paidAmount = Number(summary.paidAmount ?? (netRevenue - Number(summary.newDebt ?? summary.totalDebt ?? 0)))
  const totalOrders = Number(summary.totalOrders || 0)
  const debtAmount = Number(summary.debtAmount ?? summary.newDebt ?? summary.totalDebt ?? 0)
  const averageOrderValue = Number(summary.averageOrderValue ?? (totalOrders > 0 ? netRevenue / totalOrders : 0))

  const paidPct = netRevenue > 0 ? (paidAmount / netRevenue) * 100 : 0
  const discountPct = grossRevenue > 0 ? (totalDiscount / grossRevenue) * 100 : 0
  const debtPct = netRevenue > 0 ? (debtAmount / netRevenue) * 100 : 0

  const cards = [
    {
      title: 'Tổng Doanh Thu',
      value: formatCurrency(grossRevenue),
      icon: DollarSign,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Doanh Thu Thuần',
      value: formatCurrency(netRevenue),
      icon: CreditCard,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      subText: `Sau chiết khấu`,
    },
    {
      title: 'Thực Thu',
      value: formatCurrency(paidAmount),
      icon: TrendingUp,
      bgColor: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      subText: `${formatPercentage(paidPct)} đã thanh toán`,
    },
    {
      title: 'Tổng Đơn Hàng',
      value: formatNumber(totalOrders),
      icon: ShoppingCart,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subText: `${formatCurrency(averageOrderValue)}/đơn TB`,
    },
    {
      title: 'Chiết Khấu',
      value: formatCurrency(totalDiscount),
      icon: Percent,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      subText: `${formatPercentage(discountPct)} doanh thu`,
    },
    {
      title: 'Công Nợ Phải Thu',
      value: formatCurrency(debtAmount),
      icon: AlertCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      subText: `${formatPercentage(debtPct)} chưa thu`,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 dark:bg-gray-800 dark:border-gray-700"
            style={{ borderLeftColor: card.iconColor.replace('text-', '#') }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</CardTitle>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor} dark:bg-opacity-20 transition-transform duration-300 hover:scale-110`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              {card.subText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                  {card.subText}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default RevenueKPICards
