import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import { getTasks, deleteTask, updateTask } from '@/stores/TaskSlice'
import TaskTable from './components/TaskTable'
import TaskDialog from './components/TaskDialog'
import { Button } from '@/components/custom/Button'
import {
    Plus, Search, RotateCcw
} from 'lucide-react'

const TaskPage = () => {
    const dispatch = useDispatch()

    const tasks = useSelector((state) => state.task.tasks)
    const loading = useSelector((state) => state.task.loading)
    const serverPagination = useSelector((state) => state.task.pagination)

    const [searchTerm, setSearchTerm] = useState("")

    const [filters, setFilters] = useState({
        page: 1,
        limit: 20,
    })

    // Dialog State
    const [selectedTask, setSelectedTask] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Delete confirm state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deletingTaskId, setDeletingTaskId] = useState(null)

    // Effect fetch
    useEffect(() => {
        document.title = 'Nhiệm vụ CSKH'
        const timer = setTimeout(() => {
            dispatch(getTasks({
                ...filters,
                search: searchTerm,
            }))
        }, 500)
        return () => clearTimeout(timer)
    }, [dispatch, filters, searchTerm])

    const handleResetFilters = () => {
        setSearchTerm("")
        setFilters({
            page: 1,
            limit: 20
        })
    }

    // Actions
    const handleOpenCreate = () => {
        setSelectedTask(null)
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (task) => {
        setSelectedTask(task)
        setIsDialogOpen(true)
    }

    const handleOpenDelete = (id) => {
        setDeletingTaskId(id)
        setIsDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!deletingTaskId) return;
        try {
            await dispatch(deleteTask(deletingTaskId)).unwrap()
            setIsDeleteDialogOpen(false)
            setDeletingTaskId(null)
            dispatch(getTasks({ ...filters, search: searchTerm })) // refresh
        } catch (error) {
            console.error(error)
        }
    }

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await dispatch(updateTask({ id: taskId, data: { status: newStatus } })).unwrap()
            dispatch(getTasks({ ...filters, search: searchTerm })) // refresh
        } catch (error) {
            console.error("Failed to update status", error)
        }
    }

    return (
        <Layout>
            <LayoutBody className="flex flex-col" fixedHeight>

                {/* HEADER */}
                <div className="mb-4 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Nhiệm vụ CSKH
                        </h2>
                        <p className="text-sm text-gray-500">Quản lý các công việc chăm sóc khách hàng hàng ngày</p>
                    </div>
                    <div className="flex gap-2">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-9 px-4 rounded-md" onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4" /> Tạo nhiệm vụ mới
                        </Button>
                    </div>
                </div>

                {/* FILTER BAR */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-4 mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring block pl-9 pr-3"
                                placeholder="Tìm kiếm nhiệm vụ..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-gray-500 hover:text-red-600 h-9 shrink-0">
                            <RotateCcw className="h-4 w-4 mr-2" /> Xóa bộ lọc
                        </Button>
                    </div>
                </div>

                <div className="-mx-4 flex-1 overflow-auto px-4 py-1 flex flex-col space-y-4">
                    <TaskTable
                        data={tasks}
                        isLoading={loading}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        onStatusChange={handleStatusChange}
                        pagination={filters}
                        pageCount={serverPagination?.totalPages || 1}
                        rowCount={serverPagination?.total || 0}
                        onPaginationChange={(newPagination) => setFilters(prev => ({ ...prev, page: newPagination.page, limit: newPagination.limit }))}
                    />
                </div>

                <TaskDialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    initialData={selectedTask}
                    onSuccess={() => dispatch(getTasks({ ...filters, search: searchTerm }))}
                />

                {isDeleteDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa nhiệm vụ</h3>
                            <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn xóa nhiệm vụ này không? Hành động này không thể hoàn tác.</p>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Hủy</Button>
                                <Button variant="destructive" onClick={handleConfirmDelete}>Xóa</Button>
                            </div>
                        </div>
                    </div>
                )}
            </LayoutBody>
        </Layout>
    )
}

export default TaskPage
