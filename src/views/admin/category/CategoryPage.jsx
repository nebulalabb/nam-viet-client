import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import { useEffect, useState } from 'react'
import { getCategories } from '@/stores/CategorySlice'
import { CategoryDataTable } from './components/CategoryDataTable'

const CategoryPage = () => {
    const categories = useSelector((state) => state.category.categories)
    const loading = useSelector((state) => state.category.loading)

    const serverPagination = useSelector((state) => state.category.pagination)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    })

    const dispatch = useDispatch()
    useEffect(() => {
        document.title = 'Quản lý danh mục'
        dispatch(getCategories({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
        }))
    }, [dispatch, pagination.pageIndex, pagination.pageSize])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Danh sách danh mục
                        </h2>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {categories && (
                        <CategoryDataTable
                            data={categories}
                            columns={columns}
                            loading={loading}
                            pagination={pagination}
                            pageCount={serverPagination?.totalPages || 1}
                            rowCount={serverPagination?.totalCount || 0}
                            onPaginationChange={setPagination}
                        />
                    )}
                </div>
            </LayoutBody>
        </Layout>
    )
}

export default CategoryPage
