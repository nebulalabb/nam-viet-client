import { Cross2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { statuses } from '../data'
import { DataTableViewOptions } from './DataTableViewOption'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import CreateTaxDialog from './CreateTaxDialog'
import { DeleteMultipleTaxesDialog } from './DeleteMultipleTaxesDialog'
import { bulkDeleteTaxes } from '@/stores/TaxSlice'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import Can from '@/utils/can'
import { IconFileTypeXls } from '@tabler/icons-react'
import { FileSpreadsheet } from 'lucide-react'
import ExportTaxDialog from './ExportTaxDialog'
import ImportTaxDialog from './ImportTaxDialog'

const DataTableToolbar = ({ table }) => {
  const dispatch = useDispatch()
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateTaxDialog, setShowCreateTaxDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const selectedRows = table.getSelectedRowModel().rows
  const selectedCount = selectedRows.length

  const handleBulkDelete = async () => {
    const ids = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(bulkDeleteTaxes(ids)).unwrap()
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
          value={table.getColumn('title')?.getFilterValue() || ''}
          onChange={(event) =>
            table.getColumn('title')?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2">
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title="Trạng thái"
              options={statuses}
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

      {selectedCount > 0 && (
        <Button
          variant="destructive"
          size="sm"
          className="h-8"
          onClick={() => setShowDeleteDialog(true)}
        >
          <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          Xóa ({selectedCount})
        </Button>
      )}

      <Can permission={'CREATE_TAX'}>
        <Button
          onClick={() => setShowCreateTaxDialog(true)}
          className="bg-green-600 hover:bg-green-700 text-white shrink-0"
          size="sm"
        >
          <PlusIcon className="mr-2 size-4" aria-hidden="true" />
          Thêm mới
        </Button>

        {showCreateTaxDialog && (
          <CreateTaxDialog
            open={showCreateTaxDialog}
            onOpenChange={setShowCreateTaxDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <Can permission={'CREATE_TAX'}>
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
          <ImportTaxDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
          />
        )}
      </Can>

      <Can permission={'GET_TAX'}>
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
          <ExportTaxDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
          />
        )}
      </Can>

      <DataTableViewOptions table={table} />

      <DeleteMultipleTaxesDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleBulkDelete}
        count={selectedCount}
      />
    </div>
  )
}

export { DataTableToolbar }
