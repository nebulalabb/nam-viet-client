import { Check, Edit, Eye, MoreHorizontal, Trash2, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import UpdateProductDialog from './UpdateProductDialog'
import DeleteProductDialog from './DeleteProductDialog'
import UpdateProductStatusDialog from './UpdateProductStatusDialog'
import { ProductDetailDialog } from './ProductDetailDialog'

export function DataTableRowActions({ row }) {
    const product = row.original
    const [showDetailDialog, setShowDetailDialog] = useState(false)
    const [showUpdateProductDialog, setShowUpdateProductDialog] = useState(false)
    const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false)
    const [showUpdateStatusDialog, setShowUpdateStatusDialog] = useState(false)
    const [newStatusParams, setNewStatusParams] = useState(null)

    return (
        <>
            <div className="flex gap-2">
                <ProductDetailDialog
                    product={product}
                    open={showDetailDialog}
                    onOpenChange={setShowDetailDialog}
                />
                <UpdateProductDialog
                    product={product}
                    open={showUpdateProductDialog}
                    onOpenChange={setShowUpdateProductDialog}
                />
                <DeleteProductDialog
                    product={product}
                    open={showDeleteProductDialog}
                    onOpenChange={setShowDeleteProductDialog}
                />
                <UpdateProductStatusDialog
                    product={product}
                    open={showUpdateStatusDialog}
                    onOpenChange={setShowUpdateStatusDialog}
                    newStatus={newStatusParams}
                    showTrigger={false}
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Mở menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => setShowDetailDialog(true)}>
                            <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                            Xem chi tiết
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setShowUpdateProductDialog(true)}>
                            <Edit className="mr-2 h-4 w-4 text-primary" />
                            Chỉnh sửa
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {product.status !== 'active' && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setNewStatusParams('active')
                                    setShowUpdateStatusDialog(true)
                                }}
                            >
                                <Check className="mr-2 h-4 w-4 text-success" />
                                Đang bán
                            </DropdownMenuItem>
                        )}

                        {product.status !== 'inactive' && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setNewStatusParams('inactive')
                                    setShowUpdateStatusDialog(true)
                                }}
                            >
                                <X className="mr-2 h-4 w-4 text-warning" />
                                Ngừng bán
                            </DropdownMenuItem>
                        )}

                        {product.status !== 'discontinued' && (
                            <DropdownMenuItem
                                onClick={() => {
                                    setNewStatusParams('discontinued')
                                    setShowUpdateStatusDialog(true)
                                }}
                            >
                                <AlertCircle className="mr-2 h-4 w-4 text-muted-foreground" />
                                Bỏ mẫu
                            </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => setShowDeleteProductDialog(true)}>
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Xóa SP
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
