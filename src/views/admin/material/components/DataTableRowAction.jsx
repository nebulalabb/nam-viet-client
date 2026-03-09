import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
import UpdateMaterialDialog from './UpdateMaterialDialog'
import DeleteMaterialDialog from './DeleteMaterialDialog'
import MaterialDetailDialog from './MaterialDetailDialog'
import { getMaterialById } from '@/stores/MaterialSlice'

const DataTableRowActions = ({ row }) => {
    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)
    const [showDetail, setShowDetail] = useState(false)

    const dispatch = useDispatch()
    const materialDetail = useSelector((state) => state.material.material)
    const detailLoading = useSelector((state) => state.material.detailLoading)

    const handleViewDetail = () => {
        dispatch(getMaterialById(row.original.id))
        setShowDetail(true)
    }

    return (
        <>
            {showDelete && (
                <DeleteMaterialDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    material={row.original}
                    showTrigger={false}
                />
            )}

            {showEdit && (
                <UpdateMaterialDialog
                    open={showEdit}
                    onOpenChange={setShowEdit}
                    material={row.original}
                />
            )}

            {showDetail && (
                <MaterialDetailDialog
                    open={showDetail}
                    onOpenChange={setShowDetail}
                    material={materialDetail}
                    loading={detailLoading}
                />
            )}

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Open menu"
                        variant="ghost"
                        className="flex size-8 p-0 data-[state=open]:bg-muted"
                    >
                        <DotsHorizontalIcon className="size-4" aria-hidden="true" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                        onSelect={handleViewDetail}
                        className="text-green-600 focus:text-green-600 focus:bg-green-50"
                    >
                        Xem chi tiết
                        <DropdownMenuShortcut>
                            <IconEye className="h-4 w-4" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        onSelect={() => setShowEdit(true)}
                        className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                    >
                        Sửa
                        <DropdownMenuShortcut>
                            <IconEdit className="h-4 w-4" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onSelect={() => setShowDelete(true)}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                        Xóa
                        <DropdownMenuShortcut>
                            <IconTrash className="h-4 w-4" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

export { DataTableRowActions }
