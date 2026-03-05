import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/custom/Button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { createOvertimeSession } from "@/stores/OvertimeSlice"

export default function CreateSessionDialog({ onSuccess }) {
    const dispatch = useDispatch()
    const [isOpen, setIsOpen] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            sessionName: "",
            startTime: "",
            notes: "",
        },
    })

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                startTime: new Date(data.startTime).toISOString(),
            }
            await dispatch(createOvertimeSession(payload)).unwrap()
            reset()
            setIsOpen(false)
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
        }
    }

    const handleClose = () => {
        reset()
        setIsOpen(false)
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Mở phiên tăng ca
            </Button>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Mở phiên tăng ca mới</DialogTitle>
                        <p className="text-sm text-gray-500">Tạo phiên tăng ca để bắt đầu tính giờ làm thêm cho nhân viên.</p>
                    </DialogHeader>

                    <form id="create-session-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sessionName">Tên phiên <span className="text-red-500">*</span></Label>
                            <Input
                                id="sessionName"
                                placeholder="VD: Tăng ca tối 24/10"
                                {...register("sessionName", { required: "Vui lòng nhập tên phiên" })}
                                className={errors.sessionName ? "border-red-500" : ""}
                            />
                            {errors.sessionName && <p className="text-xs text-red-500">{errors.sessionName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="startTime">Thời gian bắt đầu <span className="text-red-500">*</span></Label>
                            <Input
                                id="startTime"
                                type="datetime-local"
                                {...register("startTime", { required: "Vui lòng chọn thời gian bắt đầu" })}
                                className={errors.startTime ? "border-red-500" : ""}
                            />
                            {errors.startTime && <p className="text-xs text-red-500">{errors.startTime.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Textarea
                                id="notes"
                                placeholder="Ghi chú thêm..."
                                rows={3}
                                {...register("notes")}
                            />
                        </div>
                    </form>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Hủy
                        </Button>
                        <Button type="submit" form="create-session-form" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSubmitting ? "Đang tạo..." : "Tạo phiên"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
