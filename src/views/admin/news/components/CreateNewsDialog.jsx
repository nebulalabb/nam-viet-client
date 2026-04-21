import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createNews } from '@/stores/NewsSlice'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react'

export default function CreateNewsDialog() {
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.news.categories)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Auto-generate slug from title
    if (field === 'title' && !formData.slug) {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await dispatch(createNews({
        ...formData,
        categoryId: parseInt(formData.categoryId),
      })).unwrap()

      setOpen(false)
      setFormData({
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
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" />
          Tạo bài viết
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo bài viết mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo bài viết mới
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="slug-bai-viet"
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
                placeholder="Mô tả ngắn về bài viết"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content">Nội dung *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                placeholder="Nội dung bài viết"
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
                placeholder="https://example.com/image.jpg"
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
                    placeholder="Tiêu đề SEO"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                    placeholder="Mô tả SEO"
                    rows={2}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={formData.metaKeywords}
                    onChange={(e) => handleChange('metaKeywords', e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo bài viết'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
