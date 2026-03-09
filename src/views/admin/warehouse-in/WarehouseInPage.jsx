import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { WarehouseInDataTable } from './components/WarehouseInDataTable'
import { columns } from './components/Columns'
import { getStockTransactions } from '@/stores/StockTransactionSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { getProducts } from '@/stores/ProductSlice'
import { PackageOpen } from 'lucide-react'

export default function WarehouseInPage() {
    const dispatch = useDispatch()
    const { transactions, pagination: serverPagination, loading } = useSelector(
        (s) => s.stockTransaction
    )

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
    const [columnFilters, setColumnFilters] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        document.title = 'Phiếu nhập kho'
        dispatch(getWarehouses({ limit: 1000 }))
        dispatch(getProducts({ limit: 1000 }))
    }, [dispatch])

    useEffect(() => {
        const filterParams = columnFilters.reduce((acc, f) => {
            acc[f.id] = f.value
            return acc
        }, {})

        dispatch(getStockTransactions({
            transactionType: 'import',
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: globalFilter || undefined,
            ...filterParams,
        }))
    }, [dispatch, pagination.pageIndex, pagination.pageSize, columnFilters, globalFilter])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center gap-3">
                    <PackageOpen className="h-6 w-6 text-primary" />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Phiếu Nhập Kho</h2>
                        <p className="text-muted-foreground text-sm">Quản lý phiếu nhập hàng vào kho</p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1">
                    <WarehouseInDataTable
                        data={transactions}
                        columns={columns}
                        loading={loading}
                        pagination={pagination}
                        pageCount={serverPagination?.totalPages || 1}
                        rowCount={serverPagination?.total || 0}
                        onPaginationChange={setPagination}
                        columnFilters={columnFilters}
                        onColumnFiltersChange={setColumnFilters}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={setGlobalFilter}
                    />
                </div>
            </LayoutBody>
        </Layout>
    )
}
