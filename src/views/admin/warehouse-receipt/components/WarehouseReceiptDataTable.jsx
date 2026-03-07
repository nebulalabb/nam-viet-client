import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
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
import { DataTableToolbar } from './DataTableToolbar'
import { DataTablePagination } from './DataTablePagination'
import { Skeleton } from '@/components/ui/skeleton'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
import MobileWarehouseReceiptCard from './MobileWarehouseReceiptCard'

const WarehouseReceiptDataTable = ({
  columns,
  data,
  loading = false,
  onSearchChange,
  onRefresh,
  pagination,
  onPaginationChange,
  pageCount,
  columnFilters = [],
  onColumnFiltersChange,
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})
  const [internalColumnFilters, setInternalColumnFilters] = useState([])

  const finalColumnFilters = onColumnFiltersChange ? columnFilters : internalColumnFilters
  const finalSetColumnFilters = onColumnFiltersChange ? onColumnFiltersChange : setInternalColumnFilters

  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const isMobile = useMediaQuery('(max-width: 768px)')

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 30, //custom default page size
      },
    },
    manualFiltering: true,
    manualPagination: true,
    pageCount: pageCount,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: finalColumnFilters,
      globalFilter,
      ...(pagination && { pagination }),
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: finalSetColumnFilters,
    ...(onPaginationChange && { onPaginationChange }),
    onGlobalFilterChange: (updater) => {
      const value = typeof updater === 'function' ? updater(globalFilter) : updater
      setGlobalFilter(value)
      if (onSearchChange) {
        onSearchChange(value)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} onRefresh={onRefresh} />

      <div className={isMobile ? '' : 'rounded-md border'}>
        {isMobile ? (
          <div className="space-y-4 border-none p-0">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-40 w-full rounded-lg" />
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <MobileWarehouseReceiptCard
                  key={row.id}
                  receipt={row.original}
                  isSelected={row.getIsSelected()}
                  onSelectChange={(value) => row.toggleSelected(!!value)}
                />
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                Không có kết quả nào
              </div>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-secondary">
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
                <>
                  {Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-[20px] w-full rounded-md" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
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
                    Không có kết quả nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export { WarehouseReceiptDataTable }
