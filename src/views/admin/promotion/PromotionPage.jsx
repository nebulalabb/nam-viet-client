import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDispatch, useSelector } from 'react-redux'
import { getPromotions } from '@/stores/PromotionSlice'
import { PromotionDataTable } from './components/PromotionDataTable'
import { columns } from './components/Column'

export default function PromotionPage() {
    const dispatch = useDispatch()
    const { promotions, meta, loading } = useSelector((state) => state.promotion)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        dispatch(getPromotions(`page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}`))
    }, [dispatch, pagination])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                    <CardTitle className="text-xl">Chương trình khuyến mãi</CardTitle>
                    <CardDescription>Quản lý các chương trình khuyến mãi, giảm giá và quà tặng.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <PromotionDataTable
                    columns={columns}
                    data={promotions}
                    loading={loading}
                    pagination={pagination}
                    pageCount={meta?.totalPages || 0}
                    rowCount={meta?.total || 0}
                    onPaginationChange={setPagination}
                />
            </CardContent>
        </Card>
    )
}
