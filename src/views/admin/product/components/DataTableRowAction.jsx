import { DotsHorizontalIcon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteProductDialog } from './DeleteProductDialog'
import { useState } from 'react'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import Can from '@/utils/can'
import UpdateProductDialog from './UpdateProductDialog'

const DataTableRowActions = ({ row }) => {
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
  const [showUpdateProductDialog, setShowUpdateProductDialog] = useState(false)

  return (
    <>
      {showDeleteProductDialog && (
        <DeleteProductDialog
          open={showDeleteProductDialog}
          onOpenChange={setShowDeleteProductDialog}
          product={row.original}
          showTrigger={false}
        />
      )}

      {showUpdateProductDialog && (
        <UpdateProductDialog
          open={showUpdateProductDialog}
          onOpenChange={setShowUpdateProductDialog}
          product={row.original}
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
          <Can permission="UPDATE_PRODUCT">
            <DropdownMenuItem
              onClick={() => setShowUpdateProductDialog(true)}
              className="text-amber-500 focus:text-amber-600 hover:text-amber-600 focus:bg-amber-50"
            >
              Sửa
              <DropdownMenuShortcut>
                <IconEdit className="h-4 w-4" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </Can>

          <Can permission="DELETE_PRODUCT">
            <DropdownMenuItem
              onSelect={() => setShowDeleteProductDialog(true)}
              className="text-red-500 hover:text-red-600 focus:text-red-600 focus:bg-red-50"
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
