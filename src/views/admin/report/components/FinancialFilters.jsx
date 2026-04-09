import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Search, X, ChevronDown } from 'lucide-react'
import { format, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { vi } from 'date-fns/locale'
import api from '@/utils/axios'

const VOUCHER_TYPES = [
  { value: 'all', label: 'Tất cả' },
  // Thu
  { value: 'sales', label: 'Thu - Bán hàng', group: 'Thu' },
  { value: 'debt_collection', label: 'Thu - Thu nợ', group: 'Thu' },
  { value: 'refund', label: 'Thu - Hoàn trả', group: 'Thu' },
  // Chi
  { value: 'supplier_payment', label: 'Chi - Nhà cung cấp', group: 'Chi' },
  { value: 'salary', label: 'Chi - Lương', group: 'Chi' },
  { value: 'operating_cost', label: 'Chi - Chi phí VH', group: 'Chi' },
  { value: 'other', label: 'Chi - Khác', group: 'Chi' },
]

const TIME_PRESETS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'thisWeek', label: 'Tuần này' },
  { value: 'thisMonth', label: 'Tháng này' },
  { value: 'lastMonth', label: 'Tháng trước' },
  { value: 'custom', label: 'Tùy chọn' },
]

const RECEIVER_TYPES = [
  { value: 'customer', label: 'Khách hàng' },
  { value: 'supplier', label: 'Nhà cung cấp' },
  { value: 'other', label: 'Khác' },
]

const getPresetDates = (preset) => {
  const today = new Date()
  switch (preset) {
    case 'today':
      return {
        fromDate: format(today, 'yyyy-MM-dd'),
        toDate: format(today, 'yyyy-MM-dd'),
      }
    case 'thisWeek':
      return {
        fromDate: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        toDate: format(today, 'yyyy-MM-dd'),
      }
    case 'thisMonth':
      return {
        fromDate: format(startOfMonth(today), 'yyyy-MM-dd'),
        toDate: format(today, 'yyyy-MM-dd'),
      }
    case 'lastMonth': {
      const lm = subMonths(today, 1)
      return {
        fromDate: format(startOfMonth(lm), 'yyyy-MM-dd'),
        toDate: format(new Date(lm.getFullYear(), lm.getMonth() + 1, 0), 'yyyy-MM-dd'),
      }
    }
    default:
      return null
  }
}

const FinancialFilters = ({ filters, onFilterChange, loading }) => {
  const [local, setLocal] = useState({
    fromDate: filters.fromDate || '',
    toDate: filters.toDate || '',
    customerId: '',
    supplierId: '',
    createdById: '',
    receiverName: '',
    receiverTypes: [],
    voucherType: 'all',
    timePreset: 'thisMonth',
  })

  const [customers, setCustomers] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [staff, setStaff] = useState([])
  const [showFromCal, setShowFromCal] = useState(false)
  const [showToCal, setShowToCal] = useState(false)

  useEffect(() => {
    // Fetch dropdown data
    const fetchOptions = async () => {
      try {
        const [cusRes, supRes, staffRes] = await Promise.allSettled([
          api.get('/customers?limit=200&status=active'),
          api.get('/suppliers?limit=200'),
          api.get('/users?limit=200'),
        ])
        if (cusRes.status === 'fulfilled') {
          setCustomers(cusRes.value.data?.data?.customers || cusRes.value.data?.data || [])
        }
        if (supRes.status === 'fulfilled') {
          setSuppliers(supRes.value.data?.data?.suppliers || supRes.value.data?.data || [])
        }
        if (staffRes.status === 'fulfilled') {
          setStaff(staffRes.value.data?.data?.users || staffRes.value.data?.data || [])
        }
      } catch (e) {
        console.warn('Failed to load filter options:', e)
      }
    }
    fetchOptions()
  }, [])

  const handlePresetChange = (preset) => {
    const dates = getPresetDates(preset)
    if (dates) {
      setLocal(prev => ({ ...prev, timePreset: preset, ...dates }))
    } else {
      setLocal(prev => ({ ...prev, timePreset: preset }))
    }
  }

  const toggleReceiverType = (type) => {
    setLocal(prev => {
      const existing = prev.receiverTypes
      return {
        ...prev,
        receiverTypes: existing.includes(type)
          ? existing.filter(t => t !== type)
          : [...existing, type],
      }
    })
  }

  const handleApply = () => {
    const payload = {
      fromDate: local.fromDate,
      toDate: local.toDate,
      customerId: local.customerId || undefined,
      supplierId: local.supplierId || undefined,
      createdById: local.createdById || undefined,
      receiverName: local.receiverName || undefined,
      receiverTypes: local.receiverTypes.length > 0 ? local.receiverTypes.join(',') : undefined,
      voucherType: local.voucherType !== 'all' ? local.voucherType : undefined,
    }
    onFilterChange(payload)
  }

  const handleReset = () => {
    const today = new Date()
    const reset = {
      fromDate: format(startOfMonth(today), 'yyyy-MM-dd'),
      toDate: format(today, 'yyyy-MM-dd'),
      customerId: '',
      supplierId: '',
      createdById: '',
      receiverName: '',
      receiverTypes: [],
      voucherType: 'all',
      timePreset: 'thisMonth',
    }
    setLocal(reset)
    onFilterChange({ fromDate: reset.fromDate, toDate: reset.toDate })
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border shadow-sm p-4 mb-4 space-y-3">
      {/* Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Time preset */}
        <div className="col-span-2 md:col-span-1">
          <Label className="text-xs font-medium mb-1 block">Thời gian</Label>
          <Select value={local.timePreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_PRESETS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From date */}
        <div>
          <Label className="text-xs font-medium mb-1 block">Từ ngày</Label>
          <Popover open={showFromCal} onOpenChange={setShowFromCal}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full text-sm justify-start font-normal">
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                {local.fromDate || 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[200]" align="start">
              <Calendar
                mode="single"
                selected={local.fromDate ? new Date(local.fromDate) : undefined}
                onSelect={d => {
                  if (d) {
                    setLocal(prev => ({ ...prev, fromDate: format(d, 'yyyy-MM-dd'), timePreset: 'custom' }))
                    setShowFromCal(false)
                  }
                }}
                locale={vi}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* To date */}
        <div>
          <Label className="text-xs font-medium mb-1 block">Đến ngày</Label>
          <Popover open={showToCal} onOpenChange={setShowToCal}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-full text-sm justify-start font-normal">
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                {local.toDate || 'Chọn ngày'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[200]" align="start">
              <Calendar
                mode="single"
                selected={local.toDate ? new Date(local.toDate) : undefined}
                onSelect={d => {
                  if (d) {
                    setLocal(prev => ({ ...prev, toDate: format(d, 'yyyy-MM-dd'), timePreset: 'custom' }))
                    setShowToCal(false)
                  }
                }}
                locale={vi}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Loại phiếu */}
        <div>
          <Label className="text-xs font-medium mb-1 block">Loại phiếu</Label>
          <Select value={local.voucherType} onValueChange={v => setLocal(prev => ({ ...prev, voucherType: v }))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOUCHER_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Khách hàng */}
        <div>
          <Label className="text-xs font-medium mb-1 block">Khách hàng</Label>
          <Select value={local.customerId || '_all'} onValueChange={v => setLocal(prev => ({ ...prev, customerId: v === '_all' ? '' : v }))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tất cả KH</SelectItem>
              {customers.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.customerName || c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nhà cung cấp */}
        <div>
          <Label className="text-xs font-medium mb-1 block">Nhà cung cấp</Label>
          <Select value={local.supplierId || '_all'} onValueChange={v => setLocal(prev => ({ ...prev, supplierId: v === '_all' ? '' : v }))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tất cả NCC</SelectItem>
              {suppliers.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.supplierName || s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
        {/* NV lập phiếu */}
        <div>
          <Label className="text-xs font-medium mb-1 block">NV lập phiếu</Label>
          <Select value={local.createdById || '_all'} onValueChange={v => setLocal(prev => ({ ...prev, createdById: v === '_all' ? '' : v }))}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">Tất cả NV</SelectItem>
              {staff.map(u => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.fullName || u.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tên người nhận */}
        <div>
          <Label className="text-xs font-medium mb-1 block">Tên người nhận</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-9 text-sm pl-8"
              placeholder="Tìm tên..."
              value={local.receiverName}
              onChange={e => setLocal(prev => ({ ...prev, receiverName: e.target.value }))}
            />
          </div>
        </div>

        {/* Loại đối tượng (checkbox) */}
        <div className="col-span-2 md:col-span-1">
          <Label className="text-xs font-medium mb-1 block">Loại đối tượng</Label>
          <div className="flex items-center gap-2 h-9">
            {RECEIVER_TYPES.map(rt => (
              <button
                key={rt.value}
                type="button"
                onClick={() => toggleReceiverType(rt.value)}
                className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                  local.receiverTypes.includes(rt.value)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                {rt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="hidden lg:block lg:col-span-2" />

        {/* Action buttons */}
        <div className="flex gap-2 justify-end col-span-2 md:col-span-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 gap-1"
            disabled={loading}
          >
            <X className="h-3.5 w-3.5" />
            Hủy lọc
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="h-9 gap-1"
            disabled={loading}
          >
            <Search className="h-3.5 w-3.5" />
            Lọc
          </Button>
        </div>
      </div>

      {/* Active filter badges */}
      {(local.customerId || local.supplierId || local.receiverName || local.receiverTypes.length > 0 || (local.voucherType && local.voucherType !== 'all')) && (
        <div className="flex flex-wrap gap-1 pt-1 border-t">
          {local.voucherType && local.voucherType !== 'all' && (
            <Badge variant="secondary" className="text-xs gap-1">
              Loại: {VOUCHER_TYPES.find(t => t.value === local.voucherType)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setLocal(p => ({ ...p, voucherType: 'all' }))} />
            </Badge>
          )}
          {local.receiverName && (
            <Badge variant="secondary" className="text-xs gap-1">
              Tên: {local.receiverName}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setLocal(p => ({ ...p, receiverName: '' }))} />
            </Badge>
          )}
          {local.receiverTypes.map(rt => (
            <Badge key={rt} variant="secondary" className="text-xs gap-1">
              {RECEIVER_TYPES.find(r => r.value === rt)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleReceiverType(rt)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export default FinancialFilters
