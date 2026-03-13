import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOption } from './DataTableViewOption'
import { DataTableFacetedFilter } from '@/views/admin/customer/components/DataTableFacetedFilter'
import CreateWarehouseDialog from './CreateWarehouseDialog'
import DeleteWarehouseDialog from './DeleteWarehouseDialog'
import Can from '@/utils/can'
import { warehouseTypes, warehouseStatuses } from '../data'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { PlusIcon, FileSpreadsheet } from 'lucide-react'
import { TrashIcon } from '@radix-ui/react-icons'
import { IconFileTypeXls } from '@tabler/icons-react'
import { deleteMultipleWarehouses } from '@/stores/WarehouseSlice'
import ImportWarehouseDialog from './ImportWarehouseDialog'
import ExportWarehouseDialog from './ExportWarehouseDialog'
import { DeleteMultipleWarehousesDialog } from './DeleteMultipleWarehousesDialog'

export function DataTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateWarehouseDialog, setShowCreateWarehouseDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const dispatch = useDispatch()
  const selectedRows = table.getSelectedRowModel().rows

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(deleteMultipleWarehouses(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm mã kho, tên kho..."
          value={table.getState().globalFilter || ''}
          onChange={(event) =>
            table.setGlobalFilter(String(event.target.value))
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

        <div className="flex gap-x-2">
          {table.getColumn('warehouseType') && (
            <DataTableFacetedFilter
              column={table.getColumn('warehouseType')}
              title="Loại kho"
              options={warehouseTypes}
            />
          )}
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={warehouseStatuses}
            />
          )}
        </div>

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

      <Can permission={'CREATE_WAREHOUSE'}>
        <CreateWarehouseDialog />

        <Button
          onClick={() => setShowImportDialog(true)}
          className="mx-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          variant="outline"
          size="sm"
        >
          <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
          Import Excel
        </Button>

        {showImportDialog && (
          <ImportWarehouseDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
      </Can>

      <Can permission={'CREATE_WAREHOUSE'}>
        <Button
          onClick={() => setShowExportDialog(true)}
          className="mx-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          variant="outline"
          size="sm"
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {showExportDialog && (
          <ExportWarehouseDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DeleteMultipleWarehousesDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        count={selectedRows.length}
      />

      <DataTableViewOption table={table} />
    </div>
  )
}
