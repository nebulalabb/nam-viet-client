import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateNews, getNewsById, clearCurrentNews } from '@/stores/NewsSlice'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditNewsDialog({ open, onOpenChange, newsId }) {
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.news.categories)
  const currentNews = useSelector((state) => state.news.currentNews)
  const loading = useSelector((state) => state.news.loading)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    contentType: 'article',
    featuredImage: '',
    categoryId: '',
    status: 'draft',
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
  })

  useEffect(() => {
    if (open && newsId) {
      dispatch(getNewsById(newsId))
    }
    return () => {
      dispatch(clearCurrentNews())
    }
  }, [open, newsId, dispatch])

  useEffect(() => {
    if (currentNews) {
      setFormData({
        title: currentNews.title || '',
        slug: currentNews.slug || '',
        excerpt: currentNews.excerpt || '',
        content: currentNews.content || '',
        contentType: currentNews.contentType || 'article',
        featuredImage: currentNews.featuredImage || '',
        categoryId: currentNews.categoryId?.toString() || '',
        status: currentNews.status || 'draft',
        isFeatured: currentNews.isFeatured || false,
        metaTitle: currentNews.metaTitle || '',
        metaDescription: currentNews.metaDescription || '',
        metaKeywords: currentNews.metaKeywords || '',
      })
    }
  }, [currentNews])

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await dispatch(updateNews({
        id: newsId,
        data: {
          ...formData,
          categoryId: parseInt(formData.categoryId),
        },
      })).unwrap()

      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin bài viết
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Tiêu đề *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange('slug', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="categoryId">Danh mục *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => handleChange('categoryId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contentType">Loại nội dung</Label>
                  <Select
                    value={formData.contentType}
                    onValueChange={(value) => handleChange('contentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Bài viết</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="excerpt">Mô tả ngắn</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="content">Nội dung *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  rows={8}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="featuredImage">Ảnh đại diện (URL)</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => handleChange('featuredImage', e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => handleChange('isFeatured', checked)}
                />
                <Label htmlFor="isFeatured">Bài viết nổi bật</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* SEO Fields */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium mb-3">Tối ưu SEO</h3>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => handleChange('metaTitle', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <Textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => handleChange('metaDescription', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="metaKeywords">Meta Keywords</Label>
                    <Input
                      id="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={(e) => handleChange('metaKeywords', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
