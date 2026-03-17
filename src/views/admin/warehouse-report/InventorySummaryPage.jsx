import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getInventorySummary } from '@/stores/WarehouseReportSlice'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/custom/Button'
import { cn } from '@/lib/utils'
import { CalendarIcon, FileSpreadsheet } from 'lucide-react'
import { DatePicker } from '@/components/custom/DatePicker'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { moneyFormat } from '@/utils/money-format'
import ExportInventorySummaryPreviewDialog from './components/ExportInventorySummaryPreviewDialog'

const InventorySummaryPage = () => {
  const dispatch = useDispatch()
  const { inventorySummary, loading } = useSelector((state) => state.warehouseReport)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })
  const [showExportPreview, setShowExportPreview] = useState(false)

  // Calculate totals
  const totals = inventorySummary.reduce((acc, item) => {
    return {
      openingQty: acc.openingQty + (item.openingQuantity || 0),
      openingAmount: acc.openingAmount + (item.openingAmount || 0),
      inQty: acc.inQty + (item.quantityIn || 0),
      inAmount: acc.inAmount + (item.amountIn || 0),
      outQty: acc.outQty + (item.quantityOut || 0),
      outAmount: acc.outAmount + (item.amountOut || 0),
      closingQty: acc.closingQty + (item.closingQuantity || 0),
      closingAmount: acc.closingAmount + (item.closingAmount || 0),
    }
  }, {
    openingQty: 0, openingAmount: 0,
    inQty: 0, inAmount: 0,
    outQty: 0, outAmount: 0,
    closingQty: 0, closingAmount: 0
  })

  const form = useForm({
    defaultValues: {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    },
  })

  const onSubmit = (data) => {
    setFilters({
      fromDate: data.fromDate || filters.fromDate,
      toDate: data.toDate || filters.toDate,
    })
  }

  useEffect(() => {
    document.title = 'Báo cáo tổng hợp nhập xuất tồn'
    dispatch(getInventorySummary(filters))
  }, [dispatch, filters])

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Báo Cáo Tổng Hợp Xuất Nhập Tồn
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Form {...form}>
              <form
                id="inventory-summary-form"
                className="flex items-center gap-2"
              >
                <FormField
                  control={form.control}
                  name="fromDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Từ ngày</span>
                              )}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date)
                                onSubmit({ ...form.getValues(), fromDate: date })
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <span className="text-muted-foreground">-</span>

                <FormField
                  control={form.control}
                  name="toDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy')
                              ) : (
                                <span>Đến ngày</span>
                              )}
                              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <DatePicker
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date)
                                onSubmit({ ...form.getValues(), toDate: date })
                              }
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <Button
              variant="outline"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => setShowExportPreview(true)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Báo Cáo Tổng Hợp
            </Button>
            {showExportPreview && (
              <ExportInventorySummaryPreviewDialog
                open={showExportPreview}
                onOpenChange={setShowExportPreview}
                data={inventorySummary}
                filters={filters}
              />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <Table className="relative w-full overflow-auto">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead rowSpan={2} className="w-[50px] border-r">STT</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">Tên hàng hóa</TableHead>
                <TableHead rowSpan={2} className="w-[80px] border-r">ĐVT</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Tồn đầu</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Nhập</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Xuất</TableHead>
                <TableHead colSpan={2} className="text-center border-r border-b">Tồn</TableHead>
                <TableHead rowSpan={2} className="text-right min-w-[100px]">Đơn giá</TableHead>
              </TableRow>
              <TableRow>
                {/* Tồn đầu */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
                {/* Nhập */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
                {/* Xuất */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
                {/* Tồn */}
                <TableHead className="text-right border-r min-w-[80px]">Số lượng</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Total Row */}
              <TableRow className="font-bold bg-white hover:bg-white text-red-600 sticky top-[calc(theme(spacing.10)*2-2px)] z-10 shadow-sm">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center">Cộng</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r">{totals.openingQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.openingAmount ? moneyFormat(totals.openingAmount) : '-'}</TableCell>

                <TableCell className="text-right border-r">{totals.inQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.inAmount ? moneyFormat(totals.inAmount) : '-'}</TableCell>

                <TableCell className="text-right border-r">{totals.outQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.outAmount ? moneyFormat(totals.outAmount) : '-'}</TableCell>

                <TableCell className="text-right border-r">{totals.closingQty || '-'}</TableCell>
                <TableCell className="text-right border-r">{totals.closingAmount ? moneyFormat(totals.closingAmount) : '-'}</TableCell>

                <TableCell className="text-right"></TableCell>
              </TableRow>

              {loading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">Đang tải...</TableCell>
                </TableRow>
              ) : inventorySummary.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                inventorySummary.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="border-r text-center">{index + 1}</TableCell>
                    <TableCell className="border-r font-medium">{item.product?.name}</TableCell>
                    <TableCell className="border-r text-center">{item.product?.unit?.name}</TableCell>

                    {/* Opening */}
                    <TableCell className="text-right border-r">{item.openingQuantity || 0}</TableCell>
                    <TableCell className="text-right border-r">{moneyFormat(item.openingAmount || 0)}</TableCell>

                    {/* In */}
                    <TableCell className="text-right border-r">{item.quantityIn || 0}</TableCell>
                    <TableCell className="text-right border-r">{moneyFormat(item.amountIn || 0)}</TableCell>

                    {/* Out */}
                    <TableCell className="text-right border-r">{item.quantityOut || 0}</TableCell>
                    <TableCell className="text-right border-r">{moneyFormat(item.amountOut || 0)}</TableCell>

                    {/* Closing */}
                    <TableCell className="text-right border-r font-medium">{item.closingQuantity || 0}</TableCell>
                    <TableCell className="text-right border-r font-medium">{moneyFormat(item.closingAmount || 0)}</TableCell>

                    {/* Unit Price */}
                    <TableCell className="text-right">{moneyFormat(item.averageUnitPrice || 0)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default InventorySummaryPage
