import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import { useEffect, useState } from 'react'
import { getActivePromotions } from '@/stores/PromotionSlice'
import { ActivePromotionDataTable } from './components/ActivePromotionDataTable'

const ActivePromotionsPage = () => {
    const activePromotions = useSelector((state) => state.promotion.activePromotions)
    const loading = useSelector((state) => state.promotion.loading)

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    })
    const [globalFilter, setGlobalFilter] = useState('')

    const dispatch = useDispatch()

    useEffect(() => {
        document.title = 'Khuyến mãi đang hoạt động'
        dispatch(getActivePromotions())
    }, [dispatch])

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Khuyến mãi đang hoạt động
                        </h2>
                        <p className="text-muted-foreground">
                            Danh sách các khuyến mãi đang chạy và có thể áp dụng
                        </p>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
                    <ActivePromotionDataTable
                        data={activePromotions || []}
                        columns={columns}
                        loading={loading}
                        pagination={pagination}
                        onPaginationChange={setPagination}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={setGlobalFilter}
                    />
                </div>
            </LayoutBody>
        </Layout>
    )
}

export default ActivePromotionsPage
