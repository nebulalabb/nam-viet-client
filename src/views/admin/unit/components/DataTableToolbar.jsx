import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'

import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import CreateUnitDialog from './CreateUnitDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import ExportUnitDialog from './ExportUnitDialog'
import { useDispatch } from 'react-redux'
import { deleteMultipleUnits } from '@/stores/UnitSlice'
import { DeleteMultipleUnitsDialog } from './DeleteMultipleUnitsDialog'
import { TrashIcon } from '@radix-ui/react-icons'

const DataTableToolbar = ({ table }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateUnitDialog, setShowCreateUnitDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(deleteMultipleUnits(ids)).unwrap()
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('unitName')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('unitName')?.setFilterValue(event.target.value)
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

      <div className="flex items-center gap-2">
        {selectedCount > 0 && (
          <Can permission={'DELETE_CATEGORY'}>
            <Button
              variant="destructive"
              size="sm"
              className="h-8"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon className="mr-2 size-4" aria-hidden="true" />
              Xóa ({selectedCount})
            </Button>
          </Can>
        )}

        <Can permission={'CREATE_CATEGORY'}>
          <Button
            onClick={() => setShowCreateUnitDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateUnitDialog && (
            <CreateUnitDialog
              open={showCreateUnitDialog}
              onOpenChange={setShowCreateUnitDialog}
              showTrigger={false}
            />
          )}
        </Can>

        <Can permission={'GET_UNIT'}>
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
            <ExportUnitDialog
              open={showExportDialog}
              onOpenChange={setShowExportDialog}
              showTrigger={false}
            />
          )}
        </Can>

        <DataTableViewOptions table={table} />

        <DeleteMultipleUnitsDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleBulkDelete}
          count={selectedCount}
        />
      </div>
    </div>
  )
}

export { DataTableToolbar }
