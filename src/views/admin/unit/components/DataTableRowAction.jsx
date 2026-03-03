import { Check, Edit, MoreHorizontal, Trash2, X } from 'lucide-react'
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
import UpdateUnitDialog from './UpdateUnitDialog'
import DeleteUnitDialog from './DeleteUnitDialog'
import UpdateUnitStatusDialog from './UpdateUnitStatusDialog'

export function DataTableRowActions({ row }) {
    const unit = row.original
    const [showUpdateUnitDialog, setShowUpdateUnitDialog] = useState(false)
    const [showDeleteUnitDialog, setShowDeleteUnitDialog] = useState(false)
    const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)

    return (
        <>
            <div className="flex gap-2">
                <UpdateUnitDialog
                    unit={unit}
                    open={showUpdateUnitDialog}
                    onOpenChange={setShowUpdateUnitDialog}
                />
                <DeleteUnitDialog
                    unit={unit}
                    open={showDeleteUnitDialog}
                    onOpenChange={setShowDeleteUnitDialog}
                />
                <UpdateUnitStatusDialog
                    unit={unit}
                    open={showUpdateStatusDialog}
                    onOpenChange={setShowUpdateStatusDialog}
                    showTrigger={false}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Mở menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => setShowUpdateUnitDialog(true)}>
                            <Edit className="mr-2 h-4 w-4 text-primary" />
                            Chỉnh sửa
                        </DropdownMenuItem>

                        {unit.status === 'active' ? (
                            <DropdownMenuItem
                                onClick={() => setShowUpdateStatusDialog(true)}
                            >
                                <X className="mr-2 h-4 w-4 text-warning" />
                                Ngừng hoạt động
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                onClick={() => setShowUpdateStatusDialog(true)}
                            >
                                <Check className="mr-2 h-4 w-4 text-success" />
                                Kích hoạt
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setShowDeleteUnitDialog(true)}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Xóa
                            <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
