import { Button } from '@/components/custom/Button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { createMaterialSchema } from '../schema'
import { createMaterial } from '@/stores/MaterialSlice'
import { getSuppliers } from '@/stores/SupplierSlice'
import { getCategories } from '@/stores/CategorySlice'
import { getUnits } from '@/stores/UnitSlice'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { priorityLabels } from './data'

const CreateMaterialDialog = ({ open, onOpenChange, ...props }) => {
    const form = useForm({
        resolver: zodResolver(createMaterialSchema),
        defaultValues: {
            materialCode: '',
            name: '',
            cost: '',
            supplierId: null,
            categoryId: null,
            unit: '',
            materialType: '',
            priority: 0,
            purchaseDate: '',
            effectiveDate: '',
            imageUrl: '',
        },
    })

    const loading = useSelector((state) => state.material.loading)
    const suppliers = useSelector((state) => state.supplier.suppliers)
    const categories = useSelector((state) => state.category.categories)
    const units = useSelector((state) => state.unit.units)

    const [unitOpen, setUnitOpen] = useState(false)
    const [unitSearch, setUnitSearch] = useState('')

    const dispatch = useDispatch()

    useEffect(() => {
        if (open) {
            dispatch(getSuppliers({ limit: 1000 }))
            dispatch(getCategories({ limit: 1000 }))
            dispatch(getUnits({ limit: 1000 }))
        }
    }, [open, dispatch])

    const onSubmit = async (data) => {
        try {
            await dispatch(createMaterial(data)).unwrap()
            form.reset()
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
            const errorMessage = typeof error === 'string' ? error : error?.message || 'Có lỗi xảy ra khi thêm mới'
            toast.error(errorMessage)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            <DialogContent className="md:h-auto md:max-w-3xl border-green-200">
                <DialogHeader>
                    <DialogTitle className="text-green-800">Thêm nguyên liệu mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin nguyên liệu vào biểu mẫu bên dưới
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh] px-1">
                    <Form {...form}>
                        <form id="create-material" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Row 1: Mã NL + Tên NL */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="materialCode"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel required={true}>Mã nguyên liệu</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Vd: NL-001" className="focus-visible:ring-green-500" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel required={true}>Tên nguyên liệu</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên nguyên liệu" className="focus-visible:ring-green-500" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Row 2: Giá thành + Đơn vị */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="cost"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel required={true}>Giá thành (VNĐ)</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" step="1000" placeholder="Vd: 50000" className="focus-visible:ring-green-500" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1 flex flex-col">
                                            <FormLabel>Đơn vị tính</FormLabel>
                                            <Popover open={unitOpen} onOpenChange={setUnitOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={unitOpen}
                                                            className={cn(
                                                                'w-full justify-between font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                        >
                                                            {field.value || 'Chọn hoặc nhập đơn vị...'}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                    <Command shouldFilter={false}>
                                                        <CommandInput
                                                            placeholder="Tìm hoặc nhập đơn vị..."
                                                            value={unitSearch}
                                                            onValueChange={setUnitSearch}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                {unitSearch ? (
                                                                    <button
                                                                        type="button"
                                                                        className="w-full px-2 py-1.5 text-sm text-left hover:bg-accent rounded-sm cursor-pointer"
                                                                        onClick={() => {
                                                                            field.onChange(unitSearch)
                                                                            setUnitOpen(false)
                                                                        }}
                                                                    >
                                                                        Dùng: <strong>{unitSearch}</strong>
                                                                    </button>
                                                                ) : (
                                                                    'Không tìm thấy đơn vị'
                                                                )}
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {units
                                                                    ?.filter((u) =>
                                                                        u.unitName?.toLowerCase().includes(unitSearch.toLowerCase())
                                                                    )
                                                                    .map((u) => (
                                                                        <CommandItem
                                                                            key={u.id}
                                                                            value={u.unitName}
                                                                            onSelect={() => {
                                                                                field.onChange(u.unitName)
                                                                                setUnitSearch('')
                                                                                setUnitOpen(false)
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    'mr-2 h-4 w-4',
                                                                                    field.value === u.unitName ? 'opacity-100' : 'opacity-0'
                                                                                )}
                                                                            />
                                                                            {u.unitName}
                                                                        </CommandItem>
                                                                    ))}
                                                                {unitSearch &&
                                                                    !units?.some(
                                                                        (u) => u.unitName?.toLowerCase() === unitSearch.toLowerCase()
                                                                    ) && (
                                                                        <CommandItem
                                                                            value={unitSearch}
                                                                            onSelect={() => {
                                                                                field.onChange(unitSearch)
                                                                                setUnitSearch('')
                                                                                setUnitOpen(false)
                                                                            }}
                                                                        >
                                                                            Dùng: <strong className="ml-1">{unitSearch}</strong>
                                                                        </CommandItem>
                                                                    )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Row 3: Danh mục + Loại NL */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Danh mục</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                                                value={field.value ? String(field.value) : 'none'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-green-500">
                                                        <SelectValue placeholder="Chọn danh mục" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Không chọn --</SelectItem>
                                                    {categories?.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.categoryName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="materialType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Loại nguyên liệu</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Vd: Thực phẩm, Hóa chất..." className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Row 4: NCC + Ưu tiên */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Nhà cung cấp</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(value === 'none' ? null : Number(value))}
                                                value={field.value ? String(field.value) : 'none'}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-green-500">
                                                        <SelectValue placeholder="Chọn nhà cung cấp" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">-- Không chọn --</SelectItem>
                                                    {suppliers?.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            {s.supplierName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Độ ưu tiên</FormLabel>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={String(field.value ?? 0)}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="focus:ring-green-500">
                                                        <SelectValue placeholder="Chọn độ ưu tiên" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {priorityLabels.map((p) => (
                                                        <SelectItem key={p.value} value={String(p.value)}>
                                                            {p.value} - {p.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Row 5: Ngày mua + Ngày áp dụng */}
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="purchaseDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Ngày mua vào</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="effectiveDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-1">
                                            <FormLabel>Ngày áp dụng</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Row 6: Hình ảnh */}
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormLabel>URL Hình ảnh</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/image.jpg" className="focus-visible:ring-green-500" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                <DialogFooter className="flex gap-2 sm:space-x-0 pt-4">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" onClick={() => form.reset()}>
                            Hủy
                        </Button>
                    </DialogClose>

                    <Button form="create-material" loading={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        Thêm nguyên liệu
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateMaterialDialog
