import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'
import api from '@/utils/axios'
import { toast } from 'sonner'

const SalesAdvancedFilters = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [warehouses, setWarehouses] = useState([])
  const [customers, setCustomers] = useState([])
  const [staff, setStaff] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        // Try the dedicated warehouses filter endpoint first
        const response = await api.get('/reports/filter-options/warehouses')
        if (response.data.success) {
          setWarehouses(response.data.data || [])
          return
        }
      } catch (error) {
        console.error('Error fetching warehouses from dedicated endpoint:', error)
      }

      try {
        // Fallback: try to get from sales report filter options
        const fallbackResponse = await api.get('/reports/sales/filter-options', {
          params: { action: 'getWarehouses' }
        })
        if (fallbackResponse.data.success) {
          setWarehouses(fallbackResponse.data.data || [])
        }
      } catch (fallbackError) {
        console.error('Fallback warehouse fetch failed:', fallbackError)
        toast.error('Không thể tải danh sách kho')
      }
    }
    fetchWarehouses()
  }, [])

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get('/reports/sales/filter-options', {
          params: { action: 'get-sales-staff' }
        })
        if (response.data.success) {
          setStaff(response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching staff:', error)
      }
    }
    if (isExpanded) {
      fetchStaff()
    }
  }, [isExpanded])

  // Search customers
  const handleCustomerSearch = async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setCustomers([])
      return
    }

    try {
      setLoading(true)
      const response = await api.get('/reports/sales/filter-options', {
        params: { action: 'search-customer', keyword }
      })
      if (response.data.success) {
        setCustomers(response.data.data || [])
      }
    } catch (error) {
      console.error('Error searching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounce customer search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCustomerSearch(customerSearch)
    }, 500)
    return () => clearTimeout(timer)
  }, [customerSearch])

  const handleChange = (key, value) => {
    onFilterChange({ [key]: value })
  }

  const handleReset = () => {
    onFilterChange({
      warehouseId: null,
      salesChannel: null,
      customerId: null,
      createdBy: null,
      orderStatus: null
    })
    setCustomerSearch('')
  }

  const salesChannels = [
    { value: 'retail', label: 'Bán lẻ' },
    { value: 'wholesale', label: 'Bán sỉ' },
    { value: 'online', label: 'Trực tuyến' },
    { value: 'distributor', label: 'Đại lý' }
  ]

  const orderStatuses = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' }
  ]

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-700">
      <CardContent className="pt-4">
        {/* Toggle Button */}
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between mb-4 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Bộ lọc nâng cao</span>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Warehouse Filter */}
              <div>
                <Label htmlFor="warehouse" className="text-sm font-semibold">
                  Chi nhánh/Kho
                </Label>
                <select
                  id="warehouse"
                  value={filters.warehouseId || ''}
                  onChange={(e) => handleChange('warehouseId', e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full h-10 px-3 text-sm border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none"
                >
                  <option value="">Tất cả kho</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.warehouseName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Channel Filter */}
              <div>
                <Label htmlFor="channel" className="text-sm font-semibold">
                  Kênh bán hàng
                </Label>
                <select
                  id="channel"
                  value={filters.salesChannel || ''}
                  onChange={(e) => handleChange('salesChannel', e.target.value || null)}
                  className="mt-1 w-full h-10 px-3 text-sm border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none"
                >
                  <option value="">Tất cả kênh</option>
                  {salesChannels.map((ch) => (
                    <option key={ch.value} value={ch.value}>
                      {ch.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Status Filter */}
              <div>
                <Label htmlFor="status" className="text-sm font-semibold">
                  Trạng thái đơn
                </Label>
                <select
                  id="status"
                  value={filters.orderStatus || ''}
                  onChange={(e) => handleChange('orderStatus', e.target.value || null)}
                  className="mt-1 w-full h-10 px-3 text-sm border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none"
                >
                  <option value="">Tất cả trạng thái</option>
                  {orderStatuses.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Filter */}
              <div>
                <Label htmlFor="staff" className="text-sm font-semibold">
                  Nhân viên bán hàng
                </Label>
                <select
                  id="staff"
                  value={filters.createdBy || ''}
                  onChange={(e) => handleChange('createdBy', e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full h-10 px-3 text-sm border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none"
                >
                  <option value="">Tất cả nhân viên</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Search */}
              <div className="md:col-span-2">
                <Label htmlFor="customer" className="text-sm font-semibold">
                  Khách hàng
                </Label>
                <div className="relative">
                  <input
                    id="customer"
                    type="text"
                    placeholder="Tìm kiếm khách hàng (tối thiểu 2 ký tự)..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="mt-1 w-full h-10 px-3 text-sm border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none"
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full" />
                    </div>
                  )}
                </div>
                {customers.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          handleChange('customerId', c.id)
                          setCustomerSearch(c.customerName)
                          setCustomers([])
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                      >
                        <span>{c.customerName}</span>
                        <span className="text-xs text-gray-500">{c.customerCode}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reset Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleReset}
                className="h-10 px-6"
              >
                Xóa bộ lọc nâng cao
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SalesAdvancedFilters
