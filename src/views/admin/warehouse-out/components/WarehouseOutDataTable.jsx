import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'
import { useState } from 'react'
import { ExportRowActions } from './ExportRowActions'
import { WarehouseOutToolbar } from './WarehouseOutToolbar'
import { DataTablePagination } from '../../customer/components/DataTablePagination'
import { Loader2 } from 'lucide-react'

export function WarehouseOutDataTable({
    data,
    columns,
    loading,
    pagination,
    pageCount,
    rowCount,
    onPaginationChange,
    columnFilters,
    onColumnFiltersChange,
    globalFilter,
    onGlobalFilterChange,
}) {
    const [columnVisibility, setColumnVisibility] = useState({})

    const table = useReactTable({
        data,
        columns,
        state: { columnVisibility, columnFilters, globalFilter, pagination },
        pageCount,
        rowCount,
        manualPagination: true,
        manualFiltering: true,
        enableRowSelection: false,
        onPaginationChange,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange,
        onGlobalFilterChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="flex flex-col gap-3 h-full">
            <WarehouseOutToolbar
                table={table}
                globalFilter={globalFilter}
                setGlobalFilter={onGlobalFilterChange}
                columnFilters={columnFilters}
                setColumnFilters={onColumnFiltersChange}
            />
            <div className="flex-1 overflow-auto rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null :
                                            flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {cell.column.id === 'actions'
                                                ? <ExportRowActions row={row} />
                                                : flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Không có phiếu xuất kho nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} rowCount={rowCount} />
        </div>
    )
}
