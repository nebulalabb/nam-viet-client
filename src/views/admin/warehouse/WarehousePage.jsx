import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getWarehouses } from '@/stores/WarehouseSlice'
import { Layout, LayoutBody } from '@/components/custom/Layout'
import { WarehouseDataTable } from './components/WarehouseDataTable'
import { columns } from './components/Column'

export default function WarehousePage() {
    const dispatch = useDispatch()
    const { warehouses, meta, loading } = useSelector((state) => state.warehouse)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const [globalFilter, setGlobalFilter] = useState('')
    const [sorting, setSorting] = useState([])
    const [columnFilters, setColumnFilters] = useState([])

    useEffect(() => {
        let sortField = 'createdAt';
        let sortOrder = 'desc';

        if (sorting.length > 0) {
            sortField = sorting[0].id;
            sortOrder = sorting[0].desc ? 'desc' : 'asc';
        }

        const filters = columnFilters.reduce((acc, filter) => {
            acc[filter.id] = filter.value[0];
            return acc;
        }, {});

        dispatch(getWarehouses({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: globalFilter || undefined,
            sortBy: sortField,
            sortOrder: sortOrder,
            ...filters,
        }))
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter, sorting, columnFilters])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Quản lý kho hàng</h2>
                        <p className="text-muted-foreground">
                            Danh sách các kho hàng và thông tin chi tiết.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <WarehouseDataTable
                        data={warehouses}
                        columns={columns}
                        loading={loading}
                        pagination={pagination}
                        pageCount={meta?.totalPages || 1}
                        rowCount={meta?.total || 0}
                        onPaginationChange={setPagination}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        sorting={sorting}
                        setSorting={setSorting}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                    />
                </div>
            </LayoutBody>
        </Layout>
    )
}
