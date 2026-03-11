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

  const renderCategoryNode = (category, level = 0) => {
    const Icon = category.icon || Tag
    const isActive = selectedCategory === category.id
    // If it's the "all" category, count is already calculated. Otherwise, use `productCounts` or fallback
    const count = category.id === 'all' ? category.count : (productCounts[category.id] || 0)

    // Check if the current category has children
    const hasChildren = category.children && category.children.length > 0

    return (
      <div key={category.id}>
        <button
          type="button"
          onClick={() => onCategoryChange(category.id)}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all mb-1",
            "hover:bg-accent hover:text-accent-foreground",
            isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
            level > 0 && "pl-" + (level * 4 + 3) // Add indentation based on level
          )}
          style={{ paddingLeft: level > 0 ? `${level * 1.5 + 0.75}rem` : undefined }}
        >
          <Icon className={cn("h-4 w-4 shrink-0", level > 0 && "opacity-70 h-3.5 w-3.5")} />
          <span className="flex-1 text-left truncate">{category.categoryName || category.name}</span>
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

        {/* Recursively render children if they exist */}
        {hasChildren && (
          <div className="ml-1 border-l border-border/50 pl-1 mt-1 mb-2">
            {category.children.map(child => renderCategoryNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-56 border-r bg-gradient-to-b from-muted/50 to-muted/30 flex flex-col shadow-sm relative">
      {/* Subtle right edge highlight */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent pointer-events-none" />

      <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Danh mục</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {allCategories.map((category) => renderCategoryNode(category, 0))}
        </div>
      </ScrollArea>
    </div>
  )
}

export default CategorySidebar
