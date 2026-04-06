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
import { DeleteSupplierDialog } from './DeleteSupplierDialog'
import UpdateSupplierDialog from './UpdateSupplierDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteSupplierDialog, setShowDeleteSupplierDialog] =
    useState(false)
  const [showUpdateSupplierDialog, setShowUpdateSupplierDialog] =
    useState(false)

  return (
    <>
      {showDeleteSupplierDialog && (
        <DeleteSupplierDialog
          open={showDeleteSupplierDialog}
          onOpenChange={setShowDeleteSupplierDialog}
          supplier={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateSupplierDialog && (
        <UpdateSupplierDialog
          open={showUpdateSupplierDialog}
          onOpenChange={setShowUpdateSupplierDialog}
          supplier={row.original}
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
          <Can permission="UPDATE_SUPPLIER">
            <DropdownMenuItem
              onSelect={() => setShowUpdateSupplierDialog(true)}
              className="text-amber-500 hover:text-amber-600 focus:text-amber-600"
            >
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_SUPPLIER">
            <DropdownMenuItem
              onSelect={() => setShowDeleteSupplierDialog(true)}
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
