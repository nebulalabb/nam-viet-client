import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { Textarea } from '@/components/ui/textarea'
import { useDispatch, useSelector } from 'react-redux'
import { createProductSchema } from '../schema'
import { getTaxes } from '@/stores/TaxSlice'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getUnits } from '@/stores/UnitSlice'
import { getCategories } from '@/stores/CategorySlice'
import MoneyInput from '@/components/custom/MoneyInput'
import { getAttributes } from '@/stores/AttributeSlice'
import { CalendarIcon, TrashIcon, Check, ChevronsUpDown } from 'lucide-react'
import {
  CATEGORY_STATUS,
  matchAttributes,
  PRODUCT_TYPE,
  TAX_STATUS,
} from '../data'
import { getSuppliers } from '@/stores/SupplierSlice'
import { DatePicker } from '@/components/custom/DatePicker'
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
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { createProduct } from '@/stores/ProductSlice'
import { formatDateToYYYYMMDD } from '@/utils/date-format'
import CreateSupplierDialog from '../../supplier/components/CreateSupplierDialog'
import CreateCategoryDialog from '../../category/components/CreateCategoryDialog'
import CreateUnitDialog from '../../unit/components/CreateUnitDialog'
import { Loader2 } from 'lucide-react'

const CreateProductDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  contentClassName,
  overlayClassName,
  ...props
}) => {
  const loading = useSelector((state) => state.product.loading)
  const dispatch = useDispatch()
  const taxes = useSelector((state) => state.tax.taxes)
  const units = useSelector((state) => state.unit.units)
  const attributes = useSelector((state) => state.attribute.attributes)
  const categories = useSelector((state) => state.category.categories)
  const suppliers = useSelector((state) => state.supplier.suppliers)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showCreateSupplierDialog, setShowCreateSupplierDialog] =
    useState(false)
  const [showCreateCategoryDialog, setShowCreateCategoryDialog] =
    useState(false)
  const [showCreateUnitDialog, setShowCreateUnitDialog] = useState(false)

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files?.[0] || null)
  }

  const defaultAttributeWithValue = {
    attributeId: '',
    value: '',
  }

  // NEW: default conversion row
  const defaultUnitConversion = {
    unitId: '',
    conversionFactor: '',
  }

  const form = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      taxIds: [],
      attributeIdsWithValue: [defaultAttributeWithValue],
      // NEW
      unitConversions: [defaultUnitConversion],

      categoryId: '',
      supplierId: '',
      unitId: '',
      price: '',
      basePrice: '',
      name: '',
      description: '',
      note: '',
      minStockLevel: '0',
      salaryCoefficient: {
        coefficient: '',
        type: 'multiplier',
        effectiveDate: new Date(),
      },
      image: new File([], ''),
      hasExpiry: false,
      code: '',
      manageSerial: false,
      warrantyPolicy: {
        periodMonths: '',
        conditions: '',
        warrantyCost: '0',
        status: 'active',
      },
    },
  })

  const selectedProductType = form.watch('type')
  const selectedBaseUnitId = form.watch('unitId')
  const selectedSupplierId = form.watch('supplierId')

  useEffect(() => {
    dispatch(getTaxes())
    dispatch(getUnits())
    dispatch(getCategories())
    dispatch(getAttributes())
    dispatch(getSuppliers())
  }, [dispatch])

  // Attributes field array
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control: form.control,
    name: 'attributeIdsWithValue',
  })

  // NEW: Unit conversions field array
  const {
    fields: conversionFields,
    append: appendConversion,
    remove: removeConversion,
    replace: replaceConversions,
  } = useFieldArray({
    control: form.control,
    name: 'unitConversions',
  })

  // NEW: when base unit changes, remove any conversion rows that match base unit
  useEffect(() => {
    if (!selectedBaseUnitId) return
    const baseIdStr = String(selectedBaseUnitId)

    const current = form.getValues('unitConversions') || []
    const cleaned = current.filter((c) => String(c?.unitId || '') !== baseIdStr)

    // If all rows removed, keep 1 empty row for UX
    if (cleaned.length === 0) cleaned.push({ ...defaultUnitConversion })
    replaceConversions(cleaned)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBaseUnitId])

  const onSubmit = async (data) => {
    try {
      const filteredAttributes = data.attributeIdsWithValue.filter(
        (attribute) => attribute.attributeId !== '' && attribute.value !== '',
      )

      // NEW: filter + normalize unit conversions
      // Meaning: 1 (base unit) = conversionFactor * unitId
      const filteredUnitConversions = (data.unitConversions || [])
        .filter((c) => c?.unitId !== '' && c?.conversionFactor !== '')
        .map((c) => ({
          unitId: c.unitId,
          conversionFactor: Number(
            String(c.conversionFactor).replace(/,/g, ''),
          ),
        }))
        .filter(
          (c) =>
            c.unitId !== data.unitId &&
            Number.isFinite(c.conversionFactor) &&
            c.conversionFactor > 0,
        )

      // NEW: de-dup unitId (keep last)
      const map = new Map()
      for (const c of filteredUnitConversions) map.set(String(c.unitId), c)
      const dedupUnitConversions = Array.from(map.values())

      const dataToSend = {
        code: data.code,
        taxIds: data.taxIds,
        attributeIdsWithValue: filteredAttributes,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        unitId: data.unitId,
        basePrice: data.basePrice || 0,
        price: data.price || 0,
        name: data.name,
        description: data.description,
        note: data.note,
        minStockLevel: data.minStockLevel,
        salaryCoefficient: {
          coefficient: data.salaryCoefficient?.coefficient || 0,
          type: data.salaryCoefficient?.type || 'multiplier',
          effectiveDate: formatDateToYYYYMMDD(
            data.salaryCoefficient?.effectiveDate || new Date(),
          ),
        },
        image: selectedFile,
        hasExpiry: data.hasExpiry,
        manageSerial: data.manageSerial,
        applyWarranty: data.applyWarranty,
        warrantyPolicy: data.applyWarranty
          ? {
            periodMonths: data.warrantyPolicy.periodMonths,
            conditions: data.warrantyPolicy.conditions || null,
            warrantyCost: data.warrantyPolicy.warrantyCost || 0,
            status: data.warrantyPolicy.status || 'active',
          }
          : null,

        // NEW
        unitConversions: dedupUnitConversions,
      }

      await dispatch(createProduct(dataToSend)).unwrap()
      form.reset()
      onOpenChange(false)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const baseUnitName =
    units?.find((u) => String(u.id) === String(selectedBaseUnitId))?.unitName || ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Thêm mới
          </Button>
        </DialogTrigger>
      )}

      <DialogContent
        className={cn("md:h-auto md:max-w-7xl", contentClassName)}
        overlayClassName={overlayClassName}
      >
        <DialogHeader>
          <DialogTitle>Thêm sản phẩm mới</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để thêm sản phẩm mới
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="create-product" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-3 grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={false}>
                        Mã sản phẩm{' '}
                        <span className="text-xs italic text-blue-600">
                          (Tự sinh nếu bỏ trống)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập mã sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MoneyInput
                  form={form}
                  label="Giá gốc (VNĐ)"
                  name="basePrice"
                  required={false}
                  placeholder="Nhập giá vốn (không bắt buộc)"
                />

                <MoneyInput
                  form={form}
                  label="Giá bán (VNĐ)"
                  name="price"
                  required={false}
                  placeholder="Nhập giá sản phẩm (không bắt buộc)"
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <FormLabel required={true}>Danh mục</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowCreateCategoryDialog(true)}
                        >
                          <PlusIcon className="mr-1 h-3 w-3" />
                          Thêm mới
                        </Button>
                      </div>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn loại sản phẩm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[10007]">
                          <SelectGroup>
                            {categories
                              ?.filter(
                                (category) =>
                                  category.status === 'active',
                              )
                              .map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id.toString()}
                                >
                                  {category.categoryName}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unitId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <FormLabel required={true}>Đơn vị tính (gốc)</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowCreateUnitDialog(true)}
                        >
                          <PlusIcon className="mr-1 h-3 w-3" />
                          Thêm mới
                        </Button>
                      </div>

                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn đơn vị tính" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[10007]">
                          <SelectGroup>
                            {units?.map((unit) => (
                              <SelectItem
                                key={unit.id}
                                value={unit.id.toString()}
                              >
                                {unit.unitName}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <FormLabel required={true}>Nhà cung cấp</FormLabel>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => setShowCreateSupplierDialog(true)}
                        >
                          <PlusIcon className="mr-1 h-3 w-3" />
                          Thêm mới
                        </Button>
                      </div>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà cung cấp" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[10007]">
                          <SelectGroup>
                            {suppliers
                              ?.filter(
                                (supplier) => supplier.status !== 'suspend',
                              )
                              .map((supplier) => (
                                <SelectItem
                                  key={supplier.id}
                                  value={supplier.id.toString()}
                                >
                                  {supplier.supplierName}
                                </SelectItem>
                              ))}
                          </SelectGroup>
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
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          rows="1"
                          placeholder="Nhập mô tả"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Ghi chú</FormLabel>
                      <FormControl>
                        <Textarea
                          rows="1"
                          placeholder="Nhập ghi chú nếu có"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <MoneyInput
                  form={form}
                  label="Tồn kho tối thiểu"
                  name="minStockLevel"
                  required={true}
                  placeholder="Nhập mức tồn kho tối thiểu"
                />

                {/* <FormField
                  control={form.control}
                  name="salaryCoefficient.coefficient"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Hệ số tính lương</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập hệ số tính lương" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name="salaryCoefficient.effectiveDate"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Ngày áp dụng</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'dd/MM/yyyy').toString()
                              ) : (
                                <span>Chọn ngày</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto min-w-[fit-content] p-0 z-[10007]"
                          align="start"
                        >
                          <DatePicker
                            initialFocus
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={2018}
                            toYear={2035}
                            selected={field.value}
                            onSelect={field.onChange}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel>Hình ảnh</FormLabel>
                      <FormControl>
                        <Input type="file" onChange={handleFileChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* NEW: Unit conversions block */}
              <div className="mb-3 mt-2 rounded-md border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Đơn vị quy đổi</p>
                    <p className="text-xs italic text-muted-foreground">
                      Quy ước:{' '}
                      <strong>1 {baseUnitName || '(đơn vị gốc)'}</strong> ={' '}
                      <strong>Hệ số quy đổi</strong> × <strong>đơn vị</strong>
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-8"
                    onClick={() =>
                      appendConversion({ ...defaultUnitConversion })
                    }
                    disabled={!selectedBaseUnitId}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Thêm đơn vị quy đổi
                  </Button>
                </div>

                {!selectedBaseUnitId ? (
                  <p className="text-sm italic text-muted-foreground">
                    Vui lòng chọn “Đơn vị tính (gốc)” trước khi thêm đơn vị quy
                    đổi.
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {conversionFields.map((row, index) => (
                      <div
                        key={row.id}
                        className="flex items-end gap-3 rounded-md border p-3"
                      >
                        <FormField
                          control={form.control}
                          name={`unitConversions.${index}.unitId`}
                          render={({ field }) => (
                            <FormItem className="w-1/2 space-y-1">
                              <FormLabel>Đơn vị</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn đơn vị" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="z-[10007]">
                                  <SelectGroup>
                                    {units
                                      ?.filter(
                                        (u) =>
                                          String(u.id) !==
                                          String(selectedBaseUnitId),
                                      )
                                      .map((unit) => (
                                        <SelectItem
                                          key={unit.id}
                                          value={unit.id.toString()}
                                        >
                                          {unit.unitName}
                                        </SelectItem>
                                      ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`unitConversions.${index}.conversionFactor`}
                          render={({ field }) => (
                            <FormItem className="w-1/2 space-y-1">
                              <FormLabel>Hệ số quy đổi</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.000001"
                                  placeholder="Ví dụ: 1000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pb-1">
                          <TrashIcon
                            className="h-4 w-4 cursor-pointer text-destructive"
                            onClick={() => {
                              // keep at least one row for UX
                              if (conversionFields.length <= 1) {
                                form.setValue(`unitConversions.${index}`, {
                                  ...defaultUnitConversion,
                                })
                                return
                              }
                              removeConversion(index)
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attributes only for digital */}
              {selectedProductType === 'digital' && (
                <div className="mb-3 grid gap-4 md:grid-cols-2">
                  {attributeFields.map((fieldItem, index) => (
                    <div key={fieldItem.id} className="flex items-center gap-4">
                      <FormField
                        control={form.control}
                        name={`attributeIdsWithValue.${index}.attributeId`}
                        render={({ field }) => (
                          <FormItem className="mb-2 w-1/2 space-y-1">
                            <FormLabel>Thuộc tính</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn thuộc tính" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[10007]">
                                <SelectGroup>
                                  {attributes.map((attribute) => (
                                    <SelectItem
                                      key={attribute.id}
                                      value={attribute.id.toString()}
                                    >
                                      {`${attribute.name} (${matchAttributes[attribute?.unit]})`}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`attributeIdsWithValue.${index}.value`}
                        render={({ field }) => (
                          <FormItem className="mb-2 h-16 w-1/2 space-y-1">
                            <FormLabel>Giá trị</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập giá trị" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="mt-4 inline-block cursor-pointer">
                        <TrashIcon
                          className="h-4 w-4 text-destructive"
                          onClick={() => removeAttribute(index)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => appendAttribute(defaultAttributeWithValue)}
                      className="w-52"
                    >
                      <PlusIcon className="h-4 w-4 flex-shrink-0" /> Thêm thuộc
                      tính sản phẩm
                    </Button>
                  </div>
                </div>
              )}

              <div className="mb-3 grid gap-4 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="taxIds"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-3">
                        <FormLabel>Các loại thuế áp dụng</FormLabel>
                      </div>
                      {taxes
                        ?.filter((tax) => tax.status === TAX_STATUS.ACTIVE)
                        .map((tax) => (
                          <FormItem
                            key={tax.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(tax.id)}
                                onCheckedChange={(checked) => {
                                  const newValue = checked
                                    ? [...(field.value || []), tax.id]
                                    : field.value?.filter(
                                      (value) => value !== tax.id,
                                    ) || []
                                  field.onChange(newValue)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {tax.title} -{' '}
                              <strong className="text-destructive">
                                ({tax.percentage}%)
                              </strong>
                            </FormLabel>
                          </FormItem>
                        ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-3">
                        <FormLabel>Hạn dùng</FormLabel>
                      </div>

                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Quản lý hạn dùng
                        </FormLabel>
                      </FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="manageSerial"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-3">
                        <FormLabel>Serial</FormLabel>
                      </div>
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Quản lý theo serial
                        </FormLabel>
                      </FormItem>
                      <p className="text-sm italic text-muted-foreground">
                        Bật nếu mỗi đơn vị sản phẩm có số serial riêng (điện
                        thoại, máy móc, ... Serial sẽ được nhập khi nhập kho,
                        không nhập tại đây.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applyWarranty"
                  render={({ field }) => (
                    <FormItem>
                      <div className="mb-3">
                        <FormLabel>Bảo hành</FormLabel>
                      </div>
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked)
                              if (!checked) {
                                form.setValue('warrantyPolicy', {
                                  periodMonths: '',
                                  conditions: '',
                                  warrantyCost: '',
                                  status: 'active',
                                })
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Áp dụng bảo hành
                        </FormLabel>
                      </FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('applyWarranty') && (
                  <div className="mb-3 mt-4 grid gap-4 border-t pt-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="warrantyPolicy.periodMonths"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required>Số tháng bảo hành</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Ví dụ: 12"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <MoneyInput
                      form={form}
                      label="Chi phí bảo hành (tùy chọn)"
                      name="warrantyPolicy.warrantyCost"
                      placeholder="0"
                    />

                    <FormField
                      control={form.control}
                      name="warrantyPolicy.conditions"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1 md:col-span-2">
                          <FormLabel>Điều kiện bảo hành</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={2}
                              placeholder="Mô tả điều kiện bảo hành (không bắt buộc)"
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
                      name="warrantyPolicy.status"
                      render={({ field }) => (
                        <FormItem className="mb-2 space-y-1">
                          <FormLabel required>Trạng thái</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field?.value || 'active'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="z-[10007]">
                              <SelectItem value="active">Hoạt động</SelectItem>
                              <SelectItem value="inactive">Tạm dừng</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              onClick={() => form.reset()}
              type="button"
              variant="outline"
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="create-product" loading={loading}>
            Thêm mới
          </Button>
        </DialogFooter>
      </DialogContent>

      {showCreateSupplierDialog && (
        <CreateSupplierDialog
          open={showCreateSupplierDialog}
          onOpenChange={setShowCreateSupplierDialog}
          showTrigger={false}
          contentClassName="z-[10020]"
          overlayClassName="z-[10019]"
        />
      )}

      {showCreateCategoryDialog && (
        <CreateCategoryDialog
          open={showCreateCategoryDialog}
          onOpenChange={setShowCreateCategoryDialog}
          showTrigger={false}
          contentClassName="z-[10020]"
          overlayClassName="z-[10019]"
        />
      )}

      {showCreateUnitDialog && (
        <CreateUnitDialog
          open={showCreateUnitDialog}
          onOpenChange={setShowCreateUnitDialog}
          showTrigger={false}
          contentClassName="z-[10020]"
          overlayClassName="z-[10019]"
        />
      )}
    </Dialog>
  )
}

export default CreateProductDialog
