import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateSupplierDialog from './CreateSupplierDialog'
import ImportSupplierDialog from './ImportSupplierDialog'
import ExportSupplierDialog from './ExportSupplierDialog'
import { FileSpreadsheet } from 'lucide-react'
import { IconFileTypeXls } from '@tabler/icons-react'

import { DeleteMultipleSuppliersDialog } from './DeleteMultipleSuppliersDialog'
import { deleteMultipleSuppliers } from '@/stores/SupplierSlice'
import { useDispatch } from 'react-redux'
import { TrashIcon } from '@radix-ui/react-icons'

const DataTableToolbar = ({ table }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateSupplierDialog, setShowCreateSupplierDialog] =
    useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const dispatch = useDispatch()
  const selectedRows = table.getSelectedRowModel().rows

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(deleteMultipleSuppliers(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('supplierName')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('supplierName')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />

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

      {
        selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            className="h-8"
            onClick={() => setShowDeleteDialog(true)}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Xóa ({selectedRows.length})
          </Button>
        )
      }

      <Can permission={'CREATE_SUPPLIER'}>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCreateSupplierDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateSupplierDialog && (
            <CreateSupplierDialog
              open={showCreateSupplierDialog}
              onOpenChange={setShowCreateSupplierDialog}
              showTrigger={false}
            />
          )}

          <Button
            onClick={() => setShowExportDialog(true)}
            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
            variant="outline"
            size="sm"
          >
            <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
            Xuất Excel
          </Button>

          {showExportDialog && (
            <ExportSupplierDialog
              open={showExportDialog}
              onOpenChange={setShowExportDialog}
              showTrigger={false}
            />
          )}

          <Button
            onClick={() => setShowImportDialog(true)}
            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
            variant="outline"
            size="sm"
          >
            <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
            Import Excel
          </Button>

          {showImportDialog && (
            <ImportSupplierDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
            />
          )}
        </div>
      </Can>

      <DeleteMultipleSuppliersDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        count={selectedRows.length}
      />

      <DataTableViewOptions table={table} />
    </div >
  )
}

export { DataTableToolbar }
