import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  }).format(value)
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const CHANNEL_LABELS = {
  retail: 'Bán lẻ',
  wholesale: 'Bán sỉ',
  online: 'Trực tuyến',
  distributor: 'Đại lý',
  pickup: 'Mua tại chỗ',
  delivery: 'Giao hàng',
}

const RevenueCharts = ({ data, isLoading = false }) => {
  if (isLoading || !data) return null

  // Prepare trend data for line chart
  const trendData = (data.trendData || data.trends || []).map(item => ({
    date: item.date,
    revenue: item.revenue || item.totalRevenue || 0,
    orders: item.orderCount || 0,
  }))

  // Prepare channel data for pie chart
  // API returns byChannel with netRevenue field, need to map to revenue for chart
  const channelData = (data.byChannel || []).map((item) => ({
    name: CHANNEL_LABELS[item.channel] || item.channel,
    value: item.netRevenue || item.revenue || 0,
    orderCount: item.orderCount,
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-semibold">{payload[0].payload.date}</p>
          <p className="text-sm text-blue-600">
            Doanh thu: {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.orders && (
            <p className="text-sm text-gray-600">
              Đơn hàng: {payload[0].payload.orders}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-semibold">{payload[0].name}</p>
          <p className="text-sm text-blue-600">
            Doanh thu: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            Đơn hàng: {payload[0].payload.orderCount}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Line Chart: Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Xu hướng Doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return `${date.getDate()}/${date.getMonth() + 1}`
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                    return value
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[350px] text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pie Chart: Revenue by Channel */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh thu theo Kênh bán hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {channelData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Channel Table */}
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left">Kênh</th>
                      <th className="px-4 py-2 text-right">Doanh thu</th>
                      <th className="px-4 py-2 text-right">Đơn hàng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {channelData.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-4 py-2 flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          {item.name}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(item.value)}
                        </td>
                        <td className="px-4 py-2 text-right text-muted-foreground">
                          {item.orderCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RevenueCharts
