import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/custom/Button'
import { Checkbox } from '@/components/ui/checkbox'
import { dateFormat } from '@/utils/date-format'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Can from '@/utils/can'
import { statuses } from '../data'
import { DeleteTaxDialog } from './DeleteTaxDialog'
import UpdateTaxDialog from './UpdateTaxDialog'

const MobileTaxCard = ({ tax, isSelected, onSelectChange }) => {
  const [showDeleteTaxDialog, setShowDeleteTaxDialog] = useState(false)
  const [showUpdateTaxDialog, setShowUpdateTaxDialog] = useState(false)

  const { title, percentage, status, createdAt } = tax

  const getStatusBadge = (statusValue) => {
    const statusObj = statuses.find((s) => s.value === statusValue)
    if (!statusObj) {
      return (
        <Badge variant="outline" className="border-transparent bg-transparent px-0 text-gray-500">
          {statusValue || 'Không xác định'}
        </Badge>
      )
    }

    return (
      <Badge
        variant="outline"
        className={
          statusObj.value === 'published' || statusObj.value === 'active'
            ? 'border-transparent bg-transparent px-0 text-green-600'
            : 'border-transparent bg-transparent px-0 text-red-600'
        }
      >
        {statusObj.icon && <statusObj.icon className="mr-1 h-3 w-3" />}
        {statusObj.label}
      </Badge>
    )
  }

  return (
    <>
      <div className="border rounded-lg bg-card mb-3 overflow-hidden shadow-sm">
        {/* Header Section */}
        <div className="p-3 border-b bg-background/50 flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelectChange}
            className="h-4 w-4"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate text-primary">
              {title}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {dateFormat(createdAt, true)}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <Can permission="UPDATE_TAX">
                <DropdownMenuItem
                  className="text-amber-500 hover:text-amber-600 focus:text-amber-600"
                  onClick={() => setShowUpdateTaxDialog(true)}
                >
                  <IconEdit className="mr-2 h-4 w-4" />
                  Sửa
                </DropdownMenuItem>
              </Can>
              <Can permission="DELETE_TAX">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setShowDeleteTaxDialog(true)}
                >
                  <IconTrash className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </Can>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Details Section */}
        <div className="p-3 bg-background/30 space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Phần trăm:</div>
              <div className="text-sm font-semibold text-blue-600">{percentage}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Trạng thái:</div>
              <div className="flex justify-end">{getStatusBadge(status)}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Người tạo:</div>
              <div className="text-sm break-words">{tax.creator?.fullName || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteTaxDialog && (
        <DeleteTaxDialog
          open={showDeleteTaxDialog}
          onOpenChange={setShowDeleteTaxDialog}
          tax={tax}
          showTrigger={false}
        />
      )}

      {showUpdateTaxDialog && (
        <UpdateTaxDialog
          open={showUpdateTaxDialog}
          onOpenChange={setShowUpdateTaxDialog}
          tax={tax}
          showTrigger={false}
        />
      )}
    </>
  )
}

export default MobileTaxCard
