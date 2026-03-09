import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Cross2Icon } from '@radix-ui/react-icons'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { transactionStatuses } from '../data'
import CreateExportDialog from './CreateExportDialog'

export function WarehouseOutToolbar({
    table,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilters,
}) {
    const warehouses = useSelector((s) => s.warehouse.warehouses || [])
    const [searchInput, setSearchInput] = useState(globalFilter || '')

    useEffect(() => {
        const t = setTimeout(() => setGlobalFilter(searchInput), 500)
        return () => clearTimeout(t)
    }, [searchInput, setGlobalFilter])

    const handleFilterChange = (id, value) => {
        const next = columnFilters.filter((f) => f.id !== id)
        if (value) next.push({ id, value })
        setColumnFilters(next)
    }

    const selectedStatus = columnFilters.find((f) => f.id === 'status')?.value || ''
    const selectedWarehouse = columnFilters.find((f) => f.id === 'warehouseId')?.value || ''
    const isFiltered = columnFilters.length > 0 || !!globalFilter

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
                <Input
                    placeholder="Tìm mã phiếu, lý do..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="h-8 w-[220px]"
                />
                <select
                    value={selectedStatus}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                >
                    <option value="">Trạng thái</option>
                    {transactionStatuses.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
                <select
                    value={selectedWarehouse}
                    onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-3 text-sm shadow-sm max-w-[160px]"
                >
                    <option value="">Kho hàng</option>
                    {warehouses.map((w) => (
                        <option key={w.id} value={w.id}>{w.warehouseName}</option>
                    ))}
                </select>
                {isFiltered && (
                    <Button variant="ghost" size="sm" className="h-8 px-2"
                        onClick={() => { setColumnFilters([]); setGlobalFilter(''); setSearchInput('') }}>
                        Xóa lọc <Cross2Icon className="ml-1 h-3 w-3" />
                    </Button>
                )}
            </div>
            <CreateExportDialog />
        </div>
    )
}
