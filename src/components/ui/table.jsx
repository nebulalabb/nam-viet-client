import * as React from 'react'

import { cn } from '@/lib/utils'

const Table = React.forwardRef(({ className, wrapperClassName, ...props }, ref) => (
  <div className={cn(
    "relative w-full h-full overflow-auto",
    "[&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/80 [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400/80 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-700",
    wrapperClassName
  )}>
    <table
      ref={ref}
      className={cn('w-full caption-bottom text-sm', className)}
      {...props}
    />
  </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('[&_tr]:border-b-2 !border-slate-200/70 dark:!border-slate-800 !bg-slate-50/70 dark:!bg-slate-800/40 backdrop-blur-sm', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'border-b border-slate-100/80 dark:border-slate-800 transition-all duration-200 hover:bg-blue-50/50 hover:shadow-[inset_4px_0_0_0_rgba(59,130,246,0.5)] dark:hover:bg-slate-800/50 hover:-translate-y-[0.5px] hover:z-10 relative data-[state=selected]:bg-indigo-50/80 dark:data-[state=selected]:bg-indigo-900/30 data-[state=selected]:shadow-[inset_4px_0_0_0_rgba(99,102,241,1)]',
      className,
    )}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'h-12 px-4 text-left align-middle font-bold uppercase tracking-widest text-[11px] text-slate-500/90 dark:text-slate-400 [&:has([role=checkbox])]:pr-0',
      className,
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'p-4 align-middle text-[13px] font-medium text-slate-700 dark:text-slate-300 [&:has([role=checkbox])]:pr-0 group-hover:text-slate-900 transition-colors',
      className,
    )}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-muted-foreground', className)}
    {...props}
  />
))
TableCaption.displayName = 'TableCaption'

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
