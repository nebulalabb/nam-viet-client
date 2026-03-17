import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

const FinancialTopPartners = ({ data, isLoading = false }) => {
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Nhà cung cấp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const { topCustomers = [], topSuppliers = [] } = data

  const classificationColors = {
    vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    wholesale: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    distributor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    retail: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  }

  const classificationLabels = {
    vip: 'VIP',
    wholesale: 'Sỉ',
    distributor: 'Đại lý',
    retail: 'Lẻ',
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Top Customers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Khách hàng thanh toán</CardTitle>
          <p className="text-sm text-muted-foreground">Top 5 KH thanh toán nhiều nhất</p>
        </CardHeader>
        <CardContent>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.customerId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : index === 1
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          : index === 2
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{customer.customerName}</p>
                      <p className="text-xs text-muted-foreground">{customer.customerCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(customer.totalAmount)}</p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        classificationColors[customer.classification] || classificationColors.retail
                      }`}
                    >
                      {classificationLabels[customer.classification] || 'Lẻ'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Suppliers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Top Nhà cung cấp</CardTitle>
          <p className="text-sm text-muted-foreground">Top 5 NCC được trả tiền nhiều nhất</p>
        </CardHeader>
        <CardContent>
          {topSuppliers.length > 0 ? (
            <div className="space-y-3">
              {topSuppliers.map((supplier, index) => (
                <div
                  key={supplier.supplierId}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : index === 1
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          : index === 2
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{supplier.supplierName}</p>
                      <p className="text-xs text-muted-foreground">{supplier.supplierCode}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(supplier.totalAmount)}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200">
                      {supplier.supplierType === 'company' ? 'Công ty' : 'Cá nhân'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center text-muted-foreground">
              Không có dữ liệu
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default FinancialTopPartners
