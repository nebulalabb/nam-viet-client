import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import InventoryPrintTemplate from './components/InventoryPrintTemplate'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { Button } from '@/components/custom/Button'
import { cn } from '@/lib/utils'
import { CalendarIcon, FileSpreadsheet, Printer } from 'lucide-react'
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
  const { setting } = useSelector((state) => state.setting)
  const current = new Date()

  const [filters, setFilters] = useState({
    warehouseId: '',
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
  })
  const [showExportPreview, setShowExportPreview] = useState(false)

  const { warehouses } = useSelector((state) => state.warehouse)

  const printRef = useRef(null)
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Bao_Cao_Ton_Kho',
  })

  const aggregatedData = useMemo(() => {
    if (filters.warehouseId && filters.warehouseId !== 'all') return inventorySummary;

    const map = {};
    inventorySummary.forEach(item => {
      const pid = item.productId;
      if (!map[pid]) {
        map[pid] = { ...item, openingQuantity: 0, openingAmount: 0, quantityIn: 0, amountIn: 0, quantityOut: 0, amountOut: 0, closingQuantity: 0, closingAmount: 0 };
      }
      map[pid].openingQuantity += (item.openingQuantity || 0);
      map[pid].openingAmount += (item.openingAmount || 0);
      map[pid].quantityIn += (item.quantityIn || 0);
      map[pid].amountIn += (item.amountIn || 0);
      map[pid].quantityOut += (item.quantityOut || 0);
      map[pid].amountOut += (item.amountOut || 0);
      map[pid].closingQuantity += (item.closingQuantity || 0);
      map[pid].closingAmount += (item.closingAmount || 0);
    });
    return Object.values(map);
  }, [inventorySummary, filters.warehouseId])


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
      warehouseId: filters.warehouseId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    },
  })

  const onSubmit = (data) => {
    setFilters({
      warehouseId: data.warehouseId === 'all' ? '' : (data.warehouseId || filters.warehouseId),
      fromDate: data.fromDate || filters.fromDate,
      toDate: data.toDate || filters.toDate,
    })
  }

  useEffect(() => {
    dispatch(getWarehouses({ page: 1, pageSize: 100 }))
  }, [dispatch])

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

                <FormField
                  control={form.control}
                  name="warehouseId"
                  render={({ field }) => (
                    <FormItem className="space-y-0 w-[180px]">
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          onSubmit({ ...form.getValues(), warehouseId: value })
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Tất cả kho" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Tất cả kho</SelectItem>
                          {warehouses?.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id.toString()}>
                              {wh.warehouseName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </form>
            </Form>

            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" />
              In Báo Cáo
            </Button>

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
              ) : aggregatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">Không có dữ liệu</TableCell>
                </TableRow>
              ) : (
                aggregatedData.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell className="border-r text-center">{index + 1}</TableCell>
                    <TableCell className="border-r font-medium">{item.product?.name}</TableCell>
                    <TableCell className="border-r text-center">{item.product?.unit?.name}</TableCell>

                    {/* Opening */}
                    <TableCell className="text-right border-r">{item.openingQuantity || '-'}</TableCell>
                    <TableCell className="text-right border-r">{item.openingAmount ? moneyFormat(item.openingAmount) : '-'}</TableCell>

                    {/* In */}
                    <TableCell className="text-right border-r">{item.quantityIn || '-'}</TableCell>
                    <TableCell className="text-right border-r">{item.amountIn ? moneyFormat(item.amountIn) : '-'}</TableCell>

                    {/* Out */}
                    <TableCell className="text-right border-r">{item.quantityOut || '-'}</TableCell>
                    <TableCell className="text-right border-r">{item.amountOut ? moneyFormat(item.amountOut) : '-'}</TableCell>

                    {/* Closing */}
                    <TableCell className="text-right border-r font-medium">{item.closingQuantity || '-'}</TableCell>
                    <TableCell className="text-right border-r font-medium">{item.closingAmount ? moneyFormat(item.closingAmount) : '-'}</TableCell>

                    {/* Unit Price */}
                    <TableCell className="text-right">{item.averageUnitPrice ? moneyFormat(item.averageUnitPrice) : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </LayoutBody>

      <InventoryPrintTemplate
        ref={printRef}
        reportData={aggregatedData}
        filters={filters}
        setting={setting}
      />
    </Layout>
  )
}

export default InventorySummaryPage
