import { useState } from 'react'
import { useMediaQuery } from '@/hooks/UseMediaQuery'
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
import MobilePurchaseOrderCard from './MobilePurchaseOrderCard'
import { normalizeText } from '@/utils/normalize-text'

const PurchaseOrderDataTable = ({
  columns,
  data,
  loading = false,
  onCreated,
  isMyPurchaseOrder = false,
  onView,
  // Server-side pagination
  pageCount,
  pagination,
  onPaginationChange,
  // Server-side search
  onSearchChange,
  columnFilters = [], // Add columnFilters prop
  onColumnFiltersChange, // Add onColumnFiltersChange prop
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState({})

  // Use internal state if props not provided (fallback)
  const [internalColumnFilters, setInternalColumnFilters] = useState([])
  const finalColumnFilters = onColumnFiltersChange ? columnFilters : internalColumnFilters
  const finalSetColumnFilters = onColumnFiltersChange ? onColumnFiltersChange : setInternalColumnFilters

  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: isMobile ? 15 : 30,
      },
    },
    meta: {
      onView,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters: finalColumnFilters,
      globalFilter,
      pagination, // server-side pagination state
    },
    manualPagination: true,
    manualFiltering: true, // Enable server-side pagination
    pageCount: pageCount ?? -1,
    onPaginationChange: (updater) => {
      if (onPaginationChange) {
        const nextState = typeof updater === 'function' ? updater(pagination) : updater
        onPaginationChange(nextState)
      }
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: finalSetColumnFilters,
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
    globalFilterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true

      const filterNorm = normalizeText(filterValue)

      // 1. Check Supplier attributes
      const supplier = row.original.supplier
      if (supplier) {
        const supplierText = normalizeText(
          `${supplier.name || ''} ${supplier.taxCode || ''} ${supplier.phone || ''}`
        )
        if (supplierText.includes(filterNorm)) {
          return true
        }
      }

      // 2. Check the specific column value
      const value = row.getValue(columnId)
      if (value != null && typeof value !== 'object') {
        return normalizeText(String(value)).includes(filterNorm)
      }

      return false
    },
  })

  // Mobile View - Card List
  if (isMobile) {
    return (
      <div className="space-y-4">
        <DataTableToolbar table={table} onCreated={onCreated} isMyPurchaseOrder={isMyPurchaseOrder} />

        <div className="space-y-2">
          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <Skeleton className="h-[20px] w-1/3 rounded-md" />
                  <Skeleton className="h-[16px] w-2/3 rounded-md" />
                  <Skeleton className="h-[16px] w-1/2 rounded-md" />
                </div>
              ))}
            </>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <MobilePurchaseOrderCard
                key={row.id}
                purchaseOrder={row.original}
                isSelected={row.getIsSelected()}
                onSelectChange={(checked) => row.toggleSelected(checked)}
                onRowAction={() => { }}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Không có kết quả nào
            </div>
          )}
        </div>

        <DataTablePagination table={table} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} onCreated={onCreated} isMyPurchaseOrder={isMyPurchaseOrder} />

      <div className="rounded-md border">
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
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}

export default PurchaseOrderDataTable
