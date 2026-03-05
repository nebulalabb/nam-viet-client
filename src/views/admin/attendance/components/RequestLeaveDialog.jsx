import React from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/custom/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { requestLeave } from "@/stores/AttendanceSlice"

export default function RequestLeaveDialog({ isOpen, onClose }) {
    const dispatch = useDispatch()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            leaveType: "annual",
            shift: "all_day",
            date: new Date().toISOString().split("T")[0],
            reason: "",
        },
    })

    const onSubmit = async (data) => {
        try {
            await dispatch(requestLeave(data)).unwrap()
            reset()
            onClose()
        } catch (error) {
            console.error(error)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-xl">Tạo đơn nghỉ phép</DialogTitle>
                    <p className="text-sm text-gray-500">Gửi yêu cầu xin nghỉ phép tới quản lý</p>
                </DialogHeader>

                <form id="leave-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Ngày nghỉ <span className="text-red-500">*</span></Label>
                        <Input
                            id="date"
                            type="date"
                            {...register("date", { required: "Vui lòng chọn ngày nghỉ" })}
                            className={errors.date ? "border-red-500" : ""}
                        />
                        {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="leaveType">Loại nghỉ</Label>
                            <select
                                id="leaveType"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                {...register("leaveType")}
                            >
                                <option value="annual">Nghỉ phép năm</option>
                                <option value="sick">Nghỉ ốm</option>
                                <option value="unpaid">Nghỉ không lương</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shift">Ca nghỉ</Label>
                            <select
                                id="shift"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                {...register("shift")}
                            >
                                <option value="all_day">Cả ngày</option>
                                <option value="morning">Buổi sáng</option>
                                <option value="afternoon">Buổi chiều</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason">Lý do <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="reason"
                            placeholder="Nhập lý do nghỉ chi tiết..."
                            rows={3}
                            {...register("reason", { required: "Vui lòng nhập lý do" })}
                            className={errors.reason ? "border-red-500" : ""}
                        />
                        {errors.reason && <p className="text-xs text-red-500">{errors.reason.message}</p>}
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button type="submit" form="leave-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
