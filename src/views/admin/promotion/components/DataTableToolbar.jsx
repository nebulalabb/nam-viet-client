import { Cross2Icon } from '@radix-ui/react-icons'

import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'

import { promotionStatuses, promotionTypes, applicableToOptions } from '../data'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'

import { Trash2 } from 'lucide-react'
import Can from '@/utils/can'
import { useState } from 'react'
// import CustomDatePicker from '@/components/custom/CustomDatePicker'
import CreatePromotionDialog from './CreatePromotionDialog'
import DeleteMultiplePromotionsDialog from './DeleteMultiplePromotionsDialog'

export function DataTableToolbar({ table }) {
    const isFiltered = table.getState().columnFilters.length > 0
    // const role = useAuthRole()

    const [showCreatePromotionDialog, setShowCreatePromotionDialog] = useState(false)
    const [showDeleteMultiplePromotionsDialog, setShowDeleteMultiplePromotionsDialog] = useState(false)

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Tìm mã / tên / loại..."
                    value={table.getColumn('promotionName')?.getFilterValue() || ''}
                    onChange={(event) =>
                        table.getColumn('promotionName')?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                {table.getColumn('status') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('status')}
                        title="Trạng thái"
                        options={promotionStatuses}
                    />
                )}
                {table.getColumn('promotionType') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('promotionType')}
                        title="Loại KM"
                        options={promotionTypes}
                    />
                )}
                {table.getColumn('applicableTo') && (
                    <DataTableFacetedFilter
                        column={table.getColumn('applicableTo')}
                        title="Đối tượng"
                        options={applicableToOptions}
                    />
                )}
                {/* 
                <CustomDatePicker
                    selectedDate={table.getColumn('createdAt')?.getFilterValue()}
                    onChange={(date) => table.getColumn('createdAt')?.setFilterValue(date)}
                    placeholder="Chọn ngày tạo"
                /> 
                */}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Khôi phục
                        <Cross2Icon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                {table.getFilteredSelectedRowModel().rows.length > 0 &&
                    table.getFilteredSelectedRowModel().rows.every(row => row.original.status === 'cancelled') ? (
                    <Can permission="DELETE_PROMOTION">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8"
                            onClick={() => setShowDeleteMultiplePromotionsDialog(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                            Xóa ({table.getFilteredSelectedRowModel().rows.length})
                        </Button>
                    </Can>
                ) : null}

                <DataTableViewOptions table={table} />

                <Can permission="CREATE_PROMOTION">
                    <Button
                        variant="default"
                        size="sm"
                        className="h-8 ml-2"
                        onClick={() => setShowCreatePromotionDialog(true)}
                    >
                        + Thêm Khuyến mãi
                    </Button>
                </Can>

                <CreatePromotionDialog
                    open={showCreatePromotionDialog}
                    onOpenChange={setShowCreatePromotionDialog}
                />

                <DeleteMultiplePromotionsDialog
                    open={showDeleteMultiplePromotionsDialog}
                    onOpenChange={setShowDeleteMultiplePromotionsDialog}
                    selectedRows={table.getFilteredSelectedRowModel().rows}
                    table={table}
                />
            </div>
        </div>
    )
}
