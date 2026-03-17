import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { getInventoryDetail } from '@/stores/WarehouseReportSlice'
import { getProducts } from '@/stores/ProductSlice'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/custom/Button'
import { cn } from '@/lib/utils'
import { CalendarIcon, FileSpreadsheet, Check, ChevronsUpDown } from 'lucide-react'
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
import { dateFormat } from '@/utils/date-format'
import ExportInventoryDetailPreviewDialog from './components/ExportInventoryDetailPreviewDialog'

const InventoryDetailPage = () => {
  const dispatch = useDispatch()
  const { inventoryDetail, loading } = useSelector((state) => state.warehouseReport)
  const { products } = useSelector((state) => state.product)
  const current = new Date()

  const [filters, setFilters] = useState({
    fromDate: startOfMonth(current),
    toDate: endOfMonth(current),
    productId: '',
  })

  const [openCombobox, setOpenCombobox] = useState(false)
  const [showExportPreview, setShowExportPreview] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    dispatch(getProducts({ limit: 1000 }))
  }, [dispatch])

  // Fetch detail when filter changes (and productId is set)
  useEffect(() => {
    document.title = 'Sổ chi tiết vật tư'
    if (filters.productId) {
      dispatch(getInventoryDetail(filters))
    }
  }, [dispatch, filters])

  const form = useForm({
    defaultValues: {
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    },
  })

  const onSubmit = (data) => {
    setFilters(prev => ({
      ...prev,
      fromDate: data.fromDate || prev.fromDate,
      toDate: data.toDate || prev.toDate,
    }))
  }

  const selectedProduct = products?.find(p => p.id === filters.productId)
  const productName = selectedProduct ? selectedProduct.productName : 'Chưa chọn sản phẩm'

  // Calculate totals
  const totalInQty = inventoryDetail?.data?.reduce((sum, item) => sum + (parseFloat(item.qtyIn) || 0), 0) || 0
  const totalInAmount = inventoryDetail?.data?.reduce((sum, item) => sum + (parseFloat(item.amountIn) || 0), 0) || 0
  const totalOutQty = inventoryDetail?.data?.reduce((sum, item) => sum + (parseFloat(item.qtyOut) || 0), 0) || 0
  const totalOutAmount = inventoryDetail?.data?.reduce((sum, item) => sum + (parseFloat(item.amountOut) || 0), 0) || 0
  const lastBalanceQty = inventoryDetail?.data?.length > 0 ? inventoryDetail.data[inventoryDetail.data.length - 1].balanceQty : (inventoryDetail?.openingBalance?.quantity || 0)
  const lastBalanceAmount = inventoryDetail?.data?.length > 0 ? inventoryDetail.data[inventoryDetail.data.length - 1].balanceAmount : (inventoryDetail?.openingBalance?.amount || 0)

  return (
    <Layout>
      <LayoutBody className="flex flex-col" fixedHeight>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Sổ Chi Tiết Vật Tư
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sản phẩm: <span className="font-semibold text-primary">{productName}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Product Select Combobox */}
            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-[300px] justify-between"
                >
                  <span className="truncate flex-1 text-left">
                    {filters.productId
                      ? products.find((product) => product.id === filters.productId)?.productName
                      : "Chọn sản phẩm..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Tìm sản phẩm..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                    <CommandGroup>
                      {products?.map((product) => (
                        <CommandItem
                          key={product.id}
                          value={product.productName}
                          onSelect={() => {
                            setFilters(prev => ({ ...prev, productId: product.id }))
                            setOpenCombobox(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              filters.productId === product.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {product.productName} ({product.code})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            <Form {...form}>
              <form id="inventory-detail-form" className="flex items-center gap-2">
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
              disabled={!filters.productId}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Xuất Excel
            </Button>
            {showExportPreview && (
              <ExportInventoryDetailPreviewDialog
                open={showExportPreview}
                onOpenChange={setShowExportPreview}
                data={inventoryDetail?.data}
                openingBalance={inventoryDetail?.openingBalance}
                filters={filters}
                productName={productName}
              />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-md border">
          <Table className="relative w-full min-w-[1000px]">
            <TableHeader className="sticky top-0 bg-secondary z-10">
              <TableRow>
                <TableHead colSpan={2} className="text-center border-r border-b">Chứng từ</TableHead>
                <TableHead rowSpan={2} className="min-w-[200px] border-r">Đối tượng (Diễn giải)</TableHead>
                <TableHead rowSpan={2} className="w-[60px] border-r">ĐVT</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-b">Nhập trong kỳ</TableHead>
                <TableHead colSpan={3} className="text-center border-r border-b">Xuất trong kỳ</TableHead>
                <TableHead colSpan={3} className="text-center border-b">Tồn cuối kỳ</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="w-[100px] border-r">Số</TableHead>
                <TableHead className="w-[100px] border-r">Ngày</TableHead>

                {/* Nhập */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Thành tiền</TableHead>

                {/* Xuất */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Thành tiền</TableHead>

                {/* Tồn */}
                <TableHead className="text-right border-r min-w-[80px]">SL</TableHead>
                <TableHead className="text-right border-r min-w-[100px]">Đơn giá</TableHead>
                <TableHead className="text-right min-w-[100px]">Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Dư đầu */}
              <TableRow className="bg-muted/30">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r font-bold">Dư đầu kỳ</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r font-bold">
                  {inventoryDetail?.openingBalance?.quantity ? parseFloat(inventoryDetail.openingBalance.quantity) : 0}
                </TableCell>
                <TableCell className="text-right border-r">
                   {inventoryDetail?.openingBalance?.quantity && parseFloat(inventoryDetail.openingBalance.quantity) !== 0 
                     ? moneyFormat(parseFloat(inventoryDetail.openingBalance.amount) / parseFloat(inventoryDetail.openingBalance.quantity)) 
                     : moneyFormat(0)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {inventoryDetail?.openingBalance?.amount ? moneyFormat(inventoryDetail.openingBalance.amount) : moneyFormat(0)}
                </TableCell>
              </TableRow>

              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center">Đang tải...</TableCell>
                </TableRow>
              ) : !inventoryDetail?.data || inventoryDetail.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-24 text-center text-muted-foreground italic">
                    {filters.productId ? "Không có giao dịch phát sinh trong kỳ" : "Vui lòng chọn sản phẩm để xem chi tiết"}
                  </TableCell>
                </TableRow>
              ) : (
                inventoryDetail.data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="border-r font-medium text-blue-600 font-mono text-xs">{item.documentCode}</TableCell>
                    <TableCell className="border-r whitespace-nowrap">{dateFormat(item.postingDate)}</TableCell>
                    <TableCell className="border-r text-sm">{item.objectName || item.description}</TableCell>
                    <TableCell className="border-r text-center">{item.unit?.name}</TableCell>

                    {/* Nhập */}
                    <TableCell className="text-right border-r font-medium text-green-600">
                      {parseFloat(item.qtyIn) > 0 ? parseFloat(item.qtyIn) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r text-xs">
                      {parseFloat(item.qtyIn) > 0 ? moneyFormat(item.unitCost) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r text-sm">
                      {parseFloat(item.amountIn) > 0 ? moneyFormat(item.amountIn) : ''}
                    </TableCell>

                    {/* Xuất */}
                    <TableCell className="text-right border-r font-medium text-orange-600">
                      {parseFloat(item.qtyOut) > 0 ? parseFloat(item.qtyOut) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r text-xs">
                      {parseFloat(item.qtyOut) > 0 ? moneyFormat(item.unitCost) : ''}
                    </TableCell>
                    <TableCell className="text-right border-r text-sm">
                      {parseFloat(item.amountOut) > 0 ? moneyFormat(item.amountOut) : ''}
                    </TableCell>

                    {/* Tồn */}
                    <TableCell className="text-right border-r font-bold">{parseFloat(item.balanceQty)}</TableCell>
                    <TableCell className="text-right border-r text-xs">{moneyFormat(item.unitCost)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{moneyFormat(item.balanceAmount)}</TableCell>
                  </TableRow>
                ))
              )}

              {/* Cộng */}
              <TableRow className="font-bold bg-muted/50 border-t-2">
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="border-r text-center uppercase">Cộng phát sinh</TableCell>
                <TableCell className="border-r"></TableCell>

                <TableCell className="text-right border-r text-green-600">{totalInQty}</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right border-r text-green-700">{moneyFormat(totalInAmount)}</TableCell>

                <TableCell className="text-right border-r text-orange-600">{totalOutQty}</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right border-r text-orange-700">{moneyFormat(totalOutAmount)}</TableCell>

                <TableCell className="text-right border-r">{lastBalanceQty}</TableCell>
                <TableCell className="border-r"></TableCell>
                <TableCell className="text-right text-primary">{moneyFormat(lastBalanceAmount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </LayoutBody>
    </Layout>
  )
}

export default InventoryDetailPage
