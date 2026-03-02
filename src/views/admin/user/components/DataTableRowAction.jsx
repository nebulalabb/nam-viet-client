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
import { DeleteUserDialog } from './DeleteUserDialog'
import { useState } from 'react'
import UpdateUserDialog from './UpdateUserDialog'
import Can from '@/utils/can'

const DataTableRowActions = ({ row }) => {
  const [showDeleteUserDialog, setShowDeleteUserDialog] = useState(false)
  const [showUpdateUserDialog, setShowUpdateUserDialog] = useState(false)

  return (
    <>
      {showDeleteUserDialog && (
        <DeleteUserDialog
          open={showDeleteUserDialog}
          onOpenChange={setShowDeleteUserDialog}
          user={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateUserDialog && (
        <UpdateUserDialog
          open={showUpdateUserDialog}
          onOpenChange={setShowUpdateUserDialog}
          user={row.original}
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
          <Can permission="UPDATE_USER">
            <DropdownMenuItem onSelect={() => setShowUpdateUserDialog(true)} className="text-orange-600">
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_USER">
            <DropdownMenuItem onSelect={() => setShowDeleteUserDialog(true)} className="text-red-600">
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
