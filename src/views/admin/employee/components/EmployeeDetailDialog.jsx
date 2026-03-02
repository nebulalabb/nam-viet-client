import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'
import { employeeStatuses } from '../data/index'

const EmployeeDetailDialog = ({ open, onOpenChange, user, showTrigger = true, ...props }) => {
    if (!user) return null

    const status = employeeStatuses.find((s) => s.value === user.status) || {
        label: user.status,
        variant: 'outline',
    }
    const StatusIcon = status.icon

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value || 0)

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <div className="cursor-pointer font-medium text-blue-600 hover:underline">
                        {user.employeeCode}
                    </div>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết nhân viên</DialogTitle>
                </DialogHeader>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                    <DetailItem label="Mã nhân viên" value={user.employeeCode} />
                    <DetailItem label="Họ và tên" value={user.fullName} />
                    <DetailItem label="Email" value={user.email} />
                    <DetailItem label="Số điện thoại" value={user.phone || '-'} />
                    <DetailItem label="Chức vụ" value={user.role?.roleName || '-'} />
                    <DetailItem label="Kho trực thuộc" value={user.warehouse?.warehouseName || '-'} />

                    <div className="flex flex-col space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Trạng thái</span>
                        <span>
                            <Badge variant={status.variant} className="w-fit flex items-center gap-1">
                                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                {status.label}
                            </Badge>
                        </span>
                    </div>

                    <DetailItem label="Ngày tạo" value={dateFormat(user.createdAt, true)} />
                    <DetailItem label="Cập nhật lần cuối" value={dateFormat(user.updatedAt, true)} />
                    <DetailItem label="Đăng nhập lần cuối" value={user.lastLogin ? dateFormat(user.lastLogin, true) : 'Chưa đăng nhập'} />
                </div>
            </DialogContent>
        </Dialog>
    )
}

const DetailItem = ({ label, value }) => (
    <div className="flex flex-col space-y-1 border-b pb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="font-medium text-sm text-foreground">{value}</span>
    </div>
)

export default EmployeeDetailDialog
