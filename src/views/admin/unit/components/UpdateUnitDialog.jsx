import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { updateUnit } from '@/stores/UnitSlice'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
    unitCode: z.string().min(1, 'Mã đơn vị tính là bắt buộc'),
    unitName: z.string().min(1, 'Tên đơn vị tính là bắt buộc'),
    description: z.string().optional(),
})

export default function UpdateUnitDialog({ unit, open, onOpenChange }) {
    const [isLoading, setIsLoading] = useState(false)
    const dispatch = useDispatch()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            unitCode: unit?.unitCode || '',
            unitName: unit?.unitName || '',
            description: unit?.description || '',
        },
    })

    useEffect(() => {
        if (unit) {
            form.reset({
                unitCode: unit.unitCode,
                unitName: unit.unitName,
                description: unit.description || '',
            })
        }
    }, [unit, form])

    const onSubmit = async (values) => {
        setIsLoading(true)
        try {
            await dispatch(updateUnit({ id: unit.id, data: values })).unwrap()
            onOpenChange(false)
        } catch (error) {
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cập nhật đơn vị tính</DialogTitle>
                    <DialogDescription>
                        Cập nhật thông tin của đơn vị tính.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="unitCode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mã đơn vị</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="unitName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên đơn vị</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
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
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu thay đổi
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
