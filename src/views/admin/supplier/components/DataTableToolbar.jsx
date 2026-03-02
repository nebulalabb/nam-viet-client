import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { PlusIcon, FileSpreadsheet } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supplierTypes, supplierStatuses } from './data'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { useDispatch } from 'react-redux'
import { TrashIcon } from '@radix-ui/react-icons'
import { IconFileTypeXls } from '@tabler/icons-react'
import Can from '@/utils/can'
import CreateSupplierDialog from './CreateSupplierDialog'
import ImportSupplierDialog from './ImportSupplierDialog'
import ExportSupplierDialog from './ExportSupplierDialog'

const DataTableToolbar = ({ table }) => {
    const isFiltered = table.getState().columnFilters.length > 0
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [showExportDialog, setShowExportDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const dispatch = useDispatch()
    const selectedRows = table.getSelectedRowModel().rows

    const initialFilter = table.getState().globalFilter || ''
    const [inputValue, setInputValue] = useState(initialFilter)

    useEffect(() => {
        setInputValue(table.getState().globalFilter || '')
    }, [table.getState().globalFilter])

    useEffect(() => {
        const timeout = setTimeout(() => {
            table.setGlobalFilter(inputValue)
        }, 300)
        return () => clearTimeout(timeout)
    }, [inputValue, table])

    const handleDelete = async () => {
        // Add logic later when delete multiple API is implemented
        const selectedIds = selectedRows.map((row) => row.original.id)
        try {
            console.log('Delete multiple:', selectedIds)
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
                    placeholder="Tìm kiếm mã, tên, SĐT..."
                    value={inputValue}
                    onChange={(event) => setInputValue(String(event.target.value))}
                    className="h-8 w-[150px] lg:w-[250px] border-green-200 focus-visible:ring-green-500"
                />

                <div className="flex gap-x-2">
                    {table.getColumn('status') && (
                        <DataTableFacetedFilter
                            column={table.getColumn('status')}
                            title="Trạng thái"
                            options={supplierStatuses}
                        />
                    )}

                    {/* Type filter doesn't have a column yet, but here's how to use it
          {table.getColumn('supplierType') && (
            <DataTableFacetedFilter
              column={table.getColumn('supplierType')}
              title="Loại NCC"
              options={supplierTypes}
            />
          )} */}
                </div>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3 text-green-600 hover:text-green-700 hover:bg-green-50"
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
                        className="h-8 bg-red-500 hover:bg-red-600"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <TrashIcon className="mr-2 size-4" aria-hidden="true" />
                        Xóa ({selectedRows.length})
                    </Button>
                )
            }

            <Can permission={'CREATE_SUPPLIER'}>
                <Button
                    onClick={() => setShowCreateDialog(true)}
                    className="mx-2 bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                >
                    <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                    Thêm mới
                </Button>

                <Button
                    onClick={() => setShowImportDialog(true)}
                    className="mx-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
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

                {showCreateDialog && (
                    <CreateSupplierDialog
                        open={showCreateDialog}
                        onOpenChange={setShowCreateDialog}
                    />
                )}
            </Can>

            <Can permission={'GET_SUPPLIER'}>
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
                    <ExportSupplierDialog
                        open={showExportDialog}
                        onOpenChange={setShowExportDialog}
                        showTrigger={false}
                    />
                )}
            </Can>
        </div>
    )
}

export { DataTableToolbar }
