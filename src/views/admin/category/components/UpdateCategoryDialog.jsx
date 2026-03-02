import { Button } from '@/components/custom/Button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { updateCategory, getCategoryTree } from '@/stores/CategorySlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updateCategorySchema } from '../schema'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { categoryStatuses } from '../data'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useEffect, useState } from 'react'

const UpdateCategoryDialog = ({
    category,
    open,
    onOpenChange,
    showTrigger = true,
    contentClassName,
    overlayClassName,
    ...props
}) => {
    const loading = useSelector((state) => state.category.loading)
    const categoryTree = useSelector((state) => state.category.categoryTree)

    const form = useForm({
        resolver: zodResolver(updateCategorySchema),
        defaultValues: {
            categoryCode: category.categoryCode || '',
            categoryName: category.categoryName || '',
            slug: category.slug || '',
            parentId: category.parentId || null,
            description: category.description || '',
            status: category.status || 'active',
        },
    })

    const dispatch = useDispatch()

    useEffect(() => {
        if (open && categoryTree.length === 0) {
            dispatch(getCategoryTree())
        }
    }, [dispatch, open, categoryTree.length])

    // Reset form when category changes
    useEffect(() => {
        if (category && open) {
            form.reset({
                categoryCode: category.categoryCode || '',
                categoryName: category.categoryName || '',
                slug: category.slug || '',
                parentId: category.parentId || null,
                description: category.description || '',
                status: category.status || 'active',
            })
        }
    }, [category, open, form])


    const onSubmit = async (data) => {
        try {
            await dispatch(updateCategory({ id: category.id, data })).unwrap()
            form.reset()
            onOpenChange?.(false)
        } catch (error) {
            console.log('Submit error: ', error)
        }
    }

    // Flatten the tree for the select dropdown
    const flattenCategories = (categories, prefix = '') => {
        let result = []
        categories.forEach((cat) => {
            // Don't include self or children as possible parent (prevent circular reference)
            if (cat.id !== category.id) {
                result.push({ id: cat.id, name: `${prefix}${cat.categoryName}` })
                if (cat.children && cat.children.length > 0) {
                    result = result.concat(flattenCategories(cat.children, `${prefix}-- `))
                }
            }
        })
        return result
    }

    const flattenedCategories = flattenCategories(categoryTree || [])

    return (
        <Dialog open={open} onOpenChange={onOpenChange} {...props}>
            {showTrigger && (
                <DialogTrigger asChild>
                    <Button className="mx-2" variant="outline" size="sm">
                        <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                        Cập nhật
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className={contentClassName || "md:max-w-xl"} overlayClassName={overlayClassName}>
                <DialogHeader>
                    <DialogTitle>Cập nhật danh mục</DialogTitle>
                    <DialogDescription>
                        Điền vào chi tiết phía dưới để cập nhật danh mục
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[65vh] overflow-auto md:max-h-[75vh] px-1">
                    <Form {...form}>
                        <form id="update-category" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="categoryCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required={true}>Mã danh mục</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: DIEN-THOAI, LAPTOP" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="categoryName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required={true}>Tên danh mục</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tên danh mục" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required={true}>Đường dẫn (Slug)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: dien-thoai, laptop" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Danh mục cha</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange(value === 'null' ? null : Number(value))}
                                            defaultValue={field.value !== null ? String(field.value) : undefined}
                                            value={field.value !== null ? String(field.value) : 'null'}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="null">-- Không có (Danh mục gốc) --</SelectItem>
                                                {flattenedCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                                        {cat.name}
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
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mô tả</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={3}
                                                placeholder="Nhập mô tả danh mục"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel required={true}>Trạng thái</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                {categoryStatuses.map((status) => (
                                                    <FormItem key={status.value} className="flex items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value={status.value} />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{status.label}</FormLabel>
                                                    </FormItem>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </div>

                <DialogFooter className="flex gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset()
                            }}
                        >
                            Hủy
                        </Button>
                    </DialogClose>

                    <Button form="update-category" loading={loading}>
                        Cập nhật
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default UpdateCategoryDialog
