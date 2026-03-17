import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const FinancialCharts = ({ data, isLoading = false }) => {
  if (isLoading || !data) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Dòng tiền</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="h-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
        </CardContent>
      </Card>
    )
  }

  const cashLedgerData = data.cashLedger || []

  const CashFlowTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-semibold">{label ? new Date(label).toLocaleDateString('vi-VN') : ''}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Cash Flow Chart - Full Width */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dòng tiền</CardTitle>
          <p className="text-sm text-muted-foreground">Thu chi theo ngày</p>
        </CardHeader>
        <CardContent className="h-[300px]">
          {cashLedgerData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashLedgerData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  className="text-xs"
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  className="text-xs"
                />
                <Tooltip content={<CashFlowTooltip />} />
                <Area
                  type="monotone"
                  dataKey="totalReceipts"
                  stackId="1"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.6}
                  name="Thu"
                />
                <Area
                  type="monotone"
                  dataKey="totalPayments"
                  stackId="2"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Chi"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialCharts
