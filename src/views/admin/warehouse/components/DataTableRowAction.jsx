import { useState } from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react'

import UpdateWarehouseDialog from './UpdateWarehouseDialog'
import DeleteWarehouseDialog from './DeleteWarehouseDialog'
import WarehouseDetailDialog from './WarehouseDetailDialog'
import Can from '@/utils/can'

export function DataTableRowAction({ row }) {
    const warehouse = row.original
    const [isUpdateOpen, setIsUpdateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                    >
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem
                        onClick={() => setIsDetailOpen(true)}
                        className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                    >
                        Xem chi tiết
                        <DropdownMenuShortcut>
                            <IconEye className="h-4 w-4" />
                        </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <Can permission={'WAREHOUSE_MANAGEMENT'}>
                        <DropdownMenuItem
                            onClick={() => setIsUpdateOpen(true)}
                            className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                        >
                            Sửa
                            <DropdownMenuShortcut>
                                <IconEdit className="h-4 w-4" />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setIsDeleteOpen(true)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                            Xóa
                            <DropdownMenuShortcut>
                                <IconTrash className="h-4 w-4" />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Can>
                </DropdownMenuContent>
            </DropdownMenu>

            {isUpdateOpen && (
                <UpdateWarehouseDialog
                    warehouse={warehouse}
                    open={isUpdateOpen}
                    onOpenChange={setIsUpdateOpen}
                    showTrigger={false}
                />
            )}

            {isDeleteOpen && (
                <DeleteWarehouseDialog
                    warehouse={warehouse}
                    open={isDeleteOpen}
                    onOpenChange={setIsDeleteOpen}
                    showTrigger={false}
                />
            )}

            {isDetailOpen && (
                <WarehouseDetailDialog
                    warehouse={warehouse}
                    open={isDetailOpen}
                    onOpenChange={setIsDetailOpen}
                    showTrigger={false}
                />
            )}
        </>
    )
}
