import { DataTableRowActions } from './DataTableRowAction'
import { DataTableColumnHeader } from './DataTableColumnHeader'
import { dateFormat } from '@/utils/date-format'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { getPublicUrl } from '@/utils/file'
import { FileText, Eye, ThumbsUp, MessageSquare } from 'lucide-react'
import ViewNewsDialog from './ViewNewsDialog'
import { Badge } from '@/components/ui/badge'

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-orange-100 text-orange-800',
}

const STATUS_LABELS = {
  draft: 'Nháp',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
}

const CONTENT_TYPE_LABELS = {
  article: 'Bài viết',
  video: 'Video',
}

export const getColumns = () => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="mx-2 translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="mx-2 translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tiêu đề" />
    ),
    cell: function Cell({ row }) {
      const [showViewDialog, setShowViewDialog] = useState(false)
      const imageUrl = row.original.featuredImage || row.original.videoThumbnail
      const publicImageUrl = getPublicUrl(imageUrl)

      return (
        <>
          {showViewDialog && (
            <ViewNewsDialog
              open={showViewDialog}
              onOpenChange={setShowViewDialog}
              newsId={row.original.id}
            />
          )}

          <div className="flex items-center gap-3">
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded border bg-muted">
              {publicImageUrl ? (
                <img
                  src={publicImageUrl}
                  alt={row.original.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="h-5 w-5 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div
                className="max-w-[300px] cursor-pointer font-medium text-blue-600 hover:underline line-clamp-2"
                onClick={() => setShowViewDialog(true)}
              >
                {row.getValue('title')}
              </div>
              {row.original.isFeatured && (
                <Badge variant="secondary" className="w-fit text-xs">
                  ⭐ Nổi bật
                </Badge>
              )}
            </div>
          </div>
        </>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'categoryId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Danh mục" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-28">
          {row.original?.category?.categoryName || 'Chưa phân loại'}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'contentType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Loại" />
    ),
    cell: ({ row }) => {
      const type = row.getValue('contentType')
      return (
        <div className="w-20">
          {CONTENT_TYPE_LABELS[type] || type}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status')
      return (
        <Badge className={STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}>
          {STATUS_LABELS[status] || status}
        </Badge>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'author',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tác giả" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-28">
          {row.original?.author?.fullName || 'Không rõ'}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: 'viewCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lượt xem" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 w-20">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('viewCount') || 0}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'likeCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lượt thích" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1 w-20">
          <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('likeCount') || 0}</span>
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày xuất bản" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('publishedAt')
      return (
        <div className="w-28">
          {date ? dateFormat(date) : 'Chưa xuất bản'}
        </div>
      )
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày tạo" />
    ),
    cell: ({ row }) => {
      return <div className="w-28">{dateFormat(row.getValue('createdAt'))}</div>
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
