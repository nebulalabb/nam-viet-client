import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { warehouseReceiptStatuses } from '../data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical } from 'lucide-react'

import CreateManualWarehouseReceiptDialog from './CreateManualWarehouseReceiptDialog'
import { DeleteMultipleWarehouseReceiptsDialog } from './DeleteMultipleWarehouseReceiptsDialog'
import { deleteMultipleWarehouseReceipts } from '@/stores/WarehouseReceiptSlice'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

export function DataTableToolbar({ table, onRefresh }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const isFiltered = table.getState().columnFilters.length > 0
  const [selectedReceiptIds, setSelectedReceiptIds] = useState([])
  const [selectedReceipts, setSelectedReceipts] = useState([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows
  const dispatch = useDispatch()

  useEffect(() => {
    const receipts = selectedRows.map((row) => row.original)
    setSelectedReceipts(receipts)
    setSelectedReceiptIds(receipts.map((inv) => inv.id))
  }, [selectedRows])

  const handleDelete = async () => {
    const selectedIds = selectedReceipts.map((inv) => inv.id)
    // Filter out receipts that are not draft or cancelled
    const invalidReceipts = selectedReceipts.filter(inv => !['draft', 'cancelled'].includes(inv.status))

    if (invalidReceipts.length > 0) {
      toast.error('Chỉ có thể xóa các phiếu kho ở trạng thái Nháp hoặc Đã hủy')
      return
    }

    try {
      await dispatch(deleteMultipleWarehouseReceipts(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
      if (onRefresh) onRefresh()
    } catch (error) {
      console.log(error)
    }
  }
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Mobile Toolbar
  if (isMobile) {
    return (
      <div className="space-y-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter || ''}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-full text-sm"
        />

        <div className="flex gap-2">
          <Button
            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <PlusIcon className="mr-1 h-3 w-3" />
            Tạo phiếu mới
          </Button>

          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={warehouseReceiptStatuses}
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem
                onClick={() => {
                  if (selectedReceipts.length > 0) {
                    setShowDeleteDialog(true)
                  } else {
                    toast.warning('Vui lòng chọn ít nhất 1 phiếu')
                  }
                }}
                disabled={selectedReceipts.length === 0}
                className="text-destructive focus:text-destructive"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Xóa ({selectedReceipts.length})
              </DropdownMenuItem>

              {isFiltered && (
                <>
                  <div className="my-1 h-px bg-muted" />
                  <DropdownMenuItem
                    onClick={() => table.resetColumnFilters()}
                  >
                    <Cross2Icon className="mr-2 h-4 w-4" />
                    Đặt lại
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateManualWarehouseReceiptDialog
            open={showCreateDialog}
            onOpenChange={setShowCreateDialog}
            showTrigger={false}
            onSuccess={onRefresh}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getState().globalFilter || ''}
          onChange={(event) =>
            table.setGlobalFilter(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />



        {/* Filter by status */}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title="Trạng thái"
            options={warehouseReceiptStatuses}
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

      <div className="flex items-center gap-2">
        {selectedReceipts.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa ({selectedReceipts.length})
          </Button>
        )}

        <DeleteMultipleWarehouseReceiptsDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedReceipts.length}
        />

        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white h-8"
          onClick={() => setShowCreateDialog(true)}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Tạo phiếu
        </Button>

        <CreateManualWarehouseReceiptDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          showTrigger={false}
          onSuccess={onRefresh}
        />

        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

