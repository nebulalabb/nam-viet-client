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
import { DeleteTaxDialog } from './DeleteTaxDialog'
import UpdateTaxDialog from './UpdateTaxDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteTaxDialog, setShowDeleteTaxDialog] = useState(false)
  const [showUpdateTaxDialog, setShowUpdateTaxDialog] = useState(false)

  return (
    <>
      {showDeleteTaxDialog && (
        <DeleteTaxDialog
          open={showDeleteTaxDialog}
          onOpenChange={setShowDeleteTaxDialog}
          tax={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateTaxDialog && (
        <UpdateTaxDialog
          open={showUpdateTaxDialog}
          onOpenChange={setShowUpdateTaxDialog}
          tax={row.original}
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
          <Can permission="UPDATE_TAX">
            <DropdownMenuItem
              onSelect={() => setShowUpdateTaxDialog(true)}
              className="text-amber-500 hover:text-amber-600 focus:text-amber-600"
            >
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_TAX">
            <DropdownMenuItem
              onSelect={() => setShowDeleteTaxDialog(true)}
              className="text-destructive focus:text-destructive"
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
