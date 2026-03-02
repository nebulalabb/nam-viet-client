import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import Can from '@/utils/can'
import UpdateSupplierDialog from './UpdateSupplierDialog'
import DeleteSupplierDialog from './DeleteSupplierDialog'

const DataTableRowActions = ({ row }) => {
    const [showEdit, setShowEdit] = useState(false)
    const [showDelete, setShowDelete] = useState(false)

    return (
        <>
            {showDelete && (
                <DeleteSupplierDialog
                    open={showDelete}
                    onOpenChange={setShowDelete}
                    supplier={row.original}
                    showTrigger={false}
                />
            )}

            {showEdit && (
                <UpdateSupplierDialog
                    open={showEdit}
                    onOpenChange={setShowEdit}
                    supplier={row.original}
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
                    <Can permission="UPDATE_SUPPLIER">
                        <DropdownMenuItem
                            onSelect={() => setShowEdit(true)}
                            className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                        >
                            Sửa
                            <DropdownMenuShortcut>
                                <IconEdit className="h-4 w-4" />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Can>

                    <Can permission="DELETE_SUPPLIER">
                        <DropdownMenuItem
                            onSelect={() => setShowDelete(true)}
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
        </>
    )
}

export { DataTableRowActions }
