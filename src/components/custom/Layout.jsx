import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Layout = forwardRef(function Layout(
  { className, fadedBelow = false, fixedHeight = false, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-full w-full flex-col',
        fadedBelow &&
        'after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:hidden after:h-32 after:w-full after:bg-[linear-gradient(180deg,_transparent_10%,_hsl(var(--background))_70%)] after:md:block',
        fixedHeight && 'md:h-svh',
        className,
      )}
      {...props}
    />
  )
})
Layout.displayName = 'Layout'

const LayoutHeader = forwardRef(function LayoutHeader(
  { className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-[var(--header-height)] flex-none items-center gap-4 bg-background p-4 md:px-8',
        className,
      )}
      {...props}
    />
  )
})
LayoutHeader.displayName = 'LayoutHeader'

const LayoutBody = forwardRef(function LayoutBody(
  { className, fixedHeight, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'flex-1 overflow-hidden px-4 py-1 md:px-8',
        fixedHeight && 'h-[calc(100%-var(--header-height))]',
        className,
      )}
      {...props}
    />
  )
})
LayoutBody.displayName = 'LayoutBody'

export { Layout, LayoutHeader, LayoutBody }
