import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { PromotionDetailDialog } from '../../components/PromotionDetailDialog'

export const DataTableRowActions = ({ row }) => {
    const [showDetailDialog, setShowDetailDialog] = useState(false)

    return (
        <>
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
                    <DropdownMenuItem onSelect={() => setShowDetailDialog(true)} className="text-blue-600">
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {showDetailDialog && (
                <PromotionDetailDialog
                    open={showDetailDialog}
                    onOpenChange={setShowDetailDialog}
                    promotion={row.original}
                />
            )}
        </>
    )
}
