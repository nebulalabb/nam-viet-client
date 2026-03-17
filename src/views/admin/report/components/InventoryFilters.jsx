import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import api from '@/utils/axios'

const InventoryFilters = ({ filters, onFilterChange, loading = false }) => {
  const [warehouses, setWarehouses] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(false)

  // Fetch warehouses and categories for filter
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true)
      try {
        console.log('🔍 Fetching filter options...')
        const [warehousesRes, categoriesRes] = await Promise.all([
          api.get('/reports/filter-options/warehouses').catch((err) => {
            console.error('❌ Warehouses filter API error:', err.response?.data || err.message)
            return { data: { data: [] } }
          }),
          api.get('/categories').catch((err) => {
            console.error('❌ Categories API error:', err.response?.data || err.message)
            return { data: { data: [] } }
          })
        ])
        
        console.log('✅ Warehouses response:', warehousesRes.data)
        console.log('✅ Categories response:', categoriesRes.data)
        
        const warehousesList = warehousesRes.data.data || []
        const categoriesList = categoriesRes.data.data || []
        
        console.log('📦 Warehouses count:', warehousesList.length)
        console.log('📦 Categories count:', categoriesList.length)
        
        setWarehouses(warehousesList)
        setCategories(categoriesList)
      } catch (error) {
        console.error('❌ Error fetching filter options:', error)
        setWarehouses([])
        setCategories([])
      } finally {
        setLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [])

  const productTypes = [
    { value: 'raw_material', label: 'Nguyên liệu' },
    { value: 'packaging', label: 'Bao bì' },
    { value: 'finished_product', label: 'Thành phẩm' },
    { value: 'goods', label: 'Hàng hóa' }
  ]

  const stockStatuses = [
    { value: 'all', label: 'Tất cả' },
    { value: 'safe', label: 'An toàn' },
    { value: 'low', label: 'Thấp' },
    { value: 'out', label: 'Hết hàng' }
  ]

  const handleInputChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  return (
    <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 mb-4">
      <CardContent className="pt-6">
        {/* Single Row: Search Left, Filters Right */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search - Left Side */}
          <div className="flex-1">
            <Label htmlFor="searchTerm" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tìm kiếm
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="searchTerm"
                type="text"
                placeholder="Tìm theo SKU hoặc tên sản phẩm..."
                value={filters.searchTerm || ''}
                onChange={(e) => handleInputChange('searchTerm', e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onFilterChange(filters)
                  }
                }}
                className="h-11 px-4 text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200"
              />
              <Button 
                onClick={() => onFilterChange(filters)}
                disabled={loading}
                className="h-11 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters - Right Side */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Warehouse */}
            <div className="w-full md:w-48">
              <Label htmlFor="warehouseId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Chi nhánh/Kho
              </Label>
              <select
                id="warehouseId"
                value={filters.warehouseId || ''}
                onChange={(e) => handleInputChange('warehouseId', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loadingOptions}
                className="mt-1 w-full h-11 px-4 text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
              >
                <option value="">Tất cả kho</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.warehouseName}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="w-full md:w-48">
              <Label htmlFor="categoryId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Danh mục
              </Label>
              <select
                id="categoryId"
                value={filters.categoryId || ''}
                onChange={(e) => handleInputChange('categoryId', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loadingOptions}
                className="mt-1 w-full h-11 px-4 text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 focus:outline-none transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiring Checkbox */}
            <div className="flex items-center h-11">
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={filters.showExpiring || false}
                  onChange={(e) => handleInputChange('showExpiring', e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sắp hết hạn</span>
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InventoryFilters
