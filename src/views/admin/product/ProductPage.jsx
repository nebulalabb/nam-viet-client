import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import { useEffect, useState } from 'react'
import { getProducts } from '@/stores/ProductSlice'
import { ProductDataTable } from './components/ProductDataTable'
import { getCategories } from '@/stores/CategorySlice'
import { getSuppliers } from '@/stores/SupplierSlice'
import { getUnits } from '@/stores/UnitSlice'
import { ProductDetailDialog } from './components/ProductDetailDialog'

const ProductPage = () => {
    const products = useSelector((state) => state.product.products)
    const loading = useSelector((state) => state.product.loading)

    const serverPagination = useSelector((state) => state.product.pagination)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    })
    const [columnFilters, setColumnFilters] = useState([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)

    const dispatch = useDispatch()
    useEffect(() => {
        document.title = 'Quản lý sản phẩm'

        // Load prerequisites for filters/dropdowns
        dispatch(getCategories({ limit: 1000 }))
        dispatch(getSuppliers({ limit: 1000 }))
        dispatch(getUnits({ limit: 1000 }))
    }, [dispatch])

    useEffect(() => {
        const filtersParams = columnFilters.reduce((acc, filter) => {
            acc[filter.id] = filter.value.join ? filter.value.join(',') : filter.value
            return acc
        }, {})

        dispatch(getProducts({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            search: globalFilter || undefined,
            ...filtersParams
        }))
    }, [dispatch, pagination.pageIndex, pagination.pageSize, columnFilters, globalFilter])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Danh sách sản phẩm
                        </h2>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {products && (
                        <ProductDataTable
                            data={products}
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
                            onRowClick={setSelectedProduct}
                        />
                    )}
                    <ProductDetailDialog
                        product={selectedProduct}
                        open={!!selectedProduct}
                        onOpenChange={(open) => !open && setSelectedProduct(null)}
                    />
                </div>
            </LayoutBody>
        </Layout>
    )
}

export default ProductPage
