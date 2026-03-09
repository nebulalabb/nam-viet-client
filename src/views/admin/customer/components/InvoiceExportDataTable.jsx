import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/table'
import { InvoiceExportRowActions } from './InvoiceExportRowActions'
import { Loader2 } from 'lucide-react'
import { dateFormat } from '@/utils/date-format'

export function InvoiceExportDataTable({
    data,
    loading,
    onRefresh
}) {

    const columns = [
        {
            accessorKey: 'transactionCode',
            header: 'Mã phiếu',
            cell: ({ row }) => <span className="font-medium text-primary">{row.getValue('transactionCode')}</span>,
        },
        {
            accessorKey: 'warehouse',
            header: 'Kho xuất',
            cell: ({ row }) => {
                const wh = row.original.warehouse
                return wh ? <div className="max-w-[150px] truncate" title={wh.warehouseName}>{wh.warehouseName}</div> : '-'
            },
        },
        {
            accessorKey: 'reason',
            header: 'Lý do - Ghi chú',
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    <div className="truncate text-sm font-medium" title={row.getValue('reason')}>{row.getValue('reason') || '-'}</div>
                    {row.original.notes && (
                        <div className="truncate text-xs text-muted-foreground" title={row.original.notes}>{row.original.notes}</div>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'itemCount',
            header: 'Số lượng',
            cell: ({ row }) => {
                const count = row.original.details?.reduce((acc, curr) => acc + Number(curr.quantity), 0) || 0
                return <span>{count.toLocaleString()}</span>
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Ngày tạo',
            cell: ({ row }) => <span>{dateFormat(row.getValue('createdAt'))}</span>,
        },
        {
            accessorKey: 'creator',
            header: 'Người tạo',
            cell: ({ row }) => {
                const user = row.original.creator
                return user ? <span>{user.fullName}</span> : '-'
            }
        },
        {
            accessorKey: 'status',
            header: 'Trạng thái',
            cell: ({ row }) => {
                const status = row.getValue('status')
                if (status === 'draft') return <span className="text-yellow-600 font-medium">Nháp</span>
                if (status === 'approved' || status === 'completed' || status === 'posted') return <span className="text-green-600 font-medium">Đã duyệt</span>
                if (status === 'cancelled') return <span className="text-red-600 font-medium">Đã hủy</span>
                return <span>{status}</span>
            }
        },
        {
            id: 'actions',
            cell: ({ row }) => <InvoiceExportRowActions row={row} onRefresh={onRefresh} />,
        },
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    Đơn hàng này chưa có phiếu xuất kho.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
