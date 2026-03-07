import { cn } from '@/lib/utils'
import { Package, Grid3x3, Layers, Tag } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

const CategorySidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  productCounts = {}
}) => {
  const allCategories = [
    {
      id: 'all',
      name: 'Tất cả sản phẩm',
      icon: Grid3x3,
      count: Object.values(productCounts).reduce((sum, count) => sum + count, 0)
    },
    ...categories
  ]

  return (
    <div className="w-56 border-r bg-gradient-to-b from-muted/50 to-muted/30 flex flex-col shadow-sm relative">
      {/* Subtle right edge highlight */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent pointer-events-none" />

      <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Danh mục</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {allCategories.map((category) => {
            const Icon = category.icon || Tag
            const isActive = selectedCategory === category.id
            const count = productCounts[category.id] || category.count || 0

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all mb-1",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left truncate">{category.name}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default CategorySidebar
