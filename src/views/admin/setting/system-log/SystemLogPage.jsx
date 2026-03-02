import { Layout, LayoutBody } from '@/components/custom/Layout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSystemLogs } from '@/stores/SystemLogSlice'
import { SystemLogPagination } from './SystemLogPagination'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Eye, Plus, Edit3, Trash2, LogIn, LogOut } from 'lucide-react'
import { DateRange } from '@/components/custom/DateRange'
import { getUsers } from '@/stores/UserSlice'
import { format } from 'date-fns'
import LogDetailDialog from './LogDetailDialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const SystemLogPage = () => {
  const dispatch = useDispatch()
  const { logs, loading, meta } = useSelector((state) => state.systemLog)
  const { users } = useSelector((state) => state.user)

  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    userId: 'all',
    action: 'all',
    entity: 'all',
    ipAddress: '',
    fromDate: undefined,
    toDate: undefined,
  })

  // Detail Dialog State
  const [selectedLog, setSelectedLog] = useState(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Visible Columns state
  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    action: true,
    entity: true,
    ip: true,
    userAgent: true,
    time: true,
    detail: true,
  })

  // Load initial data and users
  useEffect(() => {
    document.title = 'Nhật ký hệ thống - CRM'
    // Fetch users for filter
    if (!users || users.length === 0) {
      dispatch(getUsers())
    }
  }, [dispatch, users])

  // Fetch logs whenever filters change
  useEffect(() => {
    const params = {
      page: filters.page,
      limit: filters.limit,
      // Handle 'all' values
      userId: filters.userId !== 'all' ? filters.userId : undefined,
      action: filters.action !== 'all' ? filters.action : undefined,
      entity: filters.entity !== 'all' ? filters.entity : undefined,
      ipAddress: filters.ipAddress || undefined,
      // Format dates to ISO/YYYY-MM-DD
      startDate: filters.fromDate ? format(filters.fromDate, 'yyyy-MM-dd') : undefined,
      endDate: filters.toDate ? format(filters.toDate, 'yyyy-MM-dd') : undefined,
    }
    dispatch(getSystemLogs(params))
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to page 1 on filter change
    }))
  }

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      userId: 'all',
      action: 'all',
      entity: 'all',
      ipAddress: '',
      fromDate: undefined,
      toDate: undefined,
    })
  }

  const openDetail = (log) => {
    setSelectedLog(log)
    setShowDetailDialog(true)
  }

  const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']

  const ACTIONS_CONFIG = {
    CREATE: {
      label: 'CREATE',
      icon: Plus,
      color: 'border-green-700 bg-transparent text-green-700',
    },
    UPDATE: {
      label: 'UPDATE',
      icon: Edit3,
      color: 'border-blue-700 bg-transparent text-blue-700',
    },
    DELETE: {
      label: 'DELETE',
      icon: Trash2,
      color: 'border-red-700 bg-transparent text-red-700',
    },
    LOGIN: {
      label: 'LOGIN',
      icon: LogIn,
      color: 'border-purple-700 bg-transparent text-purple-700',
    },
    LOGOUT: {
      label: 'LOGOUT',
      icon: LogOut,
      color: 'border-orange-700 bg-transparent text-orange-700',
    },
  }

  const ENTITIES_CONFIG = {
    User: { label: 'Người dùng', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    Customer: { label: 'Khách hàng', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    Supplier: { label: 'Nhà cung cấp', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    Product: { label: 'Sản phẩm', color: 'bg-teal-100 text-teal-700 border-teal-200' },
    SalesContract: { label: 'Hợp đồng bán', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    PurchaseContract: { label: 'Hợp đồng mua', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    PurchaseOrder: { label: 'Đơn mua hàng', color: 'bg-sky-100 text-sky-700 border-sky-200' },
    Invoice: { label: 'Hóa đơn', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    PaymentVoucher: { label: 'Phiếu thu/chi', color: 'bg-rose-100 text-rose-700 border-rose-200' },
    WarehouseReceipt: { label: 'Phiếu kho', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  }

  return (
    <Layout>
      <LayoutBody className="flex flex-col space-y-4" fixedHeight>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Nhật ký hệ thống
          </h2>
        </div>

        {/* Toolbar */}
        <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
          <div className="flex flex-1 items-center space-x-2">
            {/* User Select */}
            <Select
              value={filters.userId?.toString()}
              onValueChange={(val) => handleFilterChange('userId', val)}
            >
              <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                <SelectValue placeholder="Người dùng" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  {users?.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.fullName || u.username}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Action Select */}
            <Select
              value={filters.action}
              onValueChange={(val) => handleFilterChange('action', val)}
            >
              <SelectTrigger className="h-8 w-[150px]">
                <SelectValue placeholder="Hành động" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả hành động</SelectItem>
                  {ACTIONS.map((act) => (
                    <SelectItem key={act} value={act}>
                      {act}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Entity Select */}
            <Select
              value={filters.entity}
              onValueChange={(val) => handleFilterChange('entity', val)}
            >
              <SelectTrigger className="h-8 w-[150px] lg:w-[200px]">
                <SelectValue placeholder="Đối tượng..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Tất cả đối tượng</SelectItem>
                  <SelectItem value="User">Người dùng</SelectItem>
                  <SelectItem value="Customer">Khách hàng</SelectItem>
                  <SelectItem value="Supplier">Nhà cung cấp</SelectItem>
                  <SelectItem value="Product">Sản phẩm</SelectItem>
                  <SelectItem value="SalesContract">Hợp đồng bán hàng</SelectItem>
                  <SelectItem value="PurchaseContract">Hợp đồng mua hàng</SelectItem>
                  <SelectItem value="PurchaseOrder">Đơn đặt mua hàng</SelectItem>
                  <SelectItem value="Invoice">Hóa đơn</SelectItem>
                  <SelectItem value="PaymentVoucher">Phiếu thu/chi</SelectItem>
                  <SelectItem value="WarehouseReceipt">Phiếu nhập/xuất kho</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* IP Input */}
            <Input
              placeholder="IP Address..."
              value={filters.ipAddress}
              onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
              className="h-8 w-[150px]"
            />

            {/* Date Range */}
            <div className="w-[250px]">
              <DateRange
                className="h-8"
                defaultValue={{ from: filters.fromDate, to: filters.toDate }}
                onChange={(range) => {
                  setFilters((prev) => ({
                    ...prev,
                    fromDate: range?.from,
                    toDate: range?.to,
                    page: 1,
                  }))
                }}
                align="start"
              />
            </div>

            {/* Reset Button */}
            {(filters.userId !== 'all' ||
              filters.action !== 'all' ||
              filters.entity !== 'all' ||
              filters.ipAddress ||
              filters.fromDate ||
              filters.toDate) && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-8 px-2 lg:px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  Đặt lại
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
          </div>

          <div className="flex items-center space-x-2">
            {/* View Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden h-8 lg:flex">
                  <MixerHorizontalIcon className="mr-2 h-4 w-4" />
                  Xem
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Chuyển đổi cột</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={visibleColumns.user} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, user: val }))}>Người dùng</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.action} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, action: val }))}>Hành động</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.entity} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, entity: val }))}>Đối tượng</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.ip} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, ip: val }))}>IP Address</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.userAgent} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, userAgent: val }))}>User Agent</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.time} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, time: val }))}>Thời gian</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={visibleColumns.detail} onCheckedChange={(val) => setVisibleColumns(prev => ({ ...prev, detail: val }))}>Chi tiết</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
              <TableRow>
                <TableHead className="w-[50px] text-center">STT</TableHead>
                {visibleColumns.user && <TableHead>Người dùng</TableHead>}
                {visibleColumns.action && <TableHead>Hành động</TableHead>}
                {visibleColumns.entity && <TableHead>Đối tượng</TableHead>}
                {visibleColumns.ip && <TableHead>IP Address</TableHead>}
                {visibleColumns.userAgent && <TableHead>User Agent</TableHead>}
                {visibleColumns.time && <TableHead>Thời gian</TableHead>}
                {visibleColumns.detail && <TableHead className="text-right">Chi tiết</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    {visibleColumns.user && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                    {visibleColumns.action && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                    {visibleColumns.entity && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                    {visibleColumns.ip && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                    {visibleColumns.userAgent && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                    {visibleColumns.time && <TableCell><Skeleton className="h-4 w-32" /></TableCell>}
                    {visibleColumns.detail && <TableCell><Skeleton className="h-4 w-8 float-right" /></TableCell>}
                  </TableRow>
                ))
              ) : logs && logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-center">
                      {(filters.page - 1) * (meta.per_page || filters.limit) + index + 1}
                    </TableCell>
                    {visibleColumns.user && (
                      <TableCell className="font-medium">
                        {log.user?.fullName || log.username || 'System'}
                      </TableCell>
                    )}
                    {visibleColumns.action && (
                      <TableCell>
                        {(() => {
                          const actionConfig = ACTIONS_CONFIG[log.action]
                          const IconComponent = actionConfig?.icon
                          return (
                            <Badge
                              variant="outline"
                              className={`${actionConfig?.color || 'border-gray-300 bg-gray-50 text-gray-700'}`}
                            >
                              {IconComponent && <IconComponent className="mr-2 h-4 w-4 inline" />}
                              {log.action}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                    )}
                    {visibleColumns.entity && (
                      <TableCell>
                        {(() => {
                          const entityConfig = ENTITIES_CONFIG[log.entity]
                          if (entityConfig) {
                            return (
                              <Badge variant="outline" className={`font-normal ${entityConfig.color}`}>
                                {entityConfig.label}
                                {log.entityId && <span className='opacity-70 ml-1'>#{log.entityId}</span>}
                              </Badge>
                            )
                          }
                          return (
                            <span>
                              <span className='font-medium'>{log.entityNameVi || log.entity}</span>
                              {log.entityId && <span className='text-muted-foreground text-xs ml-1'>#{log.entityId}</span>}
                            </span>
                          )
                        })()}
                      </TableCell>
                    )}
                    {visibleColumns.ip && <TableCell>{log.ipAddress}</TableCell>}
                    {visibleColumns.userAgent && (
                      <TableCell className="max-w-[200px]" title={log.userAgent}>
                        {log.userAgent}
                      </TableCell>
                    )}
                    {visibleColumns.time && <TableCell>{dateFormat(log.createdAt, true)}</TableCell>}
                    {visibleColumns.detail && (
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => openDetail(log)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xem chi tiết thay đổi</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Chưa có nhật ký nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex justify-end pt-4">
            <SystemLogPagination
              currentPage={filters.page}
              totalPages={meta.last_page || 1}
              pageSize={filters.limit}
              totalItems={meta.total || 0}
              onPageChange={handlePageChange}
              onPageSizeChange={(val) => handleFilterChange('limit', val)}
            />
          </div>
        )}

        {/* Detail Dialog */}
        <LogDetailDialog
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          log={selectedLog}
        />
      </LayoutBody>
    </Layout>
  )
}

export default SystemLogPage
