import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import InvoiceDialog from './InvoiceDialog'
import ImportInvoiceDialog from './ImportInvoiceDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import ReceiptDialog from '../../receipt/components/ReceiptDialog'
import PrintInvoiceView from './PrintInvoiceView'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getSetting } from '@/stores/SettingSlice'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { getUsers } from '@/stores/UserSlice'
import ExportInvoiceDialog from './ExportInvoiceDialog'
import { getCustomers } from '@/stores/CustomerSlice'
import { statuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical, TruckIcon } from 'lucide-react'
import DeliveryReminderDialog from './DeliveryReminderDialog'
import { DeleteMultipleInvoicesDialog } from './DeleteMultipleInvoicesDialog'
import { deleteMultipleInvoices } from '@/stores/InvoiceSlice'
import { TrashIcon } from '@radix-ui/react-icons'

const DataTableToolbar = ({ table, isMyInvoice, onCreated }) => {
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateInvoiceDialog, setShowCreateInvoiceDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const [showReceiptDialog, setShowReceiptDialog] = useState(false)
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState([])
  const [selectedInvoices, setSelectedInvoices] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows

  useEffect(() => {
    const invoices = selectedRows.map((row) => row.original)
    setSelectedInvoices(invoices)
    setSelectedInvoiceIds(invoices.map((inv) => inv.id))
  }, [selectedRows])

  const handleDelete = async () => {
    const selectedIds = selectedInvoices.map((inv) => inv.id)
    // Filter out invoices that are not draft, pending or rejected
    const invalidInvoices = selectedInvoices.filter(inv => !['draft', 'pending', 'rejected'].includes(inv.status))

    if (invalidInvoices.length > 0) {
      toast.error('Chỉ có thể xóa các hóa đơn ở trạng thái Nháp, Chờ xác nhận hoặc Từ chối')
      return
    }

    try {
      await dispatch(deleteMultipleInvoices(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  const [showDeliveryReminderDialog, setShowDeliveryReminderDialog] = useState(false)

  const navigate = useNavigate()

  // Auto-open invoice dialog when triggered from mobile cart button
  useEffect(() => {
    const shouldAutoOpen = localStorage.getItem('autoOpenInvoiceDialog')
    if (shouldAutoOpen === 'true') {
      setShowCreateInvoiceDialog(true)
      localStorage.removeItem('autoOpenInvoiceDialog')
    }
  }, [])

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSetting('general_information'))
  }, [dispatch])

  const setting = useSelector((state) => state.setting.setting)
  const loading = useSelector((state) => state.setting.loading)
  const [invoice, setInvoice] = useState(null)

  const [showExportDialog, setShowExportDialog] = useState(false)

  const users = useSelector((state) => state.user.users)
  useEffect(() => {
    dispatch(getUsers())
    dispatch(getCustomers())
  }, [dispatch])

  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile Toolbar - Simplified
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search section */}
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter || ''}
          onChange={(e) => {
            table.setGlobalFilter(e.target.value)
          }}
          className="h-8 w-full text-sm"
        />

        {/* Quick actions */}
        <div className="flex gap-2">
          <Can permission={['CREATE_INVOICE']}>
            <Button
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              onClick={() => setShowCreateInvoiceDialog(true)}
            >
              <PlusIcon className="mr-1 h-3 w-3" />
              Thêm
            </Button>
          </Can>

          {/* Menu button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {selectedInvoices.length > 0 && (
                <Can permission="DELETE_INVOICE">
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-xs text-red-600 focus:text-red-700 focus:bg-red-50"
                  >
                    <TrashIcon className="mr-2 h-3 w-3" />
                    Xóa ({selectedInvoices.length})
                  </DropdownMenuItem>
                </Can>
              )}

              <DropdownMenuItem
                onClick={() => setShowExportDialog(true)}
                className="text-xs text-green-600 focus:text-green-700 focus:bg-green-50"
              >
                <IconFileTypeXls className="mr-2 h-3 w-3" />
                Xuất file
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowImportDialog(true)}
                className="text-xs text-blue-600 focus:text-blue-700 focus:bg-blue-50"
              >
                <FileSpreadsheet className="mr-2 h-3 w-3" />
                Import Excel
              </DropdownMenuItem>

              {/* Gửi nhắc giao hàng */}
              <DropdownMenuItem
                onClick={() => {
                  const selectedRows = table.getSelectedRowModel().rows
                  if (selectedRows.length === 0) {
                    toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                    return
                  }
                  setShowDeliveryReminderDialog(true)
                }}
                className="text-xs text-orange-600 focus:text-orange-700 focus:bg-orange-50"
              >
                <TruckIcon className="mr-2 h-3 w-3" />
                Nhắc giao hàng
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Dialog Import */}
          {showImportDialog && (
            <ImportInvoiceDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
            />
          )}
        </div>

        {/* Dialogs */}
        {showCreateInvoiceDialog && (
          <InvoiceDialog
            type="common_invoice"
            open={showCreateInvoiceDialog}
            onOpenChange={setShowCreateInvoiceDialog}
            showTrigger={false}
            onSuccess={onCreated}
          />
        )}
        {showExportDialog && (
          <ExportInvoiceDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            isMyInvoice={isMyInvoice}
          />
        )}
        {invoice && setting && (
          <PrintInvoiceView invoice={invoice} setting={setting} />
        )}
        {showReceiptDialog && (
          <ReceiptDialog
            invoices={selectedInvoices}
            open={showReceiptDialog}
            onOpenChange={setShowReceiptDialog}
            showTrigger={false}
            table={table}
          />
        )}

        {showDeliveryReminderDialog && (
          <DeliveryReminderDialog
            open={showDeliveryReminderDialog}
            onOpenChange={setShowDeliveryReminderDialog}
            selectedInvoices={table.getSelectedRowModel().rows.map((r) => r.original)}
          />
        )}
        {showDeleteDialog && (
          <DeleteMultipleInvoicesDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            count={selectedInvoices.length}
          />
        )}
      </div>
    )
  }

  // Desktop Toolbar - Original
  return (
    <div className="space-y-3 w-full">
      {/* First row: Search inputs */}
      <div className="flex w-full flex-wrap items-center gap-2">
        <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
          <Input
            placeholder="Tìm kiếm..."
            value={table.getState().globalFilter || ''}
            onChange={(e) => table.setGlobalFilter(e.target.value)}
            className="h-8 w-full sm:w-[400px]"
          />
        </div>
      </div>

      {/* Second row: Filters and actions */}
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {users && !isMyInvoice && (
            <div className="flex gap-x-2">
              {table.getColumn('user') && (
                <DataTableFacetedFilter
                  column={table.getColumn('user')}
                  title="Người tạo"
                  options={users?.map((user) => ({
                    value: user?.id,
                    label: user?.fullName,
                  }))}
                />
              )}
            </div>
          )}

          {statuses && table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={statuses.map((s) => ({
                value: s.value,
                label: s.label,
              }))}
            />
          )}

          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Đặt lại
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Right side: Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 whitespace-nowrap">
          {selectedInvoices.length > 0 && (
            <Can permission="DELETE_INVOICE">
              <Button
                variant="destructive"
                size="sm"
                className="h-8"
                onClick={() => setShowDeleteDialog(true)}
              >
                <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                Xóa ({selectedInvoices.length})
              </Button>
            </Can>
          )}

          {/* Xuất Excel */}
          <Button
            className="text-green-600 border-green-200 hover:bg-green-50"
            variant="outline"
            size="sm"
            loading={loading}
            onClick={() => setShowExportDialog(true)}
          >
            <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
            Xuất file Đơn Bán
          </Button>
          {showExportDialog && (
            <ExportInvoiceDialog
              open={showExportDialog}
              onOpenChange={setShowExportDialog}
              showTrigger={false}
            />
          )}

          {/* Import Excel */}
          <Button
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
          >
            <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
            Import Excel
          </Button>

          {showImportDialog && (
            <ImportInvoiceDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
            />
          )}

          {/* Gửi nhắc giao hàng */}
          <Button
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
            variant="outline"
            size="sm"
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows
              if (selectedRows.length === 0) {
                toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                return
              }

              // Check if all selected invoices have salesContract
              const invoicesWithoutContract = selectedRows.filter(row => !row.original.salesContract)
              if (invoicesWithoutContract.length > 0) {
                toast.warning('Đơn hàng này không có sản phẩm cần giao')
                return
              }

              setShowDeliveryReminderDialog(true)
            }}
          >
            <TruckIcon className="mr-2 size-4" aria-hidden="true" />
            Gửi nhắc giao hàng
          </Button>

          {/* Tạo hóa đơn chung */}
          <Can permission={['CREATE_INVOICE']}>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
              onClick={() => setShowCreateInvoiceDialog(true)}
            >
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Thêm mới
            </Button>
          </Can>

          {/* Dialog tạo hóa đơn chung */}
          {showCreateInvoiceDialog && (
            <InvoiceDialog
              type="common_invoice"
              open={showCreateInvoiceDialog}
              onOpenChange={setShowCreateInvoiceDialog}
              showTrigger={false}
              onSuccess={onCreated}
            />
          )}

          {/* Dialog tạo phiếu thu */}
          {showReceiptDialog && (
            <ReceiptDialog
              invoices={selectedInvoices}
              open={showReceiptDialog}
              onOpenChange={setShowReceiptDialog}
              showTrigger={false}
              table={table}
            />
          )}


          {/* Dialog gửi nhắc giao hàng */}
          {showDeliveryReminderDialog && (
            <DeliveryReminderDialog
              open={showDeliveryReminderDialog}
              onOpenChange={setShowDeliveryReminderDialog}
              selectedInvoices={table.getSelectedRowModel().rows.map((r) => r.original)}
            />
          )}

          <DeleteMultipleInvoicesDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            onConfirm={handleDelete}
            count={selectedInvoices.length}
          />

          <DataTableViewOptions table={table} />
        </div>
      </div>
    </div>
  )
}

export { DataTableToolbar }
