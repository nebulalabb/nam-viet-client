import { MoreHorizontal, Pencil, Trash, Eye, FileCheck, Archive } from 'lucide-react'
import { Button } from '@/components/custom/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { deleteNews, publishNews, archiveNews } from '@/stores/NewsSlice'
import { toast } from 'sonner'
import EditNewsDialog from './EditNewsDialog'
import ViewNewsDialog from './ViewNewsDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function DataTableRowActions({ row }) {
  const dispatch = useDispatch()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const news = row.original

  const handleDelete = async () => {
    try {
      await dispatch(deleteNews(news.id)).unwrap()
      setShowDeleteDialog(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handlePublish = async () => {
    try {
      await dispatch(publishNews(news.id)).unwrap()
    } catch (error) {
      console.error(error)
    }
  }

  const handleArchive = async () => {
    try {
      await dispatch(archiveNews(news.id)).unwrap()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
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
          <DropdownMenuItem onClick={() => setShowViewDialog(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {news.status === 'draft' && (
            <DropdownMenuItem onClick={handlePublish}>
              <FileCheck className="mr-2 h-4 w-4" />
              Xuất bản
            </DropdownMenuItem>
          )}
          {news.status === 'published' && (
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Lưu trữ
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showEditDialog && (
        <EditNewsDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          newsId={news.id}
        />
      )}

      {showViewDialog && (
        <ViewNewsDialog
          open={showViewDialog}
          onOpenChange={setShowViewDialog}
          newsId={news.id}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bài viết "{news.title}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
