import { Button } from '@/components/custom/Button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    InfoIcon,
    Pencil,
    Trash2,
    X,
    CodeIcon,
    CheckCircle2,
    LinkIcon,
    FolderTree,
} from 'lucide-react'
import Can from '@/utils/can'
import { useState } from 'react'
import { dateFormat } from '@/utils/date-format'
import { Badge } from '@/components/ui/badge'
import UpdateCategoryDialog from './UpdateCategoryDialog'
import { DeleteCategoryDialog } from './DeleteCategoryDialog'

const CategoryDetailDialog = ({ category, showTrigger = true, ...props }) => {
    const [showDeleteCategoryDialog, setShowDeleteCategoryDialog] = useState(false)
    const [showUpdateCategoryDialog, setShowUpdateCategoryDialog] = useState(false)

    if (!category) return null;

    return (
        <Dialog {...props}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        Mở chi tiết
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="md:h-auto md:max-w-xl z-[100095]" overlayClassName="z-[100094]">
                <DialogHeader>
                    <DialogTitle>Chi tiết danh mục: {category?.categoryName}</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết của danh mục
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[75vh] overflow-auto">
                    <div className="space-y-6">
                        <div className="rounded-lg border p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="font-semibold text-lg flex items-center gap-2">
                                    <FolderTree className="h-5 w-5 text-primary" />
                                    Thông tin chung
                                </div>
                                <Badge variant={category?.status === 'active' ? 'default' : 'secondary'}>
                                    {category?.status === 'active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                                </Badge>
                            </div>

                            <div className="space-y-4 text-sm mt-4">
                                <div className="flex items-center text-foreground hover:text-primary">
                                    <div className="mr-3 h-5 w-5 flex items-center justify-center text-muted-foreground">
                                        <CodeIcon className="h-4 w-4" />
                                    </div>
                                    <span className="w-28 font-medium">Mã danh mục:</span>
                                    <span className="font-semibold">{category?.categoryCode || '—'}</span>
                                </div>

                                <div className="flex items-center text-foreground hover:text-primary">
                                    <div className="mr-3 h-5 w-5 flex items-center justify-center text-muted-foreground">
                                        <InfoIcon className="h-4 w-4" />
                                    </div>
                                    <span className="w-28 font-medium">Tên danh mục:</span>
                                    <span>{category?.categoryName || '—'}</span>
                                </div>

                                <div className="flex items-center text-foreground hover:text-primary">
                                    <div className="mr-3 h-5 w-5 flex items-center justify-center text-muted-foreground">
                                        <LinkIcon className="h-4 w-4" />
                                    </div>
                                    <span className="w-28 font-medium">Đường dẫn:</span>
                                    <span>{category?.slug || '—'}</span>
                                </div>

                                <div className="flex items-start text-foreground hover:text-primary">
                                    <div className="mr-3 h-5 w-5 mt-0.5 flex items-center justify-center text-muted-foreground">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <span className="w-28 font-medium shrink-0">Trạng thái:</span>
                                    <span>{category?.status === 'active' ? 'Đang hoạt động' : 'Đã khóa'}</span>
                                </div>

                                {category?.description && (
                                    <div className="flex items-start text-foreground hover:text-primary pt-2 border-t mt-4">
                                        <div className="mr-3 h-5 w-5 mt-0.5 flex items-center justify-center text-muted-foreground">
                                            <div className="h-4 w-4 rounded-full border border-current opacity-70 flex items-center justify-center">i</div>
                                        </div>
                                        <span className="w-28 font-medium shrink-0">Mô tả:</span>
                                        <span className="text-muted-foreground whitespace-pre-wrap">{category.description}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg border p-4">
                                <div className="text-sm text-muted-foreground mb-1">Người tạo</div>
                                <div className="font-medium">{category?.creator?.fullName || '—'}</div>
                                <div className="text-xs text-muted-foreground mt-1">{dateFormat(category?.createdAt, true)}</div>
                            </div>
                            <div className="rounded-lg border p-4">
                                <div className="text-sm text-muted-foreground mb-1">Người cập nhật</div>
                                <div className="font-medium">{category?.updater?.fullName || '—'}</div>
                                <div className="text-xs text-muted-foreground mt-1">{dateFormat(category?.updatedAt, true)}</div>
                            </div>
                        </div>

                    </div>
                </div>
                <DialogFooter className="hidden md:flex sm:space-x-0 mt-4">
                    <div className="w-full grid grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end">
                        <Can permission="UPDATE_CATEGORY">
                            <Button
                                size="sm"
                                onClick={() => setShowUpdateCategoryDialog(true)}
                                className="gap-2 w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <Pencil className="h-4 w-4" />
                                Sửa
                            </Button>
                        </Can>

                        <Can permission="DELETE_CATEGORY">
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setShowDeleteCategoryDialog(true)}
                                className="gap-2 w-full sm:w-auto"
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                            </Button>
                        </Can>

                        <DialogClose asChild>
                            <Button size="sm" type="button" variant="outline" className="gap-2 w-full sm:w-auto">
                                <X className="h-4 w-4" />
                                Đóng
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>

            {showDeleteCategoryDialog && (
                <DeleteCategoryDialog
                    open={showDeleteCategoryDialog}
                    onOpenChange={setShowDeleteCategoryDialog}
                    category={category}
                    showTrigger={false}
                    onSuccess={() => props?.onOpenChange?.(false)}
                    contentClassName="z-[100097]"
                    overlayClassName="z-[100096]"
                />
            )}

            {showUpdateCategoryDialog && (
                <UpdateCategoryDialog
                    open={showUpdateCategoryDialog}
                    onOpenChange={setShowUpdateCategoryDialog}
                    category={category}
                    showTrigger={false}
                    onSuccess={() => props?.onOpenChange?.(false)}
                    contentClassName="z-[100097]"
                    overlayClassName="z-[100096]"
                />
            )}
        </Dialog>
    )
}

export default CategoryDetailDialog
