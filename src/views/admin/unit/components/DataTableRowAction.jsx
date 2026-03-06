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
import { DeleteUnitDialog } from './DeleteUnitDialog'
import UpdateUnitDialog from './UpdateUnitDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteTaxDialog, setShowDeleteTaxDialog] = useState(false)
  const [showUpdateUnitDialog, setShowUpdateUnitDialog] = useState(false)

  return (
    <>
      {showDeleteTaxDialog && (
        <DeleteUnitDialog
          open={showDeleteTaxDialog}
          onOpenChange={setShowDeleteTaxDialog}
          unit={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateUnitDialog && (
        <UpdateUnitDialog
          open={showUpdateUnitDialog}
          onOpenChange={setShowUpdateUnitDialog}
          unit={row.original}
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
          <Can permission="UPDATE_UNIT">
            <DropdownMenuItem
              onSelect={() => setShowUpdateUnitDialog(true)}
              className="text-amber-500 hover:text-amber-600 focus:text-amber-600"
            >
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_UNIT">
            <DropdownMenuItem
              onSelect={() => setShowDeleteTaxDialog(true)}
              className="text-red-500 hover:text-red-600 focus:text-red-600"
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
