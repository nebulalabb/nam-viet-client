import { Cross2Icon, PlusIcon, HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/custom/Button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './DataTableViewOption'
import CreateProductDialog from './CreateProductDialog'
import ImportProductDialog from './ImportProductDialog'
import Can from '@/utils/can'
import { FileSpreadsheet } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getCategories } from '@/stores/CategorySlice'
import { useDispatch, useSelector } from 'react-redux'
import { DataTableFacetedFilter } from './DataTableFacetedFilter'
import { copyProduct, getProducts } from '@/stores/ProductSlice'
import { toast } from 'sonner'
import { IconCopyCheck, IconFileTypeXls } from '@tabler/icons-react'
import ExportProductDialog from './ExportProductDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

import { DeleteMultipleProductsDialog } from './DeleteMultipleProductsDialog'
import { deleteMultipleProducts } from '@/stores/ProductSlice'
import { TrashIcon } from '@radix-ui/react-icons'

const DataTableToolbar = ({ table, type = 'PRODUCT', hideCreateProduct = false }) => {
  const isFiltered = table.getState().columnFilters.length > 0
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const dispatch = useDispatch()
  const categories = useSelector((state) => state.category.categories)
  const loading = useSelector((state) => state.product.loading)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const selectedRows = table.getSelectedRowModel().rows
  const categoryColumn = table.getAllColumns().find((c) => c.id === 'categoryId')
  const productNameColumn = table.getAllColumns().find((c) => c.id === 'productName')

  useEffect(() => {
    dispatch(getCategories({ type }))
  }, [dispatch, type])

  const handleDelete = async () => {
    const selectedIds = selectedRows.map((row) => row.original.id)
    try {
      await dispatch(deleteMultipleProducts(selectedIds)).unwrap()
      table.resetRowSelection()
      setShowDeleteDialog(false)
    } catch (error) {
      console.log(error)
    }
  }

  // Mobile view - Search + Menu
  if (!isDesktop) {
    return (
      <div className="flex w-full items-center justify-between gap-2 p-1">
        <Input
          placeholder="Tìm kiếm..."
          value={productNameColumn?.getFilterValue() || ''}
          onChange={(event) =>
            productNameColumn?.setFilterValue(event.target.value)
          }
          className="h-8 flex-1 text-xs"
        />

        {selectedRows.length > 0 ? (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            className="h-8 px-2"
          >
            <TrashIcon className="size-4" aria-hidden="true" />
            <span className="ml-2 font-bold">{selectedRows.length}</span>
          </Button>
        ) : (
          !hideCreateProduct && (
            <Can
              permission={[
                'CREATE_PRODUCT',
                'GET_SUPPLIER',
                'GET_CATEGORY',
                'GET_UNIT',
              ]}
            >
              <Button
                size="sm"
                onClick={() => setShowCreateProductDialog(true)}
                className="h-8 px-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <PlusIcon className="size-4" aria-hidden="true" />
              </Button>

              {showCreateProductDialog && (
                <CreateProductDialog
                  open={showCreateProductDialog}
                  onOpenChange={setShowCreateProductDialog}
                  showTrigger={false}
                  defaultType={type}
                />
              )}
            </Can>
          )
        )}

        <Can permission="CREATE_PRODUCT">
          {/* Mobile Import Dialog */}
          {showImportDialog && (
            <ImportProductDialog
              open={showImportDialog}
              onOpenChange={setShowImportDialog}
              type={type}
            />
          )}
        </Can>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 px-2">
              <HamburgerMenuIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              {/* Danh mục */}
              {categoryColumn && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium">Danh mục</div>
                  <DataTableFacetedFilter
                    column={categoryColumn}
                    title="Chọn danh mục"
                    options={categories.map((category) => ({
                      value: parseInt(category?.id),
                      label: category?.categoryName,
                    }))}
                  />
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Sao chép sản phẩm */}
              <DropdownMenuItem
                onClick={async () => {
                  const selectedRows = table.getSelectedRowModel().rows
                  if (selectedRows.length !== 1) {
                    toast.warning(`Vui lòng chọn một ${type === 'PRODUCT' ? 'sản phẩm' : 'nguyên liệu'} để sao chép`)
                    return
                  }

                  const productId = selectedRows[0]?.original?.id
                  try {
                    await dispatch(copyProduct(productId)).unwrap()
                    await dispatch(getProducts()).unwrap()
                    toast.success('Sao chép thành công')
                  } catch (error) {
                    toast.error('Lỗi sao chép')
                    console.log(error)
                  }
                }}
                className="text-cyan-600 focus:text-cyan-600 focus:bg-cyan-50"
              >
                <IconCopyCheck className="mr-2 size-4" />
                <span>Sao chép</span>
              </DropdownMenuItem>

              {selectedRows.length > 0 && (
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="mr-2 size-4" />
                  <span>Xóa ({selectedRows.length})</span>
                </DropdownMenuItem>
              )}

              {/* Reset filter */}
              {isFiltered && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => table.resetColumnFilters()}
                  >
                    <Cross2Icon className="mr-2 size-4" />
                    <span>Đặt lại bộ lọc</span>
                  </DropdownMenuItem>
                </>
              )}

              <Can permission="GET_PRODUCT">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowExportDialog(true)}
                  className="text-green-600 focus:text-green-600 focus:bg-green-50"
                >
                  <IconFileTypeXls className="mr-2 size-4" />
                  <span>Xuất Excel</span>
                </DropdownMenuItem>
              </Can>

              <Can permission="CREATE_PRODUCT">
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowImportDialog(true)}
                  className="text-emerald-600 focus:text-emerald-600 focus:bg-emerald-50"
                >
                  <FileSpreadsheet className="mr-2 size-4" />
                  <span>Import Excel</span>
                </DropdownMenuItem>
              </Can>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {showImportDialog && (
          <ImportProductDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
            type={type}
          />
        )}

        {showExportDialog && (
          <ExportProductDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            type={type}
          />
        )}

        <DeleteMultipleProductsDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          count={selectedRows.length}
          type={type}
        />
      </div>
    )
  }

  // Desktop view - Full toolbar
  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto">
      <div className="flex flex-1 items-center space-x-2 min-w-0">
        <Input
          placeholder="Tìm kiếm..."
          value={productNameColumn?.getFilterValue() || ''}
          onChange={(event) =>
            productNameColumn?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        <div className="flex gap-x-2 flex-shrink-0">
          {categoryColumn && (
            <DataTableFacetedFilter
              column={categoryColumn}
              title="Danh mục"
              options={categories.map((category) => ({
                value: parseInt(category?.id),
                label: category?.categoryName,
              }))}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-1 sm:px-2 lg:px-3 text-xs sm:text-sm"
          >
            Đặt lại
            <Cross2Icon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {selectedRows.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          className="h-8"
          onClick={() => setShowDeleteDialog(true)}
        >
          <TrashIcon className="mr-2 size-4" aria-hidden="true" />
          Xóa ({selectedRows.length})
        </Button>
      )}

      {/* Sao chép sản phẩm */}
      <Button
        className="mx-0 sm:mx-2 text-cyan-600 border-cyan-600 hover:bg-cyan-50 hover:text-cyan-700"
        variant="outline"
        size="sm"
        onClick={async () => {
          const selectedRows = table.getSelectedRowModel().rows
          if (selectedRows.length !== 1) {
            toast.warning(`Vui lòng chọn một ${type === 'PRODUCT' ? 'sản phẩm' : 'nguyên liệu'} để sao chép`)
            return
          }

          const productId = selectedRows[0]?.original?.id
          try {
            await dispatch(copyProduct(productId)).unwrap()
            await dispatch(getProducts()).unwrap()
            return true
          } catch (error) {
            console.log(error)
          }
        }}
        loading={loading}
      >
        <IconCopyCheck className="mr-2 size-4" aria-hidden="true" />
        Sao chép
      </Button>

      {!hideCreateProduct && (
        <Can
          permission={[
            'CREATE_PRODUCT',
            'GET_SUPPLIER',
            'GET_CATEGORY',
            'GET_UNIT',
          ]}
        >
          <Button
            className="mx-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
            onClick={() => setShowCreateProductDialog(true)}
          >
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>

          {showCreateProductDialog && (
            <CreateProductDialog
              open={showCreateProductDialog}
              onOpenChange={setShowCreateProductDialog}
              showTrigger={false}
              type={type}
              defaultType={type}
            />
          )}
        </Can>
      )}

      <Can permission="GET_PRODUCT">
        <Button
          onClick={() => setShowExportDialog(true)}
          className="mx-0 mr-2 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
          variant="outline"
          size="sm"
        >
          <IconFileTypeXls className="mr-2 size-4" aria-hidden="true" />
          Xuất Excel
        </Button>

        {showExportDialog && (
          <ExportProductDialog
            open={showExportDialog}
            onOpenChange={setShowExportDialog}
            showTrigger={false}
            type={type}
          />
        )}
      </Can>

      <Can permission="CREATE_PRODUCT">
        <Button
          onClick={() => setShowImportDialog(true)}
          className="mx-2 text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          variant="outline"
          size="sm"
        >
          <FileSpreadsheet className="mr-2 size-4" aria-hidden="true" />
          Import Excel
        </Button>

        {/* Desktop Import Dialog */}
        {showImportDialog && (
          <ImportProductDialog
            open={showImportDialog}
            onOpenChange={setShowImportDialog}
            type={type}
          />
        )}
      </Can>

      <DeleteMultipleProductsDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        count={selectedRows.length}
        type={type}
      />

      <DataTableViewOptions table={table} type={type} />
    </div>
  )
}

export default DataTableToolbar
