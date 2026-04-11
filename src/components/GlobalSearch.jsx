import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import { sideLinks } from '@/data/SideLink'
import { PlusCircle, Search, FileText, Settings, UserPlus, PackagePlus } from 'lucide-react'

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const down = (e) => {
            // Bắt sự kiện Ctrl+K hoặc Cmd+K để mở Command Palette
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const runCommand = (command) => {
        setOpen(false)
        command()
    }

    // Tái cấu trúc lại sideLinks thành một mảng phẳng (phân tách theo group)
    const mapLinksToGroups = () => {
        return sideLinks.map((linkGroup, idx) => {
            if (linkGroup.sub) {
                return (
                    <CommandGroup key={idx} heading={linkGroup.title}>
                        {linkGroup.sub.map((subLink, subIdx) => (
                            <CommandItem
                                key={`${idx}-${subIdx}`}
                                onSelect={() => runCommand(() => navigate(subLink.href))}
                                className="flex items-center gap-2 cursor-pointer py-2 text-sm text-foreground"
                            >
                                {subLink.icon ? <span className="w-4 h-4 text-muted-foreground mr-2">{subLink.icon}</span> : <Search className="w-4 h-4 text-muted-foreground mr-2" />}
                                <span>{linkGroup.title} &rarr; <span className="font-medium text-primary ml-1">{subLink.title}</span></span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )
            } else if (linkGroup.href) {
                // Root links without sub
                return (
                    <CommandGroup key={idx} heading={linkGroup.title}>
                        <CommandItem
                            onSelect={() => runCommand(() => navigate(linkGroup.href))}
                            className="flex items-center gap-2 cursor-pointer py-2 text-sm text-foreground"
                        >
                            {linkGroup.icon && <span className="w-4 h-4 text-muted-foreground mr-2">{linkGroup.icon}</span>}
                            <span>Di chuyển tới <span className="font-medium text-primary ml-1">{linkGroup.title}</span></span>
                        </CommandItem>
                    </CommandGroup>
                )
            }
            return null
        })
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center justify-between gap-4 px-3 py-2 text-sm text-emerald-50 bg-white/10 border border-emerald-400/20 rounded-lg hover:bg-white/20 transition-colors w-64 shadow-sm"
            >
                <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Tìm kiếm tính năng...
                </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-emerald-400/30 bg-white/10 px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Gõ từ khóa tìm kiếm trang, báo cáo hoặc hành động nhanh..." />
                <CommandList className="max-h-[60vh]">
                    <CommandEmpty>Không tìm thấy mục nào phù hợp với từ khóa.</CommandEmpty>

                    <CommandGroup heading="Hành động nhanh (Quick Actions)">
                        <CommandItem onSelect={() => runCommand(() => navigate('/invoice'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <PlusCircle className="w-4 h-4 text-emerald-500 mr-2" />
                            <span>Xem tất cả <span className="font-medium text-primary">Đơn bán</span></span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/product'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <PackagePlus className="w-4 h-4 text-blue-500 mr-2" />
                            <span>Đến trang <span className="font-medium text-primary">Sản phẩm</span></span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/customer'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <UserPlus className="w-4 h-4 text-orange-500 mr-2" />
                            <span>Đến trang <span className="font-medium text-primary">Khách hàng</span></span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/inventory-warning'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <PackagePlus className="w-4 h-4 text-red-500 mr-2" />
                            <span>Xem <span className="font-medium text-primary">Cảnh báo tồn kho</span></span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/customer-debt'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <UserPlus className="w-4 h-4 text-red-700 mr-2" />
                            <span>Quản lý <span className="font-medium text-primary">Công nợ khách hàng</span></span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Báo cáo phân tích">
                        <CommandItem onSelect={() => runCommand(() => navigate('/revenue'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <FileText className="w-4 h-4 text-muted-foreground mr-2" />
                            Đi tới Báo cáo Doanh thu
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/inventory-report'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <FileText className="w-4 h-4 text-muted-foreground mr-2" />
                            Đi tới Báo cáo Tồn kho
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/sales-report'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <FileText className="w-4 h-4 text-muted-foreground mr-2" />
                            Đi tới Báo cáo Bán hàng
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/production-report'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <FileText className="w-4 h-4 text-muted-foreground mr-2" />
                            Đi tới Báo cáo Sản xuất
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => navigate('/financial-report'))} className="flex items-center gap-2 cursor-pointer py-2">
                            <FileText className="w-4 h-4 text-muted-foreground mr-2" />
                            Đi tới Báo cáo Tài chính
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    {mapLinksToGroups()}
                </CommandList>
            </CommandDialog>
        </>
    )
}
