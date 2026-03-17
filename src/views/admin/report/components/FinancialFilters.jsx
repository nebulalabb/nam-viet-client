import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

const FinancialFilters = ({ filters, onFilterChange, loading = false }) => {
  const handleInputChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  const handleDateChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFilterChange(newFilters)
  }

  return (
    <Card className="shadow-lg border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Date Filters - Left Side */}
          <div className="flex-1">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Khoảng thời gian
            </Label>
            <div className="flex gap-2 mt-1">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.fromDate || ''}
                  onChange={(e) => handleDateChange('fromDate', e.target.value)}
                  className="h-11 pl-10 px-4 text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200"
                />
              </div>
              <span className="flex items-center text-gray-500">-</span>
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={filters.toDate || ''}
                  onChange={(e) => handleDateChange('toDate', e.target.value)}
                  className="h-11 pl-10 px-4 text-base border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons - Right Side */}
          <div className="flex gap-2">
            <Button 
              onClick={() => onFilterChange({ ...filters })}
              disabled={loading}
              className="h-11 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              {loading ? 'Đang tải...' : 'Tìm kiếm'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FinancialFilters
