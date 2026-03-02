import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'

const LogDetailDialog = ({ open, onOpenChange, log }) => {
  if (!log) return null

  const formatValue = (val) => {
    if (val === null || val === undefined) return 'null'
    if (typeof val === 'object') return JSON.stringify(val, null, 2)
    return String(val)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chi tiết nhật ký #{log.id}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="grid gap-4 py-4">
            {/* General Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Người thực hiện</label>
                <div className="text-sm font-semibold">{log.user?.fullName || log.username || 'System'}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Thời gian</label>
                <div className="text-sm">{dateFormat(log.createdAt, true)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hành động</label>
                <div>
                  <Badge variant={log.action === 'DELETE' ? 'destructive' : 'outline'}>
                    {log.action}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Đối tượng (ID)</label>
                <div className="text-sm">{log.entity} (#{log.entityId})</div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">IP Address</label>
                <div className="text-sm">{log.ipAddress}</div>
              </div>
            </div>

            {/* Changes */}
            {(log.oldValues || log.newValues) && (
              <div className="rounded-md border p-4 bg-muted/50">
                <h4 className="mb-2 font-semibold">Dữ liệu thay đổi</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.oldValues && (
                    <div>
                      <span className="text-xs font-bold text-red-500 block mb-1">Dữ liệu cũ (Old Values)</span>
                      <pre className="text-xs bg-slate-950 text-slate-50 p-2 rounded overflow-auto max-h-[300px]">
                        {formatValue(log.oldValues)}
                      </pre>
                    </div>
                  )}
                  {log.newValues && (
                    <div>
                      <span className="text-xs font-bold text-green-500 block mb-1">Dữ liệu mới (New Values)</span>
                      <pre className="text-xs bg-slate-950 text-slate-50 p-2 rounded overflow-auto max-h-[300px]">
                        {formatValue(log.newValues)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default LogDetailDialog
