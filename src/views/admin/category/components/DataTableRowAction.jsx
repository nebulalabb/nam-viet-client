import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'
import UpdateCategoryDialog from './UpdateCategoryDialog'
import CategoryDetailDialog from './CategoryDetailDialog'

const DataTableRowActions = ({ row }) => {
    const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] =
        useState(false)

    const [showUpdateCategoryDialog, setShowUpdateCategoryDialog] =
        useState(false)

    const [showCategoryDetailDialog, setShowCategoryDetailDialog] = useState(false)

    return (
        <>
            {showDeleteCategoryDialog && (
                <DeleteCategoryDialog
                    open={showDeleteCategoryDialog}
                    onOpenChange={setShowDeleteCategoryDialog}
                    category={row.original}
                    showTrigger={false}
                />
            )}

            {showUpdateCategoryDialog && (
                <UpdateCategoryDialog
                    open={showUpdateCategoryDialog}
                    onOpenChange={setShowUpdateCategoryDialog}
                    category={row.original}
                    showTrigger={false}
                />
            )}

            {showCategoryDetailDialog && (
                <CategoryDetailDialog
                    open={showCategoryDetailDialog}
                    onOpenChange={setShowCategoryDetailDialog}
                    category={row.original}
                    showTrigger={false}
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
                    <Can permission="GET_CATEGORY">
                        <DropdownMenuItem
                            onSelect={() => setShowCategoryDetailDialog(true)}
                        >
                            Xem chi tiết
                            <DropdownMenuShortcut>
                                <IconEye className="h-4 w-4" />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Can>

                    <Can permission="UPDATE_CATEGORY">
                        <DropdownMenuItem
                            onSelect={() => setShowUpdateCategoryDialog(true)}
                            className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                        >
                            Sửa
                            <DropdownMenuShortcut>
                                <IconEdit className="h-4 w-4" />
                            </DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Can>

                    <Can permission="DELETE_CATEGORY">
                        <DropdownMenuItem
                            onSelect={() => setShowDeleteCategoryDialog(true)}
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
