import { Layout, LayoutBody } from '@/components/custom/Layout'
import { useDispatch, useSelector } from 'react-redux'
import { columns } from './components/Column'
import { useEffect } from 'react'
import { getUsers } from '@/stores/UserSlice'
import { EmployeeDataTable } from './components/EmployeeDataTable'

const EmployeePage = () => {
    const users = useSelector((state) => state.user.users)
    const loading = useSelector((state) => state.user.loading)

    const dispatch = useDispatch()
    useEffect(() => {
        document.title = 'Quản lý nhân viên'
        dispatch(getUsers())
    }, [dispatch])

    return (
        <Layout>
            <LayoutBody className="flex flex-col bg-[#f6fbf2] dark:bg-[#090b0a] !pb-0" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
                            Danh sách nhân viên
                        </h2>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-hidden px-4 pt-1 pb-0 lg:flex-row lg:space-x-12 lg:space-y-0">
                    {users && (
                        <EmployeeDataTable
                            data={users}
                            columns={columns}
                            loading={loading}
                        />
                    )}
                </div>
            </LayoutBody>
        </Layout>
    )
}

export default EmployeePage
