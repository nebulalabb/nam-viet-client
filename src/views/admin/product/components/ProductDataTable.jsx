import { useState } from 'react'
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { DataTablePagination } from './DataTablePagination'
import { DataTableToolbar } from './DataTableToolbar'
import { Loader2 } from 'lucide-react'

export function ProductDataTable({
    columns,
    data,
    loading,
    pagination,
    pageCount,
    rowCount,
    onPaginationChange,
    columnFilters,
    onColumnFiltersChange,
    globalFilter,
    onGlobalFilterChange,
    onRowClick,
    hideCreateProduct,
    onCreateSuccess,
}) {
    const [rowSelection, setRowSelection] = useState({})
    const [columnVisibility, setColumnVisibility] = useState({})

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting: [],
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
            pagination,
        },
        pageCount,
        rowCount,
        enableRowSelection: true,
        manualPagination: true,
        manualFiltering: true,
        onPaginationChange,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        onColumnFiltersChange,
        onGlobalFilterChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="flex h-full flex-col space-y-4">
            <DataTableToolbar
                table={table}
                columnFilters={columnFilters}
                setColumnFilters={onColumnFiltersChange}
                globalFilter={globalFilter}
                setGlobalFilter={onGlobalFilterChange}
                hideCreateProduct={hideCreateProduct}
                onCreateSuccess={onCreateSuccess}
            />
            <div className="flex-1 overflow-hidden rounded-md border">
                <Table className="relative">
                    <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className="cursor-pointer"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            onClick={() => {
                                                const colId = cell.column.id
                                                if (colId !== 'select' && colId !== 'actions' && onRowClick) {
                                                    onRowClick(row.original)
                                                }
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Không có kết quả.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    )
}
