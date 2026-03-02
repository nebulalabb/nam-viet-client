import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MobileIcon } from '@radix-ui/react-icons'
import {
  Building2,
  CircleDollarSign,
  InfoIcon,
  Mail,
  MapPin,
  UserIcon,
  CreditCard,
  CalendarDays,
  MapPinned,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import Can from '@/utils/can'
import { DeleteCustomerDialog } from './DeleteCustomerDialog'
import UpdateCustomerDialog from './UpdateCustomerDialog'
import { getCustomerById } from '@/stores/CustomerSlice'
import { getExpiriesByCustomerId } from '@/stores/ExpirySlice'
import { useEffect, useState } from 'react'
import { CustomerDetailPagination } from './CustomerDetailPagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InvoiceHistoryTab from './CustomerInvoiceTab'
import { cn } from '@/lib/utils'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dateFormat } from '@/utils/date-format'
import { types } from '../data'
import { DateRange } from '@/components/custom/DateRange'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  addHours,
  endOfDay,
  endOfMonth,
  startOfDay,
  startOfMonth,
} from 'date-fns'
import CustomerRevenueChartTab from './CustomerRevenueChart'
import CustomerProductChartTab from './CustomerProductChartTab'
import CustomerCarePanel from './CustomerCarePanel'

const CustomerDetailDialog = ({ customer, showTrigger = true, ...props }) => {
  const dispatch = useDispatch()
  const [accounts, setAccounts] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(30)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [status, setStatus] = useState('all')
  const current = new Date()
  const [dateRange, setDateRange] = useState({
    from: addHours(startOfDay(startOfMonth(current)), 12),
    to: addHours(endOfDay(endOfMonth(current)), 0),
  })

  const [customerDetail, setCustomerDetail] = useState(customer)
  const [showDeleteCustomerDialog, setShowDeleteCustomerDialog] = useState(false)
  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] = useState(false)

  useEffect(() => {
    if (!customer?.id) return

    dispatch(getCustomerById(customer.id))
      .unwrap()
      .then((res) => {
        if (res) setCustomerDetail(res)
      })
      .catch(() => { })

    dispatch(getExpiriesByCustomerId({ customerId: customer.id, page, limit }))
      .unwrap()
      .then((res) => {
        setAccounts(res.data.accounts)
        setTotalItems(res.data.totalItems)
        setTotalPages(res.data.totalPages)
      })
      .catch(() => { })
  }, [customer?.id, dispatch, page, limit])

  useEffect(() => {
    setPage(1)
  }, [status, dateRange])

  const filterKey = `${customer?.id}-${dateRange.from?.getTime()}-${dateRange.to?.getTime()}-${status}`

  return (
    <Dialog {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Mở chi tiết
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        className={cn("md:h-auto md:max-w-7xl", props.contentClassName)}
        overlayClassName={props.overlayClassName}
      >
        <DialogHeader>
          <DialogTitle>{customerDetail?.customerName || customer?.name}</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết khách hàng: <strong>{customerDetail?.customerName || customer?.name}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-auto">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 space-y-6 rounded-lg border p-4">
              <Tabs defaultValue="accounts" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="accounts">Tài khoản/Hạn dùng</TabsTrigger>
                  <TabsTrigger value="invoices">Lịch sử đơn bán</TabsTrigger>
                  <TabsTrigger value="chart">Biểu đồ mua hàng</TabsTrigger>
                  <TabsTrigger value="productChart">
                    Biểu đồ sản phẩm
                  </TabsTrigger>
                  <TabsTrigger value="customerCare">
                    Chăm sóc khách hàng
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="accounts">
                  <h2 className="text-lg font-semibold">
                    Thông tin tài khoản/Hạn dùng
                  </h2>
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-secondary text-xs">
                        <TableHead className="w-8">TT</TableHead>
                        <TableHead className="min-w-40">
                          Tên tài khoản
                        </TableHead>
                        <TableHead className="min-w-40">Sản phẩm</TableHead>
                        <TableHead className="min-w-20">Ngày gia hạn</TableHead>
                        <TableHead className="min-w-16">Ngày hết hạn</TableHead>
                        <TableHead className="min-w-16">Ngày tạo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts?.length > 0 ? (
                        accounts.map((account, index) => (
                          <TableRow key={account.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {account?.name ||
                                  account?.accountName ||
                                  'Chưa có'}
                              </div>
                            </TableCell>
                            <TableCell>
                              {account?.expiries[0]?.product?.name ||
                                'Không có'}
                            </TableCell>
                            <TableCell>
                              {dateFormat(account?.expiries[0]?.startDate)}
                            </TableCell>
                            <TableCell>
                              {dateFormat(account?.expiries[0]?.endDate)}
                            </TableCell>
                            <TableCell>
                              {dateFormat(account?.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center text-muted-foreground"
                          >
                            Không có hạn dùng
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <div className="flex items-center justify-end">
                    <CustomerDetailPagination
                      page={page}
                      limit={limit}
                      totalItems={totalItems}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      onLimitChange={setLimit}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="invoices">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                    <DateRange
                      defaultValue={dateRange}
                      onChange={(range) => {
                        setDateRange({
                          from: range?.from
                            ? addHours(startOfDay(range.from), 12)
                            : addHours(startOfDay(startOfMonth(current)), 12),
                          to: range?.to
                            ? addHours(endOfDay(range.to), 0)
                            : addHours(endOfDay(endOfMonth(current)), 0),
                        })
                      }}
                    />
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
                        <SelectItem value="accepted">Đã duyệt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InvoiceHistoryTab
                    key={filterKey}
                    customerId={customer?.id}
                    dateFrom={dateRange.from}
                    dateTo={dateRange.to}
                    status={status === 'all' ? undefined : status}
                  />
                </TabsContent>

                <TabsContent value="chart">
                  <CustomerRevenueChartTab customerId={customer?.id} />
                </TabsContent>

                <TabsContent value="productChart">
                  <CustomerProductChartTab customerId={customer?.id} />
                </TabsContent>

                <TabsContent value="customerCare">
                  <CustomerCarePanel customerId={customer?.id} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="w-full rounded-lg border p-4 lg:w-72">
              <div className="flex items-center justify-between">
                <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`https://ui-avatars.com/api/?bold=true&background=random&name=${customerDetail?.customerName || customer?.name}`}
                      alt={customerDetail?.customerName || customer?.name}
                    />
                    <AvatarFallback>AD</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{customerDetail?.customerName || customer?.name}</div>
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">Thông tin khách hàng</div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <span>
                        {types.find((type) => type.value === customerDetail?.customerType)
                          ?.label || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <MobileIcon className="h-4 w-4" />
                      </div>
                      <a href={`tel:${customerDetail?.phone}`}>
                        {customerDetail?.phone || 'Chưa cập nhật'}
                      </a>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <div className="mr-2 h-4 w-4">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${customerDetail?.email}`}>
                        {customerDetail?.email || 'Chưa cập nhật'}
                      </a>
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <CircleDollarSign className="h-4 w-4" />
                      </div>
                      {customerDetail?.taxCode || 'Chưa cập nhật'}
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <Building2 className="h-4 w-4" />
                      </div>
                      {customerDetail?.contactPerson || 'Chưa cập nhật'}
                    </div>
                    <div className="flex items-center text-primary hover:text-secondary-foreground">
                      <div className="mr-2 h-4 w-4">
                        <InfoIcon className="h-4 w-4" />
                      </div>
                      {customerDetail?.notes || 'Không có ghi chú'}
                    </div>

                    {/* Identity Information */}
                    {(customerDetail?.cccd || customerDetail?.issuedAt || customerDetail?.issuedBy) && (
                      <>
                        <div className="my-2 border-t" />
                        <div className="font-medium text-sm mb-2">Thông tin CMND/CCCD</div>

                        {customerDetail?.cccd && (
                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4">
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <span>{customerDetail.cccd}</span>
                          </div>
                        )}

                        {customerDetail?.issuedAt && (
                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4">
                              <CalendarDays className="h-4 w-4" />
                            </div>
                            <span>Ngày cấp: {dateFormat(customerDetail.issuedAt)}</span>
                          </div>
                        )}

                        {customerDetail?.issuedBy && (
                          <div className="flex items-center text-primary hover:text-secondary-foreground">
                            <div className="mr-2 h-4 w-4">
                              <MapPinned className="h-4 w-4" />
                            </div>
                            <span>{customerDetail.issuedBy}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="hidden md:flex sm:space-x-0">
          <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
            <Can permission="UPDATE_CUSTOMER">
              <Button
                size="sm"
                onClick={() => setShowUpdateCustomerDialog(true)}
                className="gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Pencil className="h-4 w-4" />
                Sửa
              </Button>
            </Can>

            <Can permission="DELETE_CUSTOMER">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteCustomerDialog(true)}
                className="gap-2 w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            </Can>

            <DialogClose asChild>
              <Button size="sm" type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                <X className="h-4 w-4" />
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>

      {showDeleteCustomerDialog && (
        <DeleteCustomerDialog
          open={showDeleteCustomerDialog}
          onOpenChange={setShowDeleteCustomerDialog}
          customer={customerDetail}
          showTrigger={false}
          onSuccess={() => props?.onOpenChange?.(false)}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}

      {showUpdateCustomerDialog && (
        <UpdateCustomerDialog
          open={showUpdateCustomerDialog}
          onOpenChange={(open) => {
            setShowUpdateCustomerDialog(open)
            if (!open) {
              // Refresh customer data when dialog closes
              dispatch(getCustomerById(customer.id))
                .unwrap()
                .then((res) => {
                  if (res) setCustomerDetail(res)
                })
                .catch(() => { })
            }
          }}
          customer={customerDetail}
          showTrigger={false}
          contentClassName="z-[100070]"
          overlayClassName="z-[100069]"
        />
      )}
    </Dialog>
  )
}

export default CustomerDetailDialog
