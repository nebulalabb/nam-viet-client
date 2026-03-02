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
import { DeleteRoleDialog } from './DeleteRoleDialog'
import UpdateRoleDialog from './UpdateRoleDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteRoleDialog, setShowDeleteRoleDialog] = useState(false)
  const [showUpdateRoleDialog, setShowUpdateRoleDialog] = useState(false)

  return (
    <>
      {showDeleteRoleDialog && (
        <DeleteRoleDialog
          open={showDeleteRoleDialog}
          onOpenChange={setShowDeleteRoleDialog}
          role={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateRoleDialog && (
        <UpdateRoleDialog
          open={showUpdateRoleDialog}
          onOpenChange={setShowUpdateRoleDialog}
          role={row.original}
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
          <Can permission="UPDATE_ROLE">
            <DropdownMenuItem onSelect={() => setShowUpdateRoleDialog(true)} className="text-orange-600">
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_ROLE">
            <DropdownMenuItem onSelect={() => setShowDeleteRoleDialog(true)} className="text-red-600">
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
