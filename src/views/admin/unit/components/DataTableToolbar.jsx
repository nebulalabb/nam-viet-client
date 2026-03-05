import { Cross2Icon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import CreateUnitDialog from './CreateUnitDialog'
import DeleteMultipleUnitsDialog from './DeleteMultipleUnitsDialog'
import { unitStatuses } from '../data'
import { useEffect, useState } from 'react'

export function DataTableToolbar({
    table,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
}) {
    const isFiltered = columnFilters.length > 0 || !!globalFilter
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const hasSelectedRows = selectedRows.length > 0

    const [searchInput, setSearchInput] = useState(globalFilter || '')

    useEffect(() => {
        const timer = setTimeout(() => {
            setGlobalFilter(searchInput)
        }, 500)

        return () => clearTimeout(timer)
    }, [searchInput, setGlobalFilter])

    const handleStatusChange = (e) => {
        const value = e.target.value
        if (value) {
            setColumnFilters([{ id: 'status', value }])
        } else {
            setColumnFilters([])
        }
    }

    const selectedStatus = columnFilters.find((f) => f.id === 'status')?.value || ''

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Tìm theo mã, tên..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                    <option value="">Tất cả trạng thái</option>
                    {unitStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setColumnFilters([])
                            setGlobalFilter('')
                            setSearchInput('')
                        }}
                        className="h-8 px-2 lg:px-3"
                    >
                        Xóa lọc
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    {hasSelectedRows && (
                        <DeleteMultipleUnitsDialog
                            units={selectedRows.map((row) => row.original)}
                            onSuccess={() => table.toggleAllRowsSelected(false)}
                        />
                    )}
                </div>
                <CreateUnitDialog />
                <DataTableViewOptions table={table} />
            </div>
        </div>
    )
}
