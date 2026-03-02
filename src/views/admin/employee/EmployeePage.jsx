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
            <LayoutBody className="flex flex-col" fixedHeight>
                <div className="mb-2 flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Danh sách nhân viên
                        </h2>
                    </div>
                </div>
                <div className="-mx-4 flex-1 overflow-hidden px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
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
