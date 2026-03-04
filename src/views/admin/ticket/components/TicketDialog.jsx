import React, { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/custom/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { getCustomers } from "@/stores/CustomerSlice"
import { getUsers } from "@/stores/UserSlice"
import { createTicket, updateTicket } from "@/stores/TicketSlice"

export const TicketDialog = ({ isOpen, onClose, initialData, onSuccess }) => {
    const dispatch = useDispatch()
    const isSubmitting = useSelector(state => state.ticket.loading)

    // For Select dropdowns
    const customersState = useSelector(state => state.customer.customers)
    const usersState = useSelector(state => state.user.users)

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            status: "open",
            customerId: "",
            assignedToId: "",
        },
    })

    useEffect(() => {
        if (isOpen) {
            // Fetch lookup data if not present (or force refresh if needed, here just basic fetch)
            dispatch(getCustomers({ limit: 100, status: 'active' }))
            dispatch(getUsers({ limit: 100 }))

            if (initialData) {
                setValue("title", initialData.title)
                setValue("description", initialData.description || "")
                setValue("priority", initialData.priority)
                setValue("status", initialData.status)

                if (initialData.customerId) {
                    setValue("customerId", String(initialData.customerId))
                }
                if (initialData.assignedToId) {
                    setValue("assignedToId", String(initialData.assignedToId))
                }
            } else {
                reset({
                    title: "",
                    description: "",
                    priority: "medium",
                    status: "open",
                    customerId: "",
                    assignedToId: "",
                })
            }
        }
    }, [isOpen, initialData, reset, setValue, dispatch])

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            customerId: data.customerId ? Number(data.customerId) : null,
            assignedToId: data.assignedToId ? Number(data.assignedToId) : null,
        }

        try {
            if (initialData) {
                await dispatch(updateTicket({ id: initialData.id, data: payload })).unwrap()
            } else {
                await dispatch(createTicket(payload)).unwrap()
            }
            if (onSuccess) onSuccess()
            onClose()
        } catch (error) {
            console.error("Lỗi lưu phiếu:", error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] overflow-visible">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {initialData ? "Cập nhật phiếu hỗ trợ" : "Tạo phiếu hỗ trợ mới"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        {initialData ? `Mã phiếu: ${initialData.ticketCode || initialData.code}` : "Nhập thông tin chi tiết yêu cầu hỗ trợ"}
                    </p>
                </DialogHeader>

                <form id="ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-semibold">Tiêu đề <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="Ví dụ: Lỗi đăng nhập, Yêu cầu báo giá..."
                            {...register("title", { required: "Vui lòng nhập tiêu đề" })}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Khách hàng <span className="text-red-500">*</span></Label>
                            <Controller
                                name="customerId"
                                control={control}
                                rules={{ required: "Vui lòng chọn khách hàng" }}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between font-normal",
                                                    !field.value && "text-muted-foreground",
                                                    errors.customerId && "border-red-500"
                                                )}
                                            >
                                                {field.value
                                                    ? customersState?.find(
                                                        (c) => String(c.id) === String(field.value)
                                                    )?.customerName
                                                    : "-- Chọn khách hàng --"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm kiếm khách hàng..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy khách hàng.</CommandEmpty>
                                                    <CommandGroup>
                                                        {customersState?.map((c) => (
                                                            <CommandItem
                                                                value={`${c.customerCode || 'KH'} - ${c.customerName} - ${c.phone || ''} - ${c.email || ''}`}
                                                                key={c.id}
                                                                onSelect={() => {
                                                                    field.onChange(String(c.id))
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        String(c.id) === String(field.value) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {c.customerCode || 'KH'} - {c.customerName}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                            {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority" className="font-semibold">Độ ưu tiên</Label>
                            <select
                                id="priority"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                {...register("priority")}
                            >
                                <option value="low">Thấp</option>
                                <option value="medium">Trung bình</option>
                                <option value="high">Cao</option>
                                <option value="urgent">Khẩn cấp</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Người xử lý</Label>
                            <Controller
                                name="assignedToId"
                                control={control}
                                render={({ field }) => (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between font-normal",
                                                    !field.value && "text-muted-foreground",
                                                )}
                                            >
                                                {field.value
                                                    ? usersState?.find(
                                                        (u) => String(u.id) === String(field.value)
                                                    )?.fullName
                                                    : "-- Chưa phân công --"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm kiếm người xử lý..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                                                    <CommandGroup>
                                                        {usersState?.map((u) => (
                                                            <CommandItem
                                                                value={`${u.fullName} - ${u.email || ''} - ${u.phone || ''}`}
                                                                key={u.id}
                                                                onSelect={() => {
                                                                    field.onChange(String(u.id))
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        String(u.id) === String(field.value) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {u.fullName}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            />
                        </div>

                        {initialData && (
                            <div className="space-y-2">
                                <Label htmlFor="status" className="font-semibold">Trạng thái</Label>
                                <select
                                    id="status"
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    {...register("status")}
                                >
                                    <option value="open">Mới (Open)</option>
                                    <option value="in_progress">Đang xử lý (In Progress)</option>
                                    <option value="resolved">Đã giải quyết (Resolved)</option>
                                    <option value="closed">Đóng (Closed)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-semibold">Mô tả chi tiết</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả chi tiết vấn đề khách hàng gặp phải..."
                            rows={4}
                            {...register("description")}
                        />
                    </div>
                </form>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy bỏ
                    </Button>
                    <Button type="submit" form="ticket-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSubmitting ? "Đang lưu..." : (initialData ? "Cập nhật" : "Tạo phiếu")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TicketDialog
