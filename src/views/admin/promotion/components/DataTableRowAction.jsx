import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import Can from '@/utils/can'
import { useState } from 'react'
import { CheckIcon } from '@radix-ui/react-icons'

// These will be implemented in the next step
import DeletePromotionDialog from './DeletePromotionDialog'
import UpdatePromotionDialog from './UpdatePromotionDialog'
import ApprovePromotionDialog from './ApprovePromotionDialog'
import RestorePromotionDialog from './RestorePromotionDialog'

const DataTableRowActions = ({ row }) => {
    const [showCancelPromotionDialog, setShowCancelPromotionDialog] = useState(false)
    const [showExplicitDeleteDialog, setShowExplicitDeleteDialog] = useState(false)
    const [showUpdatePromotionDialog, setShowUpdatePromotionDialog] = useState(false)
    const [showApprovePromotionDialog, setShowApprovePromotionDialog] = useState(false)
    const [showRestorePromotionDialog, setShowRestorePromotionDialog] = useState(false)

    // Only "pending" promotions can be approved
    const canApprove = row.original.status === 'pending'

    // Non-cancelled promotions can be cancelled (including waiting)
    const canCancel = ['pending', 'active', 'waiting'].includes(row.original.status)
    const canDelete = ['cancelled', 'expired'].includes(row.original.status)
    const canRestore = ['cancelled', 'expired'].includes(row.original.status)

    // Only "pending" promotions can be edited
    const canEdit = row.original.status === 'pending'

    return (
        <>
            <DeletePromotionDialog
                open={showCancelPromotionDialog}
                onOpenChange={setShowCancelPromotionDialog}
                promotion={row.original}
                isDeleteAction={false}
                showTrigger={false}
            />

            <DeletePromotionDialog
                open={showExplicitDeleteDialog}
                onOpenChange={setShowExplicitDeleteDialog}
                promotion={row.original}
                isDeleteAction={true}
                showTrigger={false}
            />

            <UpdatePromotionDialog
                open={showUpdatePromotionDialog}
                onOpenChange={setShowUpdatePromotionDialog}
                promotion={row.original}
                showTrigger={false}
            />

            <ApprovePromotionDialog
                open={showApprovePromotionDialog}
                onOpenChange={setShowApprovePromotionDialog}
                promotion={row.original}
            />

            <RestorePromotionDialog
                open={showRestorePromotionDialog}
                onOpenChange={setShowRestorePromotionDialog}
                promotion={row.original}
            />

            <div className="flex items-center justify-end gap-2 text-right">
                {canDelete && (
                    <Can permission="DELETE_PROMOTION">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="flex size-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Xóa khuyến mãi"
                            onClick={() => setShowExplicitDeleteDialog(true)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </Can>
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
                        {canEdit && (
                            <Can permission="UPDATE_PROMOTION">
                                <DropdownMenuItem
                                    onSelect={() => setShowUpdatePromotionDialog(true)}
                                    className="text-orange-600 focus:text-orange-600 focus:bg-orange-50"
                                >
                                    Sửa
                                    <DropdownMenuShortcut>
                                        <IconEdit className="h-4 w-4" />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </Can>
                        )}

                        {canApprove && (
                            <Can permission="UPDATE_PROMOTION">
                                <DropdownMenuItem
                                    onSelect={() => setShowApprovePromotionDialog(true)}
                                    className="text-green-600 focus:text-green-600 focus:bg-green-50"
                                >
                                    Duyệt Khuyến Mãi
                                    <DropdownMenuShortcut>
                                        <CheckIcon className="h-4 w-4" />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </Can>
                        )}

                        {canCancel && (
                            <Can permission="DELETE_PROMOTION">
                                <DropdownMenuItem
                                    onSelect={() => setShowCancelPromotionDialog(true)}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                >
                                    Hủy
                                    <DropdownMenuShortcut>
                                        <IconTrash className="h-4 w-4" />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </Can>
                        )}

                        {canRestore && (
                            <Can permission="UPDATE_PROMOTION">
                                <DropdownMenuItem
                                    onSelect={() => setShowRestorePromotionDialog(true)}
                                    className="text-blue-600 focus:text-blue-600 focus:bg-blue-50"
                                >
                                    Khôi phục
                                </DropdownMenuItem>
                            </Can>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}

export { DataTableRowActions }
