import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getNewsById, clearCurrentNews } from '@/stores/NewsSlice'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { dateFormat } from '@/utils/date-format'
import { getPublicUrl } from '@/utils/file'
import { Eye, ThumbsUp, MessageSquare, Calendar, User } from 'lucide-react'

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

export default function ViewNewsDialog({ open, onOpenChange, newsId }) {
  const dispatch = useDispatch()
  const currentNews = useSelector((state) => state.news.currentNews)
  const loading = useSelector((state) => state.news.loading)

  useEffect(() => {
    if (open && newsId) {
      dispatch(getNewsById(newsId))
    }
    return () => {
      dispatch(clearCurrentNews())
    }
  }, [open, newsId, dispatch])

  const imageUrl = currentNews?.featuredImage || currentNews?.videoThumbnail
  const publicImageUrl = getPublicUrl(imageUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết bài viết</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : currentNews ? (
          <div className="space-y-6">
            {/* Featured Image */}
            {publicImageUrl && (
              <div className="w-full h-64 rounded-lg overflow-hidden border">
                <img
                  src={publicImageUrl}
                  alt={currentNews.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title and Status */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-2xl font-bold">{currentNews.title}</h2>
                <Badge className={STATUS_COLORS[currentNews.status]}>
                  {STATUS_LABELS[currentNews.status]}
                </Badge>
              </div>
              {currentNews.isFeatured && (
                <Badge variant="secondary">⭐ Bài viết nổi bật</Badge>
              )}
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Lượt xem</div>
                  <div className="font-medium">{currentNews.viewCount || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Lượt thích</div>
                  <div className="font-medium">{currentNews.likeCount || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Bình luận</div>
                  <div className="font-medium">{currentNews.commentCount || 0}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Tác giả</div>
                  <div className="font-medium text-sm">{currentNews.author?.fullName || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Danh mục</h3>
                <p>{currentNews.category?.categoryName || 'Chưa phân loại'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Slug</h3>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{currentNews.slug}</p>
              </div>

              {currentNews.excerpt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Mô tả ngắn</h3>
                  <p className="text-sm">{currentNews.excerpt}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Nội dung</h3>
                <div className="prose prose-sm max-w-none p-4 border rounded-lg bg-muted/30">
                  <div dangerouslySetInnerHTML={{ __html: currentNews.content }} />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Ngày tạo</h3>
                  <p className="text-sm">{dateFormat(currentNews.createdAt)}</p>
                </div>
                {currentNews.publishedAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Ngày xuất bản</h3>
                    <p className="text-sm">{dateFormat(currentNews.publishedAt)}</p>
                  </div>
                )}
              </div>

              {/* SEO Info */}
              {(currentNews.metaTitle || currentNews.metaDescription || currentNews.metaKeywords) && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-3">Thông tin SEO</h3>
                  <div className="space-y-3">
                    {currentNews.metaTitle && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Meta Title</h4>
                        <p className="text-sm">{currentNews.metaTitle}</p>
                      </div>
                    )}
                    {currentNews.metaDescription && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Meta Description</h4>
                        <p className="text-sm">{currentNews.metaDescription}</p>
                      </div>
                    )}
                    {currentNews.metaKeywords && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">Meta Keywords</h4>
                        <p className="text-sm">{currentNews.metaKeywords}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Không tìm thấy bài viết
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
