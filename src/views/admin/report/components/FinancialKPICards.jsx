import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const moneyFmt = (v) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0)

const KPICard = ({ label, value, icon: Icon, color, bgColor, description, loading }) => (
  <Card className="border-0 shadow-sm overflow-hidden">
    <CardContent className="p-5">
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{moneyFmt(value)}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`h-11 w-11 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)

const FinancialKPICards = ({ openingBalance, totalReceipt, totalPayment, closingBalance, loading }) => {
  const cards = [
    {
      label: 'Quỹ đầu kỳ',
      value: openingBalance,
      icon: Wallet,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-100 dark:bg-slate-800',
      description: 'Số dư trước kỳ báo cáo',
    },
    {
      label: 'Tổng thu',
      value: totalReceipt,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
      description: 'Tổng phiếu thu trong kỳ',
    },
    {
      label: 'Tổng chi',
      value: totalPayment,
      icon: TrendingDown,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 dark:bg-rose-900/30',
      description: 'Tổng phiếu chi trong kỳ',
    },
    {
      label: 'Tồn quỹ hiện tại',
      value: closingBalance,
      icon: DollarSign,
      color: closingBalance >= 0 ? 'text-blue-600' : 'text-rose-600',
      bgColor: closingBalance >= 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-rose-50 dark:bg-rose-900/30',
      description: 'Quỹ đầu kỳ + Thu - Chi',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      {cards.map((card) => (
        <KPICard key={card.label} {...card} loading={loading} />
      ))}
    </div>
  )
}

export default FinancialKPICards
