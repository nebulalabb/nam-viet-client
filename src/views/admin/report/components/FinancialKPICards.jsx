import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const FinancialKPICards = ({ kpi, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    )
  }

  if (!kpi) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Đang tải...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalReceipts = Number(kpi.totalReceipts || 0)
  const totalPayments = Number(kpi.totalPayments || 0)
  const netCashFlow = Number(kpi.netCashFlow || 0)
  const profitMargin = totalReceipts > 0 ? ((netCashFlow / totalReceipts) * 100).toFixed(1) : '0.0'

  const cards = [
    {
      title: 'Tổng thu',
      value: formatCurrency(totalReceipts),
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      subText: kpi.receiptGrowth > 0 ? `+${kpi.receiptGrowth.toFixed(1)}%` : `${kpi.receiptGrowth?.toFixed(1) || 0}%` + ' so với kỳ trước',
      valueColor: 'text-green-600',
    },
    {
      title: 'Tổng chi',
      value: formatCurrency(totalPayments),
      icon: TrendingDown,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      subText: kpi.paymentGrowth > 0 ? `+${kpi.paymentGrowth.toFixed(1)}%` : `${kpi.paymentGrowth?.toFixed(1) || 0}%` + ' so với kỳ trước',
      valueColor: 'text-red-600',
    },
    {
      title: 'Lợi nhuận',
      value: formatCurrency(netCashFlow),
      icon: Wallet,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      subText: kpi.cashFlowGrowth > 0 ? `+${kpi.cashFlowGrowth.toFixed(1)}%` : `${kpi.cashFlowGrowth?.toFixed(1) || 0}%` + ' so với kỳ trước',
      valueColor: netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600',
    },
    {
      title: 'Tỷ suất LN',
      value: `${profitMargin}%`,
      icon: PieChart,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      subText: 'Lợi nhuận / Doanh thu',
      valueColor: 'text-purple-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 dark:bg-gray-800 dark:border-gray-700"
            style={{ borderLeftColor: card.iconColor.replace('text-', '#').replace('green', '22c55e').replace('red', 'ef4444').replace('blue', '3b82f6').replace('purple', 'a855f7') }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.bgColor} dark:bg-opacity-20 transition-transform duration-300 hover:scale-110`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.valueColor}`}>
                {card.value}
              </div>
              {card.subText && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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

export default FinancialKPICards
