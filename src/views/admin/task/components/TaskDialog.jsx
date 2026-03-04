import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/custom/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Controller } from "react-hook-form"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { getCustomers } from "@/stores/CustomerSlice"
import { getUsers } from "@/stores/UserSlice"
import { getTickets } from "@/stores/TicketSlice"
import { createTask, updateTask } from "@/stores/TaskSlice"

export const TaskDialog = ({ isOpen, onClose, initialData, onSuccess }) => {
    const dispatch = useDispatch()
    const isSubmitting = useSelector(state => state.task.loading)

    // For Select dropdowns
    const customersState = useSelector(state => state.customer.customers)
    const usersState = useSelector(state => state.user.users)
    const ticketsState = useSelector(state => state.ticket.tickets)

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: "",
            description: "",
            priority: "medium",
            type: "call",
            status: "pending",
            dueDate: "",
            customerId: "",
            assignedToId: "",
            relatedTicketId: ""
        },
    })

    const selectedCustomerId = watch("customerId")

    useEffect(() => {
        if (isOpen) {
            if (selectedCustomerId) {
                dispatch(getTickets({ customerId: Number(selectedCustomerId), limit: 100 }))
            } else {
                dispatch(getTickets({ limit: 100 }))
            }
        }
    }, [isOpen, selectedCustomerId, dispatch])

    useEffect(() => {
        if (isOpen) {
            dispatch(getCustomers({ limit: 100, status: 'active' }))
            dispatch(getUsers({ limit: 100 }))

            if (initialData) {
                setValue("title", initialData.title)
                setValue("description", initialData.description || "")
                setValue("priority", initialData.priority)
                setValue("status", initialData.status)
                setValue("type", initialData.type)

                if (initialData.dueDate) {
                    const date = new Date(initialData.dueDate)
                    const localIsoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
                    setValue("dueDate", localIsoString)
                }

                if (initialData.customerId) {
                    setValue("customerId", String(initialData.customerId))
                }
                if (initialData.assignedToId) {
                    setValue("assignedToId", String(initialData.assignedToId))
                }
                if (initialData.relatedTicketId) {
                    setValue("relatedTicketId", String(initialData.relatedTicketId))
                }
            } else {
                reset({
                    title: "",
                    description: "",
                    priority: "medium",
                    type: "call",
                    status: "pending",
                    dueDate: "",
                    customerId: "",
                    assignedToId: "",
                    relatedTicketId: ""
                })
            }
        }
    }, [isOpen, initialData, reset, setValue, dispatch])

    const onSubmit = async (data) => {
        let formattedDueDate = data.dueDate
        if (data.dueDate) {
            formattedDueDate = new Date(data.dueDate).toISOString()
        }

        const payload = {
            ...data,
            customerId: data.customerId ? Number(data.customerId) : null,
            assignedToId: data.assignedToId ? Number(data.assignedToId) : null,
            relatedTicketId: data.relatedTicketId ? Number(data.relatedTicketId) : null,
            dueDate: formattedDueDate
        }

        try {
            if (initialData) {
                await dispatch(updateTask({ id: initialData.id, data: payload })).unwrap()
            } else {
                await dispatch(createTask(payload)).unwrap()
            }
            if (onSuccess) onSuccess()
            onClose()
        } catch (error) {
            console.error("Lỗi lưu nhiệm vụ:", error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] overflow-visible max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">
                        {initialData ? "Cập nhật nhiệm vụ" : "Tạo nhiệm vụ CSKH mới"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500">
                        {initialData ? "Chỉnh sửa thông tin nhiệm vụ hiện tại" : "Lên lịch chăm sóc khách hàng"}
                    </p>
                </DialogHeader>

                <form id="task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="font-semibold">Tiêu đề nhiệm vụ <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            placeholder="Ví dụ: Gọi điện báo giá..."
                            {...register("title", { required: "Vui lòng nhập tiêu đề" })}
                            className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="font-semibold">Loại nhiệm vụ <span className="text-red-500">*</span></Label>
                            <select
                                id="type"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                {...register("type")}
                            >
                                <option value="call">Gọi điện (Call)</option>
                                <option value="email">Gửi Email</option>
                                <option value="meeting">Gặp mặt (Meeting)</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority" className="font-semibold">Độ ưu tiên</Label>
                            <select
                                id="priority"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                {...register("priority")}
                            >
                                <option value="low">Thấp</option>
                                <option value="medium">Trung bình</option>
                                <option value="high">Cao</option>
                            </select>
                        </div>
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
                                                                    // Close popover handled implicity by losing focus or we can add state, but basic CommandItem works fine
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
                            <Label htmlFor="dueDate" className="font-semibold">Hạn hoàn thành <span className="text-red-500">*</span></Label>
                            <Input
                                id="dueDate"
                                type="datetime-local"
                                {...register("dueDate", { required: "Vui lòng chọn hạn hoàn thành" })}
                                className={errors.dueDate ? "border-red-500" : ""}
                            />
                            {errors.dueDate && <p className="text-xs text-red-500">{errors.dueDate.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Phiếu hỗ trợ (Tùy chọn)</Label>
                            <Controller
                                name="relatedTicketId"
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
                                                    ? ticketsState?.find(
                                                        (t) => String(t.id) === String(field.value)
                                                    )?.title
                                                    : "-- Chọn phiếu hỗ trợ --"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm kiếm phiếu..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy phiếu hỗ trợ nào.</CommandEmpty>
                                                    <CommandGroup>
                                                        {ticketsState?.filter(t => t.status !== 'closed' && t.status !== 'resolved').map((t) => (
                                                            <CommandItem
                                                                value={`${t.ticketCode || t.code} - ${t.title}`}
                                                                key={t.id}
                                                                onSelect={() => {
                                                                    field.onChange(String(t.id))
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        String(t.id) === String(field.value) ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {t.ticketCode || t.code} - {t.title}
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

                        <div className="space-y-2">
                            <Label className="font-semibold">Người thực hiện</Label>
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
                                                    : "-- Tự do / Chưa phân công --"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] md:w-[400px] p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder="Tìm kiếm người thực hiện..." />
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
                    </div>

                    {initialData && (
                        <div className="space-y-2">
                            <Label htmlFor="status" className="font-semibold">Trạng thái</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                {...register("status")}
                            >
                                <option value="pending">Chờ xử lý</option>
                                <option value="in_progress">Đang thực hiện</option>
                                <option value="completed">Hoàn thành</option>
                                <option value="cancelled">Hủy bỏ</option>
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="description" className="font-semibold">Mô tả chi tiết</Label>
                        <Textarea
                            id="description"
                            placeholder="Nội dung công việc..."
                            rows={3}
                            {...register("description")}
                        />
                    </div>
                </form>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy bỏ
                    </Button>
                    <Button type="submit" form="task-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSubmitting ? "Đang lưu..." : (initialData ? "Cập nhật" : "Tạo mới")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default TaskDialog
