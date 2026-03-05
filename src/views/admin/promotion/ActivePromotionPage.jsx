import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PromotionDataTable } from './components/PromotionDataTable'
import { columns } from './components/ActivePromotionColumn'
import { ActivePromotionDataTableToolbar } from './components/ActivePromotionDataTableToolbar'
import api from '@/utils/axios'
import { toast } from 'sonner'

export default function ActivePromotionPage() {
    const [promotions, setPromotions] = useState([])
    const [meta, setMeta] = useState({ total: 0, totalPages: 0 })
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    useEffect(() => {
        const fetchActivePromotions = async () => {
            setLoading(true)
            try {
                const res = await api.get(
                    `/promotions?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&isActive=true`
                )
                if (res.data?.data) {
                    setPromotions(res.data.data)
                    if (res.data.meta) setMeta(res.data.meta)
                }
            } catch (error) {
                toast.error('Không thể tải danh sách khuyến mãi đang hoạt động')
            } finally {
                setLoading(false)
            }
        }
        fetchActivePromotions()
    }, [pagination])

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                    <CardTitle className="text-xl">Khuyến mãi đang hoạt động</CardTitle>
                    <CardDescription>Danh sách các chương trình khuyến mãi hiện đang được áp dụng.</CardDescription>
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
                    Toolbar={ActivePromotionDataTableToolbar}
                />
            </CardContent>
        </Card>
    )
}
