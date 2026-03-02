import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSuppliers } from '@/stores/SupplierSlice'
import { columns } from './components/Column'
import { SupplierDataTable } from './components/SupplierDataTable'

const SupplierPage = () => {
    const dispatch = useDispatch()
    const suppliers = useSelector((state) => state.supplier.suppliers)
    const loading = useSelector((state) => state.supplier.loading)
    const serverPagination = useSelector((state) => state.supplier.pagination)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    })

    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        document.title = 'Quản lý nhà cung cấp'
    }, [])

    useEffect(() => {
        const fetchSuppliers = async () => {
            const params = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            }
            if (globalFilter) {
                params.search = globalFilter
            }
            dispatch(getSuppliers(params))
        }

        const timer = setTimeout(() => {
            fetchSuppliers()
        }, 500)

        return () => clearTimeout(timer)
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-green-900">
                            Nhà Cung Cấp
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Quản lý danh sách các nhà cung cấp, công nợ và thông tin liên hệ.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <SupplierDataTable
                        data={suppliers || []}
                        columns={columns}
                        loading={loading}
                        pagination={pagination}
                        pageCount={serverPagination?.totalPages || 1}
                        rowCount={serverPagination?.total || 0}
                        onPaginationChange={setPagination}
                    />
                </div>
            </LayoutBody>
        </Layout>
    )
}

export default SupplierPage
