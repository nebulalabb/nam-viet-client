import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import Can from '@/utils/can'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import CreateAttributeDialog from './CreateAttributeDialog'
import ImportAttributeDialog from './ImportAttributeDialog'
import { IconFileTypeXls } from '@tabler/icons-react'
import { FileSpreadsheet } from 'lucide-react'
import ExportAttributeDialog from './ExportAttributeDialog'
import { DeleteMultipleAttributesDialog } from './DeleteMultipleAttributesDialog'
import { bulkDeleteAttributes } from '@/stores/AttributeSlice'

const DataTableToolbar = ({ table }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateAttributeDialog, setShowCreateAttributeDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.original.id)
    await dispatch(bulkDeleteAttributes(ids))
    setShowDeleteDialog(false)
    table.resetRowSelection()
  }

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Tìm kiếm..."
          value={table.getColumn('name')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
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
          <Can permission={'DELETE_ATTRIBUTE'}>
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

        <Can permission={'CREATE_ATTRIBUTE'}>
          <Button
            onClick={() => setShowCreateAttributeDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateAttributeDialog && (
            <CreateAttributeDialog
              open={showCreateAttributeDialog}
              onOpenChange={setShowCreateAttributeDialog}
              showTrigger={false}
            />
          )}
        </Can>

        <Can permission={'GET_ATTRIBUTE'}>
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
            <ExportAttributeDialog
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
            <ImportAttributeDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
            />
          )}
        </Can>

        <DataTableViewOptions table={table} />
      </div>

      <DeleteMultipleAttributesDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleBulkDelete}
        count={selectedCount}
      />
    </div>
  )
}

export { DataTableToolbar }
