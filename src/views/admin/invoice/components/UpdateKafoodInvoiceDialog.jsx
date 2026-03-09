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
import { CaretSortIcon, MobileIcon, PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckIcon, Clock, Mail, MapPin, Pencil, Plus, X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { useEffect, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import UpdateCustomerDialog from '../../customer/components/UpdateCustomerDialog'
import CreateCustomerDialog from '../../customer/components/CreateCustomerDialog'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import MultipleSelector from '@/components/custom/MultiSelector'
import { attributes } from '../data'
import { updateInvoiceSchema } from '../schema'
import { getSetting } from '@/stores/SettingSlice'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  IconCircleX,
  IconDatabasePlus,
  IconFileTypePdf,
  IconReceipt2,
  IconUserShare,
} from '@tabler/icons-react'
import { Separator } from '@/components/ui/separator'
import { getMyInvoices } from '@/stores/InvoiceSlice'
import { toast } from 'sonner'
import CreateSchoolDialog from '../../school/components/CreateSchoolDialog'
import { Checkbox } from '@/components/ui/checkbox'
import { paymentMethods } from '../../receipt/data'
import { dateFormat } from '@/utils/date-format'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'
import PrintInvoiceView from './PrintInvoiceView'
import api from '@/utils/axios'

const UpdateKafoodInvoiceDialog = ({
  type,
  open,
  onOpenChange,
  showTrigger = true,
  invoiceUpdateId,
  ...props
}) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  const customers = useSelector((state) => state.customer.customers)
  const loading = useSelector((state) => state.invoice.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}
  const schools = useSelector((state) => state.school.schools)

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedSchool, setSelectedSchool] = useState(null)

  const [localInvoiceData, setLocalInvoiceData] = useState(null)

  const handleGetInvoiceDetail = async () => {
    try {
      const response = await api.get(`/invoice/${invoiceUpdateId}/admin`)
      const { data: responseData } = response.data
      setLocalInvoiceData(responseData)
    } catch (error) {
      console.log('Get invoice details error:', error)
    }
  }

  useEffect(() => {
    handleGetInvoiceDetail()
    dispatch(getProducts())
    dispatch(getSetting('sharing_ratio'))
  }, [dispatch])

  const form = useForm({
    resolver: zodResolver(updateInvoiceSchema),
    defaultValues: {
      schoolId: '',
      customerId: '',
      status: 'pending',
      note: '',
      revenueSharing: null,
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
    },
  })

  const [hasPrintInvoice, setHasPrintInvoice] = useState(false)
  const [generalInformation, setGeneralInformation] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [sharingRatios, setSharingRatios] = useState(null)

  const handleGetSetting = async () => {
    const sharingRatiosData = await dispatch(
      getSetting('sharing_ratio'),
    ).unwrap()

    const generalInformationData = await dispatch(
      getSetting('general_information'),
    ).unwrap()

    setSharingRatios(sharingRatiosData)
    setGeneralInformation(generalInformationData)
  }

  useEffect(() => {
    handleGetSetting()
  }, [])

  const onSubmit = async (data) => {
    const items = selectedProducts.map((product) => ({
      productId: product.id,
      image: product.image,
      productName: product.name,
      productType: product.type,
      unitId: product.prices[0].unitId,
      unitName: product.prices[0].unitName,
      quantity: quantities[product.id] || 1,
      giveaway: giveaway[product.id] || 0,
      price: product.price,
      taxAmount: calculateTaxForProduct(product.id),
      subTotal: calculateSubTotal(product.id),
      discount: discounts[product.id] || 0,
      total: calculateSubTotal(product.id) + calculateTaxForProduct(product),
      note: notes[product.id] || '',
      warranty: warranties[product.id] || '',
      options: product.attributes ? product.attributes : [],
    }))

    const dataToSend = {
      userId: authUserWithRoleHasPermissions.id,
      customerId: data.customerId,
      date: new Date().toISOString(),
      note: data.note,
      type,
      taxAmount: calculateTotalTax(),
      amount: calculateTotalAmount(),
      discount: calculateTotalDiscount(),
      subTotal: handleCalculateSubTotalInvoice(),
      status: data.status,
      items,
      schoolId: data.schoolId,
      createReceipt: isCreateReceipt,
      paymentMethod: data.paymentMethod,
      paymentNote: data.paymentNote,
      totalAmount: calculateTotalAmount(),
    }

    if (data.revenueSharing) {
      const { ratio, userId } = data.revenueSharing
      if (!ratio || !userId) {
        toast.error('Vui lòng chọn mức chia sẻ và người chia sẻ')
        return
      }
      dataToSend.revenueSharing = {
        sharePercentage: parseFloat(ratio) || 0,
        userId: parseInt(userId, 10) || null,
        amount:
          (calculateInvoiceTotal() -
            calculateTotalTax() -
            calculateTotalDiscount()) *
            ratio || 0,
      }
    }

    try {
      await api.put(`/invoice/${invoiceUpdateId}/update-pending`, dataToSend)
      toast.success('Cập nhật hóa đơn thành công')
      if (hasPrintInvoice) {
        const getAdminInvoice = JSON.parse(
          localStorage.getItem('permissionCodes'),
        ).includes('GET_INVOICE')
        const invoiceId = invoiceUpdateId
        const invoiceData = getAdminInvoice
          ? await getInvoiceDetail(invoiceId)
          : await getInvoiceDetailByUser(invoiceId)

        setInvoice(invoiceData)
        setTimeout(() => {
          setInvoice(null)
          form.reset()
          onOpenChange?.(false)
          dispatch(getMyInvoices({})).unwrap()
        }, 1000)
      } else {
        form.reset()
        onOpenChange?.(false)
        dispatch(getMyInvoices({})).unwrap()
      }
    } catch (error) {
      toast.error(error.response.data.message)
      console.log('Submit error:', error)
    }
  }

  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] =
    useState(false)
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)

  const [showCreateSchoolDialog, setShowCreateSchoolDialog] = useState(false)

  const [selectedProducts, setSelectedProducts] = useState([])
  const handleSelectProduct = (value) => {
    const productIds = value.map((product) => product.value)
    const selectProductDetails = products.filter((product) =>
      productIds.includes(product.id),
    )
    setSelectedProducts(selectProductDetails)
  }

  const [discounts, setDiscounts] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [warranties, setWarranties] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number(value),
    }))
  }

  const handleNoteChange = (productId, value) => {
    setNotes((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const handleWarrantyChange = (productId, value) => {
    setWarranties((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const handleGiveawayChange = (productId, value) => {
    setGiveaway((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const calculateSubTotal = (productId) => {
    const quantity = quantities[productId] || 1
    const product = selectedProducts.find((prod) => prod.id === productId)
    const discount = discounts[productId] || 0
    const subtotal = quantity * product.price
    return subtotal - discount > 0 ? subtotal - discount : 0
  }

  const handleDiscountChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setDiscounts((prev) => ({
      ...prev,
      [productId]: numericValue,
    }))
  }

  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setSelectedProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, price: numericValue }
          : product,
      ),
    )
  }

  const [selectedTaxes, setSelectedTaxes] = useState({})
  const handleTaxChange = (productId, taxId, isChecked) => {
    setSelectedTaxes((prev) => {
      const productTaxes = prev[productId] || []
      return {
        ...prev,
        [productId]: isChecked
          ? [...productTaxes, taxId]
          : productTaxes.filter((id) => id !== taxId),
      }
    })
  }

  const calculateInvoiceTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = quantities[product.id] || 1
      const discount = discounts[product.id] || 0
      const subtotal = quantity * product.price
      const totalForProduct = subtotal - discount > 0 ? subtotal - discount : 0

      return total + totalForProduct
    }, 0)
  }

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((totalDiscount, product) => {
      return totalDiscount + (discounts[product.id] || 0)
    }, 0)
  }

  const calculateTotalTax = () => {
    return selectedProducts.reduce((totalTax, product) => {
      return totalTax + calculateTaxForProduct(product.id)
    }, 0)
  }

  const calculateTaxForProduct = (productId) => {
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0

    const quantity = quantities[productId] || 1
    const basePrice = product.price * quantity
    const selectedProductTaxes = selectedTaxes[productId] || []

    const taxAmount = product.prices[0].taxes
      .filter((tax) => selectedProductTaxes.includes(tax.id))
      .reduce((sum, tax) => sum + (basePrice * tax.percentage) / 100, 0)

    return taxAmount
  }

  const handleCalculateSubTotalInvoice = () => {
    return selectedProducts.reduce((subTotal, product) => {
      const basePrice = product?.price || 0
      const quantity = quantities[product.id] || 1
      const total = basePrice * quantity
      return subTotal + total
    }, 0)
  }
  const users = useSelector((state) => state.user.users)

  const [isSharing, setIsSharing] = useState(false)
  const [isCreateReceipt, setIsCreateReceipt] = useState(false)
  const handleCreateReceipt = () => {
    setIsCreateReceipt((prev) => !prev)
  }
  const [totalAmount, setTotalAmount] = useState('')

  const calculateTotalAmount = () => {
    const total = calculateInvoiceTotal() + calculateTotalTax()
    return total
  }

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setTotalAmount(rawValue)
    form.setValue('totalAmount', rawValue)
  }

  useEffect(() => {
    if (!localInvoiceData || !open) return

    const currentValues = form.getValues()
    const newValues = {
      schoolId: localInvoiceData?.invoiceItems[0]?.schoolId?.toString() || '',
      customerId: localInvoiceData?.customerId?.toString() || '',
      // status: localInvoiceData?.status || 'pending',
      note: localInvoiceData?.note || '',
      revenueSharing: localInvoiceData?.revenueSharing || null,
      paymentMethod: localInvoiceData?.paymentMethod || paymentMethods[0].value,
      paymentNote: localInvoiceData?.paymentNote || '',
    }

    // Chỉ reset nếu dữ liệu thay đổi
    if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
      form.reset(newValues)
    }

    const customer = customers.find((c) => c.id === localInvoiceData.customerId)
    if (customer) setSelectedCustomer(customer)

    const school = schools.find(
      (sc) => sc.id === localInvoiceData.invoiceItems[0].schoolId,
    )

    if (school) setSelectedSchool(school)

    const productsToSelect = localInvoiceData.invoiceItems.map((item) => ({
      ...item.product,
      price: item.price,
    }))
    setSelectedProducts(productsToSelect)

    // Initialize tax selections
    const taxSelections = {}
    if (Array.isArray(localInvoiceData?.invoiceItems)) {
      localInvoiceData.invoiceItems.forEach((item) => {
        if (
          item.taxAmount > 0 &&
          Array.isArray(item?.product?.prices?.[0]?.taxes)
        ) {
          const taxIds = item.product.prices[0].taxes.map((tax) => {
            // Kiểm tra item.taxAmount với item.price là bao nhiêu %
            if (
              Number((item.taxAmount * 100) / item.price) ===
              Number(tax.percentage)
            )
              return tax.id
          }) // Lấy danh sách thuế

          taxSelections[item.productId] = [
            ...new Set([...(taxSelections[item.productId] || []), ...taxIds]),
          ] // Loại bỏ trùng lặp
        } else {
          taxSelections[item.productId] = [] // Đảm bảo giá trị là mảng
        }
      })
    }

    setSelectedTaxes(taxSelections)

    const quantitiesObj = {}
    const giveawaysObj = {}
    const discountsObj = {}
    const notesObj = {}
    const warrantiesObj = {}

    localInvoiceData.invoiceItems.forEach((item) => {
      quantitiesObj[item.productId] = item.quantity
      giveawaysObj[item.productId] = item.giveaway
      discountsObj[item.productId] = item.discount
      notesObj[item.productId] = item.note
      warrantiesObj[item.productId] = item.warranty
    })

    setQuantities(quantitiesObj)
    setGiveaway(giveawaysObj)
    setDiscounts(discountsObj)
    setNotes(notesObj)
    setWarranties(warrantiesObj)
  }, [localInvoiceData])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Lưu
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-full">
          <DialogHeader>
            <DialogTitle>Cập nhật hóa đơn {localInvoiceData?.code}</DialogTitle>
            <DialogDescription>
              Hoàn thành các thông tin dưới đây để có thể cập nhật hóa đơn
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[75vh] overflow-auto">
            <Form {...form}>
              <form id="create-invoice" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6 lg:flex-row">
                  <div className="flex-1 space-y-6 rounded-lg border p-4">
                    <h2 className="text-lg font-semibold">Thông tin đơn</h2>
                    <div className="space-y-6">
                      {selectedProducts.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border">
                          <Table className="min-w-full">
                            <TableHeader>
                              <TableRow className="bg-secondary text-xs">
                                <TableHead className="w-8">TT</TableHead>
                                <TableHead className="min-w-40">
                                  Sản phẩm
                                </TableHead>
                                <TableHead className="min-w-16">SL</TableHead>
                                <TableHead className="min-w-16">Tặng</TableHead>
                                <TableHead className="min-w-16">ĐVT</TableHead>
                                <TableHead className="min-w-20">Giá</TableHead>
                                <TableHead className="min-w-20">Thuế</TableHead>
                                <TableHead className="min-w-28 md:w-16">
                                  Giảm giá
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Tổng cộng
                                </TableHead>
                                <TableHead className="min-w-28 md:w-20">
                                  BH
                                </TableHead>
                                <TableHead className="min-w-28">
                                  Ghi chú
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedProducts.map((product, index) => (
                                <TableRow key={product.id}>
                                  <TableCell>{index + 1}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">
                                        {product.name}
                                      </div>
                                      {product?.attributes && (
                                        <div className="break-words text-sm text-muted-foreground">
                                          {product.attributes
                                            .map(
                                              (attribute) =>
                                                `${attribute.name}: ${attribute.pivot.value} (${attributes[attribute.unit]})`,
                                            )
                                            .join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={quantities[product.id] || 1}
                                      type="number"
                                      className="h-7 w-full"
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={giveaway[product.id] || 0}
                                      type="number"
                                      className="h-7 w-full"
                                      onChange={(e) =>
                                        handleGiveawayChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {product?.prices[0]?.unitName || 'Không có'}
                                  </TableCell>
                                  <TableCell className="text-end">
                                    <Input
                                      value={moneyFormat(product.price)}
                                      placeholder="0"
                                      className="h-7 w-full text-end"
                                      onChange={(e) =>
                                        handlePriceChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <FormField
                                      control={form.control}
                                      name="taxes"
                                      render={() => (
                                        <FormItem>
                                          {product?.prices[0]?.taxes.map(
                                            (tax) => (
                                              <FormItem
                                                key={tax.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                              >
                                                <FormControl>
                                                  <Checkbox
                                                    onCheckedChange={(
                                                      isChecked,
                                                    ) =>
                                                      handleTaxChange(
                                                        product.id,
                                                        tax.id,
                                                        isChecked,
                                                      )
                                                    }
                                                    checked={
                                                      selectedTaxes[
                                                        product.id
                                                      ]?.includes(tax.id) ||
                                                      false
                                                    }
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal">
                                                  {tax.title} -{' '}
                                                  <strong className="text-destructive">
                                                    ({tax.percentage}%)
                                                  </strong>
                                                </FormLabel>
                                              </FormItem>
                                            ),
                                          )}
                                        </FormItem>
                                      )}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      value={
                                        discounts[product.id]
                                          ? moneyFormat(discounts[product.id])
                                          : ''
                                      }
                                      placeholder="0"
                                      className="h-7 w-full text-end"
                                      onChange={(e) =>
                                        handleDiscountChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="text-end">
                                    {moneyFormat(calculateSubTotal(product.id))}
                                  </TableCell>

                                  <TableCell className="text-end">
                                    <Input
                                      onChange={(e) =>
                                        handleWarrantyChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Bảo hành"
                                      type="text"
                                      className="h-7 w-full"
                                    />
                                  </TableCell>

                                  <TableCell className="text-end">
                                    <Textarea
                                      onChange={(e) =>
                                        handleNoteChange(
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Ghi chú"
                                      rows={1}
                                      type="text"
                                      className="h-7 w-full"
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}

                      <MultipleSelector
                        maxSelected={1}
                        emptyIndicator={
                          <p className="text-center text-xs leading-10 text-muted-foreground">
                            Không có kết quả nào được tìm thấy
                          </p>
                        }
                        hidePlaceholderWhenSelected={true}
                        onChange={(value) => handleSelectProduct(value)}
                        options={products
                          .filter(
                            (product) =>
                              product.categoryId === 1 ||
                              product.categoryId === 17, // GH Kafood
                          ) // Kafood
                          .map((product) => ({
                            label: `${product.name} - ${moneyFormat(product.price)} - (hệ số: ${product.coefficient.coefficient})`,
                            value: product.id,
                          }))}
                        placeholder="Tìm kiếm sản phẩm"
                        value={selectedProducts.map((product) => ({
                          label: `${product.name} - ${moneyFormat(product.price)} - (hệ số: ${product.coefficient.coefficient})`,
                          value: product.id,
                        }))}
                      />

                      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Ghi chú</FormLabel>
                              <FormControl>
                                <Textarea
                                  rows={3}
                                  placeholder="Nhập ghi chú nếu có"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <div className="text-sm font-bold">Tạm tính</div>
                            <div className="text-sm">
                              {moneyFormat(handleCalculateSubTotalInvoice())}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <div className="text-sm font-bold">Thuế</div>
                            <div className="text-sm">
                              {moneyFormat(calculateTotalTax())}
                            </div>
                          </div>

                          <div className="flex justify-between">
                            <div className="text-sm font-bold">Giảm giá</div>
                            <div className="text-sm">
                              {moneyFormat(calculateTotalDiscount())}
                            </div>
                          </div>

                          <div className="flex justify-between border-t py-2">
                            <div className="text-sm font-bold">
                              Tổng số tiền
                            </div>
                            <div className="text-sm">
                              {moneyFormat(calculateTotalAmount())}
                            </div>
                          </div>

                          <div className="flex justify-start border-t py-2">
                            <div className="text-sm font-bold">
                              Số tiền viết bằng chữ:
                              <span className="ml-1">
                                {toVietnamese(calculateTotalAmount())}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>

                      {selectedCustomer && (
                        <div
                          className="h-5 w-5 cursor-pointer text-destructive"
                          title="Chọn lại"
                        >
                          <X
                            className="h-5 w-5"
                            onClick={() => {
                              setSelectedCustomer(null)
                              form.setValue('customerId', null)
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {selectedCustomer ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedCustomer?.name}`}
                              alt={selectedCustomer?.name}
                            />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {selectedCustomer.name}
                            </div>
                            <div className="cursor-pointer text-sm text-primary hover:text-secondary-foreground">
                              {selectedCustomer.invoiceCount} hóa đơn
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="font-medium">
                              Thông tin khách hàng
                            </div>
                            <a
                              role="button"
                              onClick={() => setShowUpdateCustomerDialog(true)}
                              size="icon"
                              title="Cập nhật thông tin khách hàng"
                            >
                              <Pencil className="h-4 w-4" />
                            </a>
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="font-medium">
                              {selectedCustomer.name}
                            </div>
                            <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MobileIcon className="h-4 w-4" />
                              </div>
                              <a href={`tel:${selectedCustomer.phone}`}>
                                {selectedCustomer.phone || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-muted-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <Mail className="h-4 w-4" />
                              </div>
                              <a href={`mailto:${selectedCustomer.email}`}>
                                {selectedCustomer.email || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-primary hover:text-secondary-foreground">
                              <div className="mr-2 h-4 w-4 ">
                                <MapPin className="h-4 w-4" />
                              </div>
                              {selectedCustomer.address || 'Chưa cập nhật'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="customerId"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel required={true}>Khách hàng</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        '!mt-[4px] w-full justify-between font-normal',
                                        !field.value && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value
                                        ? customers.find(
                                            (customer) =>
                                              customer.id === field.value,
                                          )?.name
                                        : 'Chọn khách hàng'}
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Tìm kiếm..."
                                      className="h-9"
                                    />
                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                    <CommandGroup>
                                      <CommandList>
                                        {customers &&
                                          customers.map((customer) => (
                                            <CommandItem
                                              value={customer.id}
                                              key={customer.id}
                                              onSelect={() => {
                                                form.setValue(
                                                  'customerId',
                                                  customer.id.toString(),
                                                )
                                                form.trigger('customerId')
                                                setSelectedCustomer(customer)
                                              }}
                                            >
                                              {customer.name} - {customer.phone}
                                              <CheckIcon
                                                className={cn(
                                                  'ml-auto h-4 w-4',
                                                  customer.id === field.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                      </CommandList>
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div
                          className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                          onClick={() => setShowCreateCustomerDialog(true)}
                        >
                          <div className="mr-2 h-4 w-4">
                            <Plus className="h-4 w-4" />
                          </div>
                          Thêm khách hàng mới
                        </div>
                      </>
                    )}

                    <Separator className="my-3" />

                    {selectedSchool ? (
                      <>
                        <div className="flex items-center justify-between">
                          <h2 className="py-2 text-lg font-semibold">
                            Trường học
                          </h2>

                          {selectedSchool && (
                            <div
                              className="h-5 w-5 cursor-pointer text-destructive"
                              title="Chọn lại"
                            >
                              <X
                                className="h-5 w-5"
                                onClick={() => {
                                  setSelectedSchool(null)
                                  form.setValue('schoolId', null)
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedSchool?.name}`}
                                alt={selectedSchool?.name}
                              />
                              <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {selectedSchool.name}
                                {(() => {
                                  const lastPlan =
                                    selectedSchool?.licenses?.[
                                      selectedSchool?.licenses?.length - 1
                                    ]?.plan

                                  const isPaid = lastPlan === 'paid'
                                  const planLabel = isPaid
                                    ? 'Trả phí'
                                    : 'Miễn phí'
                                  const colorClass = isPaid
                                    ? 'text-green-600'
                                    : 'text-red-600'

                                  return (
                                    <div
                                      className={`cursor-pointer text-sm font-medium hover:opacity-80 ${colorClass}`}
                                    >
                                      {planLabel} (
                                      {selectedSchool?.countPlan || 0})
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="mb-2">
                              <div className="font-medium">
                                Thông tin trường học
                              </div>
                            </div>

                            <div className="mt-4 space-y-2 text-sm">
                              <div className="flex items-center">
                                <div className="mr-2 h-4 w-4 ">
                                  <Clock className="h-4 w-4 font-bold" />
                                </div>
                                <div>
                                  <strong className="mr-1">
                                    Ngày hết hạn hiện tại:
                                  </strong>
                                  {dateFormat(selectedSchool.expirationTime)}
                                </div>
                              </div>

                              <div className="font-semibold">
                                Chủ trường: {selectedSchool.author}
                              </div>
                              <div className="flex cursor-pointer items-center text-primary hover:text-secondary-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <MobileIcon className="h-4 w-4" />
                                </div>
                                <a href={`tel:${selectedSchool.phone}`}>
                                  {selectedSchool.phone || 'Chưa cập nhật'}
                                </a>
                              </div>
                              <div className="flex items-center text-muted-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <a href={`mailto:${selectedSchool.email}`}>
                                  {selectedSchool.email || 'Chưa cập nhật'}
                                </a>
                              </div>
                              <div className="flex items-center text-primary hover:text-secondary-foreground">
                                <div className="mr-2 h-4 w-4 ">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                {selectedSchool.address || 'Chưa cập nhật'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <FormField
                          control={form.control}
                          name="schoolId"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel required={true}>Trường học</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        '!mt-[4px] w-full justify-between font-normal',
                                        !field.value && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value
                                        ? schools.find(
                                            (school) =>
                                              school.id === field.value,
                                          )?.name
                                        : 'Chọn trường học'}
                                      <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput
                                      placeholder="Nhập tên hoặc SĐT"
                                      className="h-9"
                                    />
                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                    <CommandGroup>
                                      <CommandList>
                                        {schools &&
                                          schools.map((school) => (
                                            <CommandItem
                                              value={`${school.name} ${school.phone}`}
                                              key={school.id}
                                              onSelect={() => {
                                                form.setValue(
                                                  'schoolId',
                                                  school.id.toString(),
                                                )
                                                form.trigger('schoolId')
                                                setSelectedSchool(school)
                                              }}
                                            >
                                              <div className="flex items-center space-x-2">
                                                <span>{school.name}</span>
                                                <span>({school.phone})</span>
                                              </div>

                                              <CheckIcon
                                                className={cn(
                                                  'ml-auto h-4 w-4',
                                                  school.id === field.value
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                                )}
                                              />
                                            </CommandItem>
                                          ))}
                                      </CommandList>
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div
                          className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                          onClick={() => setShowCreateSchoolDialog(true)}
                        >
                          <div className="mr-2 h-4 w-4">
                            <Plus className="h-4 w-4" />
                          </div>
                          Thêm trường mời
                        </div>
                      </>
                    )}

                    <Separator className="my-3" />

                    <div
                      className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                      onClick={() => handleCreateReceipt()}
                    >
                      <div className="mr-2 h-4 w-4">
                        <IconReceipt2 className="h-4 w-4" />
                      </div>
                      Tạo phiếu thu
                    </div>

                    {isCreateReceipt && (
                      <div className="mb-3">
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={() => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel required={true}>Số tiền thu</FormLabel>
                              <FormControl>
                                <Input
                                  value={moneyFormat(
                                    totalAmount || calculateTotalAmount(),
                                  )}
                                  placeholder="0"
                                  className="w-full text-end"
                                  onChange={handleInputChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem className="mb-3 space-y-1">
                                <FormLabel required={true}>
                                  Phương thức thanh toán
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn phương thức" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectGroup>
                                      {paymentMethods.map((method) => (
                                        <SelectItem
                                          key={method.label}
                                          value={method.value}
                                        >
                                          <div className="flex items-center">
                                            <div className="mr-2 h-4 w-4">
                                              <method.icon className="h-4 w-4 text-primary" />
                                            </div>
                                            {method.label}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="mb-3">
                          <FormField
                            control={form.control}
                            name="paymentNote"
                            render={({ field }) => (
                              <FormItem className="mb-2 space-y-1">
                                <FormLabel>Ghi chú thanh toán</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={3}
                                    placeholder="Nhập ghi chú nếu có"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div
                      className="my-3 flex cursor-pointer items-center text-sm text-primary hover:text-secondary-foreground hover:underline"
                      onClick={() => setIsSharing(true)}
                    >
                      <div className="mr-2 h-4 w-4">
                        <IconUserShare className="h-4 w-4" />
                      </div>
                      Tỉ lệ hưởng doanh số
                    </div>
                    {isSharing && (
                      <>
                        <FormField
                          control={form.control}
                          name="revenueSharing.ratio"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-3">
                              <FormLabel>Chọn mức</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  {sharingRatios?.payload.map(
                                    (ratio, index) => (
                                      <FormItem
                                        key={`ratio-${index}`}
                                        className="flex items-center space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <RadioGroupItem
                                            value={(ratio.sub / 10).toString()}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                          {ratio.main}/{ratio.sub} (Chia:{' '}
                                          {moneyFormat(
                                            (handleCalculateSubTotalInvoice() -
                                              calculateTotalDiscount()) *
                                              (ratio.sub / 10),
                                          )}
                                          )
                                        </FormLabel>
                                      </FormItem>
                                    ),
                                  )}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="revenueSharing.userId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chọn người</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn người ăn chia" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users &&
                                    users
                                      .filter(
                                        (user) =>
                                          user.id !==
                                          authUserWithRoleHasPermissions.id,
                                      )
                                      .map((user) => (
                                        <SelectItem
                                          key={`user-${user.id}`}
                                          value={user.id.toString()}
                                        >
                                          {user.fullName}
                                        </SelectItem>
                                      ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {isSharing && (
                      <div className="my-3 flex cursor-pointer items-center justify-end text-sm font-semibold text-destructive">
                        <div
                          className="flex items-center rounded-md border border-destructive px-2 py-1"
                          onClick={() => {
                            setIsSharing(false)
                            form.setValue('revenueSharing', null)
                          }}
                        >
                          <div className="mr-2 h-4 w-4">
                            <IconCircleX className="h-4 w-4" />
                          </div>
                          Hủy
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:space-x-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
            </DialogClose>

            <Button
              form="create-invoice"
              disabled={
                loading ||
                !selectedCustomer ||
                !selectedProducts.length ||
                !selectedSchool
              }
              onClick={() => setHasPrintInvoice(true)}
              className="w-full sm:w-auto"
            >
              <IconFileTypePdf className="me-2 h-4 w-4" /> Lưu và in
            </Button>

            <Button
              form="create-invoice"
              disabled={
                loading ||
                !selectedCustomer ||
                !selectedProducts.length ||
                !selectedSchool
              }
              className="w-full sm:w-auto"
            >
              <IconDatabasePlus className="me-2 h-4 w-4" /> Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showUpdateCustomerDialog && (
        <UpdateCustomerDialog
          open={showUpdateCustomerDialog}
          onOpenChange={setShowUpdateCustomerDialog}
          customer={selectedCustomer}
          showTrigger={false}
        />
      )}

      {showCreateCustomerDialog && (
        <CreateCustomerDialog
          open={showCreateCustomerDialog}
          onOpenChange={setShowCreateCustomerDialog}
          showTrigger={false}
        />
      )}

      {showCreateSchoolDialog && (
        <CreateSchoolDialog
          open={showCreateSchoolDialog}
          onOpenChange={setShowCreateSchoolDialog}
          showTrigger={false}
        />
      )}

      {invoice && generalInformation && (
        <PrintInvoiceView invoice={invoice} setting={generalInformation} />
      )}
    </>
  )
}

export default UpdateKafoodInvoiceDialog
