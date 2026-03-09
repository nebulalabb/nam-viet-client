
import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon, TruckIcon, EllipsisVertical } from 'lucide-react'
import ReceiptReminderDialog from './ReceiptReminderDialog'
import ExportPurchaseOrderDialog from './ExportPurchaseOrderDialog'
import { useEffect, useState } from 'react'
import PurchaseOrderDialog from './PurchaseOrderDialog'
import ImportPurchaseOrderDialog from './ImportPurchaseOrderDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import { FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { purchaseOrderStatuses } from '../data'
import { Building2, Users } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getUsers } from '@/stores/UserSlice'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import { DeleteMultiplePurchaseOrdersDialog } from './DeleteMultiplePurchaseOrdersDialog'
import { deleteMultiplePurchaseOrders } from '@/stores/PurchaseOrderSlice'
import { TrashIcon } from '@radix-ui/react-icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const DataTableToolbar = ({ table, onCreated, isMyPurchaseOrder }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showReceiptReminderDialog, setShowReceiptReminderDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    // Filter out orders that are not draft or cancelled
    const invalidOrders = selectedRows.filter(row => !['draft', 'cancelled'].includes(row.original.status))

    if (invalidOrders.length > 0) {
      toast.error('Chỉ có thể xóa các đơn hàng ở trạng thái Nháp hoặc Đã hủy')
      return
    }

    try {
      await dispatch(deleteMultiplePurchaseOrders(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  const users = useSelector((state) => state.user.users)

  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    dispatch(getUsers())
  }, [dispatch])

  // Handle export Excel
  const handleExportExcel = () => {
    toast.info('Chức năng xuất Excel đang được phát triển')
  }

  // Mobile Toolbar
  if (isMobile) {
    return (
      <div className="space-y-2">
        {/* Search section */}
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter || ''}
          onChange={(e) =>
            table.setGlobalFilter(e.target.value)
          }
          className="h-8 w-full text-sm"
        />

        {/* Quick actions */}
        <div className="flex gap-2">
          <Can permission={['PURCHASE_ORDER_CREATE']}>
            <Button
              size="sm"
              className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowCreateDialog(true)}
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
              <DropdownMenuItem
                onClick={() => setShowExportDialog(true)}
                className="text-xs text-green-600"
              >
                <IconFileTypeXls className="mr-2 h-3 w-3" />
                Xuất file Excel
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setShowImportDialog(true)}
                className="text-xs text-blue-600"
              >
                <FileSpreadsheet className="mr-2 h-3 w-3" />
                Import Excel
              </DropdownMenuItem>

              {/* Nhắc nhở giao hàng */}
              <DropdownMenuItem
                onClick={() => {
                  const selectedRows = table.getSelectedRowModel().rows
                  if (selectedRows.length === 0) {
                    toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                    return
                  }

                  const validOrders = selectedRows.filter(row => !['draft', 'completed', 'received', 'cancelled'].includes(row.original.status))
                  if (validOrders.length === 0) {
                    toast.warning('Không có đơn hàng nào hợp lệ để nhắc nhở (chỉ nhắc các đơn đang giao, đã đặt...)')
                    return
                  }

                  setShowReceiptReminderDialog(true)
                }}
                className="text-xs text-orange-600"
              >
                <TruckIcon className="mr-2 h-3 w-3" />
                Gửi nhắc hàng
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const selectedRows = table.getSelectedRowModel().rows
                  if (selectedRows.length === 0) {
                    toast.warning('Vui lòng chọn ít nhất 1 đơn hàng')
                    return
                  }
                  const invalidOrders = selectedRows.filter(row => !['draft', 'cancelled'].includes(row.original.status))
                  if (invalidOrders.length > 0) {
                    toast.warning('Chỉ có thể xóa các đơn hàng ở trạng thái Nháp hoặc Đã hủy')
                    return
                  }
                  setShowDeleteDialog(true)
                }}
                className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="mr-2 h-3 w-3" />
                Xóa ({table.getSelectedRowModel().rows.length})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Dialog tạo đơn đặt hàng */}
        {showCreateDialog && (
          <PurchaseOrderDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={onCreated}
            showTrigger={false}
          />
        )}

        {/* Dialog Export */}
        {showExportDialog && (
          <ExportPurchaseOrderDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}

        {/* Dialog Nhắc nhở nhận hàng */}
        {showReceiptReminderDialog && (
          <ReceiptReminderDialog
            open={showReceiptReminderDialog}
            onOpenChange={setShowReceiptReminderDialog}
            selectedPurchaseOrders={table.getSelectedRowModel().rows.map(r => r.original)}
          />
        )}

        {/* Dialog Import */}
        {showImportDialog && (
          <ImportPurchaseOrderDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
        {/* Dialog Xóa nhiều */}
        <DeleteMultiplePurchaseOrdersDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={table.getSelectedRowModel().rows.length}
        />
      </div>
    )
  }

  // Desktop Toolbar
  return (
    <div
      className="
    flex w-full justify-between gap-3 overflow-x-auto
    md:flex-wrap md:overflow-visible
  "
    >
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="flex items-center justify-center gap-1 w-full sm:w-auto">
          <Input
            placeholder="Tìm kiếm..."
            value={table.getState().globalFilter || ''}
            onChange={(e) =>
              table.setGlobalFilter(e.target.value)
            }
            className="h-8 w-full sm:w-[350px]"
          />
        </div>

        {/* Filter theo người tạo */}
        {!isMyPurchaseOrder && users && table.getColumn('user') && (
          <DataTableFacetedFilter
            column={table.getColumn('user')}
            title="Người tạo"
            options={users?.map((user) => ({
              value: user?.id,
              label: user?.fullName,
            }))}
          />
        )}

        {/* Filter theo trạng thái */}
        {purchaseOrderStatuses && table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={purchaseOrderStatuses.map((s) => ({
              value: s.value,
              label: s.label,
            }))}
          />
        )}

        {/* Filter loại đơn */}
        {table.getColumn('sourceType') && (
          <DataTableFacetedFilter
            column={table.getColumn('sourceType')}
            title="Loại đơn"
            options={[
              { value: 'supplier', label: 'Nhà cung cấp', icon: Building2 },
              { value: 'customer', label: 'Khách hàng', icon: Users },
            ]}
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

      <div className="flex flex-wrap items-center justify-end gap-2 whitespace-nowrap">
        {/* Nhắc nhở giao hàng (cho Nhà cung cấp) */}
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

            const validOrders = selectedRows.filter(row => !['draft', 'completed', 'received', 'cancelled'].includes(row.original.status))
            if (validOrders.length === 0) {
              toast.warning('Không có đơn hàng nào hợp lệ để nhắc nhở (chỉ nhắc các đơn đang giao, đã đặt...)')
              return
            }

            setShowReceiptReminderDialog(true)
          }}
        >
          <TruckIcon className="mr-2 size-4" aria-hidden="true" />
          Gửi nhắc hàng
        </Button>

        {/* Xuất Excel */}
        <Button
          className="text-green-600 border-green-200 hover:bg-green-50"
          variant="outline"
          size="sm"
          onClick={() => setShowExportDialog(true)}
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

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

        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa ({selectedRows.length})
          </Button>
        )}

        {/* Tạo đơn đặt hàng */}
        <Can permission={['PURCHASE_ORDER_CREATE']}>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </Can>

        {/* Dialog tạo đơn đặt hàng */}
        {showCreateDialog && (
          <PurchaseOrderDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            onSuccess={onCreated}
            showTrigger={false}
          />
        )}

        {/* Dialog Export */}
        {showExportDialog && (
          <ExportPurchaseOrderDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}

        {/* Dialog Nhắc nhở nhận hàng */}
        {showReceiptReminderDialog && (
          <ReceiptReminderDialog
            open={showReceiptReminderDialog}
            onOpenChange={setShowReceiptReminderDialog}
            selectedPurchaseOrders={table.getSelectedRowModel().rows.map(r => r.original)}
          />
        )}

        {/* Dialog Import */}
        {showImportDialog && (
          <ImportPurchaseOrderDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}

        <DeleteMultiplePurchaseOrdersDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedRows.length}
        />

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

export { DataTableToolbar }
