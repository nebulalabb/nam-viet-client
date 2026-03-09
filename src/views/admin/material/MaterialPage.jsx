import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMaterials } from '@/stores/MaterialSlice'
import { columns } from './components/Column'
import { MaterialDataTable } from './components/MaterialDataTable'

const MaterialPage = () => {
    const dispatch = useDispatch()
    const materials = useSelector((state) => state.material.materials)
    const loading = useSelector((state) => state.material.loading)
    const serverPagination = useSelector((state) => state.material.pagination)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    })

    const [globalFilter, setGlobalFilter] = useState('')

    useEffect(() => {
        document.title = 'Quản lý nguyên liệu'
    }, [])

    useEffect(() => {
        const fetchMaterials = async () => {
            const params = {
                page: pagination.pageIndex + 1,
                limit: pagination.pageSize,
            }
            if (globalFilter) {
                params.search = globalFilter
            }
            dispatch(getMaterials(params))
        }

        const timer = setTimeout(() => {
            fetchMaterials()
        }, 500)

        return () => clearTimeout(timer)
    }, [dispatch, pagination.pageIndex, pagination.pageSize, globalFilter])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-green-900">
                            Nguyên Liệu
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Quản lý danh sách nguyên liệu, giá thành và nhà cung cấp.
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <MaterialDataTable
                        data={materials || []}
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

export default MaterialPage
