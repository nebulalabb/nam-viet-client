import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { CaretSortIcon, MobileIcon, PlusIcon } from '@radix-ui/react-icons'
import { CheckIcon, Mail, MapPin, Pencil, Plus, X } from 'lucide-react'
import {
  IconCircleX,
  IconDatabasePlus,
  IconFileTypePdf,
  IconPencil,
  IconReceipt2,
  IconUserShare,
} from '@tabler/icons-react'

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import MultipleSelector from '@/components/custom/MultiSelector'
import { MoneyInputQuick } from '@/components/custom/MoneyInputQuick'
import { DatePicker } from '@/components/custom/DatePicker'

import UpdateCustomerDialog from '../../customer/components/UpdateCustomerDialog'
import CreateCustomerDialog from '../../customer/components/CreateCustomerDialog'
import CreateOtherExpenses from './CreateOtherExpenses'
import PrintInvoiceView from './PrintInvoiceView'
import QuotationPreviewDialog from '../components_notuse/QuotationPreviewDialog'
import CreateProductDialog from '../../product/components/CreateProductDialog'

import { updateInvoiceSchema } from '../schema'
import { attributes } from '../data'
import { moneyFormat, toVietnamese } from '@/utils/money-format'
import { dateFormat } from '@/utils/date-format'

import { getProducts } from '@/stores/ProductSlice'
import { getSetting } from '@/stores/SettingSlice'
import { getUsers } from '@/stores/UserSlice'
import { getInvoiceDetail, getInvoiceDetailByUser } from '@/api/invoice'

import { exportQuotationPdf } from '../helpers/ExportQuotationPdf'
import { buildQuotationData } from '../helpers/BuildQuotationData'

import api from '@/utils/axios'
import Can from '@/utils/can'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { paymentMethods } from '../../receipt/data'

const normalizePaymentMethod = (pm) => {
  // Đồng bộ theo CreateInvoiceDialog: 'cash' | 'transfer'
  if (!pm) return 'cash'
  if (pm === 'bank_transfer') return 'transfer'
  return pm
}

const UpdateInvoiceDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  invoiceUpdateId,
}) => {
  const dispatch = useDispatch()

  const products = useSelector((s) => s.product.products)
  const customers = useSelector((s) => s.customer.customers)
  const users = useSelector((s) => s.user.users)
  // const loading = useSelector((s) => s.invoice.loading)
  const authUser =
    useSelector((s) => s.auth.authUserWithRoleHasPermissions) || {}

  const [localInvoiceData, setLocalInvoiceData] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])

  const [quantities, setQuantities] = useState({})
  const [discounts, setDiscounts] = useState({})
  const [notes, setNotes] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const [selectedTaxes, setSelectedTaxes] = useState({})
  const [applyWarrantyItems, setApplyWarrantyItems] = useState({})

  const [applyExpiryItems, setApplyExpiryItems] = useState({})
  const [expiryDurations, setExpiryDurations] = useState({})
  const [productStartDate, setProductStartDate] = useState({})
  const [accountName, setAccountName] = useState({})

  const [otherExpenses, setOtherExpenses] = useState({
    price: 0,
    description: 'Phí vận chuyển',
  })

  const [isCreateReceipt, setIsCreateReceipt] = useState(false)
  const [totalAmount, setTotalAmount] = useState('') // số tiền thu (receipt)

  const [isSharing, setIsSharing] = useState(false)
  const [sharingRatios, setSharingRatios] = useState(null)

  const [invoicePrint, setInvoicePrint] = useState(null)
  const [generalInformation, setGeneralInformation] = useState(null)
  const [banks, setBanks] = useState([])

  const [showQuotationPreview, setShowQuotationPreview] = useState(false)
  const [quotationData, setQuotationData] = useState(null)
  const [quotationFileName, setQuotationFileName] = useState('quotation.pdf')

  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] =
    useState(false)
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const [showCreateOtherExpensesDialog, setShowCreateOtherExpensesDialog] =
    useState(false)

  // receipt
  const [receiptDueDate, setReceiptDueDate] = useState(null)

  // ====== UNIT CONVERSION STATES (align CreateInvoiceDialog) ======
  const [selectedUnitIds, setSelectedUnitIds] = useState({})
  const [baseUnitPrices, setBaseUnitPrices] = useState({})
  const [priceOverrides, setPriceOverrides] = useState({})

  const form = useForm({
    resolver: zodResolver(updateInvoiceSchema),
    defaultValues: {
      customerId: '',
      note: '',
      revenueSharing: null,
      paymentMethod: paymentMethods?.[0]?.value || 'cash',
      paymentNote: '',
      // các field dưới có thể không nằm trong zod schema hiện tại,
      // nhưng vẫn dùng trong UI + payload giống CreateInvoiceDialog
      bankAccount: null,
      dueDate: '',
      totalAmount: '',
    },
  })

  // =========================
  // UNIT CONVERSION HELPERS (copy semantics từ CreateInvoiceDialog)
  // =========================
  const getUnitPriceFromPrices = useCallback((product, unitId) => {
    const uId = Number(unitId)
    const list = Array.isArray(product?.prices) ? product.prices : []
    const matched = list.filter((x) => Number(x.unitId) === uId)
    if (!matched.length) return null

    // ưu tiên latest
    const latest = matched.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0]

    // tùy field backend: price/amount/value...
    return Number(latest?.price ?? latest?.amount ?? latest?.value ?? 0)
  }, [])

  const getUnitNameFromPrices = useCallback((product, unitId) => {
    const uId = Number(unitId)
    const p = (product?.prices || []).find((x) => Number(x.unitId) === uId)
    return p?.unitName || p?.unit?.name || null
  }, [])

  const getBaseUnitId = useCallback(
    (product) => product?.baseUnitId || product?.prices?.[0]?.unitId || null,
    [],
  )

  const getBaseUnitName = useCallback(
    (product) =>
      product?.baseUnit?.name || product?.prices?.[0]?.unitName || '—',
    [],
  )

  const getUnitOptions = useCallback(
    (product) => {
      const baseId = getBaseUnitId(product)
      const baseName = getBaseUnitName(product)

      const map = new Map()

      // 1) base
      if (baseId) {
        map.set(Number(baseId), {
          unitId: Number(baseId),
          unitName: baseName,
          factor: 1,
        })
      }

      // 2) from unitConversions
      const conversions = Array.isArray(product?.unitConversions)
        ? product.unitConversions
        : []

      for (const c of conversions) {
        const uId = Number(c?.unitId)
        if (!uId) continue
        const factor = Number(c?.conversionFactor || 0)
        map.set(uId, {
          unitId: uId,
          unitName:
            c?.unit?.name ||
            c?.unitName ||
            getUnitNameFromPrices(product, uId) ||
            '—',
          factor: factor > 0 ? factor : 1,
        })
      }

      // 3) from product.prices (đây là chỗ giúp hiện đủ 3 ĐVT)
      const priceUnits = product?.prices || []
      for (const pr of priceUnits) {
        const uId = Number(pr?.unitId)
        if (!uId) continue
        if (!map.has(uId)) {
          map.set(uId, {
            unitId: uId,
            unitName: pr?.unitName || pr?.unit?.name || '—',
            // nếu không có conversionFactor thì tạm để 1,
            // giá sẽ lấy theo price list (sửa ở phần vấn đề 2)
            factor: 1,
          })
        }
      }

      // 4) from invoice unit
      const inv = product?.__invoiceUnit
      if (inv?.unitId && !map.has(Number(inv.unitId))) {
        map.set(Number(inv.unitId), {
          unitId: Number(inv.unitId),
          unitName:
            inv.unitName || getUnitNameFromPrices(product, inv.unitId) || '—',
          factor: Number(inv.factor || 1) > 0 ? Number(inv.factor || 1) : 1,
        })
      }

      return Array.from(map.values())
    },
    [getBaseUnitId, getBaseUnitName, getUnitNameFromPrices],
  )

  const getFactor = useCallback(
    (product, unitId) => {
      const uId = Number(unitId)
      if (!uId) return 1
      const opt = getUnitOptions(product).find((o) => Number(o.unitId) === uId)
      return opt?.factor && opt.factor > 0 ? opt.factor : 1
    },
    [getUnitOptions],
  )

  const getUnitNameById = useCallback(
    (product, unitId) => {
      const uId = Number(unitId)
      const opt = getUnitOptions(product).find((o) => Number(o.unitId) === uId)
      return opt?.unitName || getBaseUnitName(product)
    },
    [getUnitOptions, getBaseUnitName],
  )

  const getDisplayPrice = useCallback(
    (product) => {
      const pid = product?.id
      if (!pid) return 0

      const unitId =
        selectedUnitIds[pid] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId

      // 1) override (user nhập)
      if (priceOverrides[pid] != null) return Number(priceOverrides[pid] || 0)

      // 2) giá theo unit (productPrice)
      const unitPrice = getUnitPriceFromPrices(product, unitId)
      if (unitPrice != null && unitPrice > 0) return unitPrice

      // 3) fallback conversion
      const factor = getFactor(product, unitId)
      const basePrice = Number(baseUnitPrices[pid] ?? product?.price ?? 0)
      return factor > 0 ? basePrice / factor : basePrice
    },
    [
      baseUnitPrices,
      priceOverrides,
      selectedUnitIds,
      getFactor,
      getBaseUnitId,
      getUnitPriceFromPrices,
    ],
  )

  // =========================
  // Fetch initial data
  // =========================
  useEffect(() => {
    if (!open) return

    dispatch(getProducts())
    dispatch(getUsers())

    dispatch(getSetting('sharing_ratio')).then((r) =>
      setSharingRatios(r.payload),
    )

    // giống CreateInvoiceDialog: general_information chứa banks
    dispatch(getSetting('general_information')).then((r) => {
      setGeneralInformation(r.payload?.payload)
      setBanks(
        r.payload?.payload?.banks || r.payload?.payload?.bankAccounts || [],
      )
    })
  }, [open, dispatch])

  // reset local states when close (align Create)
  useEffect(() => {
    if (open) return

    setLocalInvoiceData(null)
    setSelectedCustomer(null)
    setSelectedProducts([])

    setQuantities({})
    setDiscounts({})
    setNotes({})
    setGiveaway({})
    setSelectedTaxes({})
    setApplyWarrantyItems({})

    setApplyExpiryItems({})
    setExpiryDurations({})
    setProductStartDate({})
    setAccountName({})

    setSelectedUnitIds({})
    setBaseUnitPrices({})
    setPriceOverrides({})

    setOtherExpenses({ price: 0, description: 'Phí vận chuyển' })
    setIsCreateReceipt(false)
    setTotalAmount('')
    setReceiptDueDate(null)

    setIsSharing(false)

    setInvoicePrint(null)

    setShowQuotationPreview(false)
    setQuotationData(null)
    setQuotationFileName('quotation.pdf')

    setShowUpdateCustomerDialog(false)
    setShowCreateCustomerDialog(false)
    setShowCreateProductDialog(false)
    setShowCreateOtherExpensesDialog(false)

    form.reset()
  }, [open, form])

  // =========================
  // Load invoice detail when open
  // =========================
  useEffect(() => {
    if (!open || !invoiceUpdateId) return

    api
      .get(`/invoice/${invoiceUpdateId}/admin`)
      .then((res) => {
        const data = res.data.data
        setLocalInvoiceData(data)

        const pm = normalizePaymentMethod(data.paymentMethod)

        form.reset({
          customerId: data.customerId?.toString() || '',
          note: data.note || '',
          revenueSharing: data.revenueSharing || null,
          paymentMethod: pm || paymentMethods?.[0]?.value || 'cash',
          paymentNote: data.paymentNote || '',
          bankAccount: data.bankAccount || null,
          dueDate: data.dueDate ? String(data.dueDate).slice(0, 10) : '',
          totalAmount: '',
        })

        // customer
        const customer = customers.find((c) => c.id === data.customerId)
        setSelectedCustomer(customer || null)

        const qty = {}
        const dis = {}
        const nt = {}
        const give = {}
        const tax = {}
        const warr = {}
        const expApply = {}
        const expDur = {}
        const expStart = {}
        const acc = {}

        // conversion init
        const unitIds = {}
        const basePrices = {}
        const overrides = {}

        const prods = (data.invoiceItems || []).map((item) => {
          const pid = item.productId
          const product = item.product

          qty[pid] = Number(item.quantity || 1)
          dis[pid] = Number(item.discount || 0)
          nt[pid] = item.note || ''
          give[pid] = Number(item.giveaway || 0)
          tax[pid] = item.taxes?.map((t) => t.id) || []
          warr[pid] = !!item.applyWarranty

          expApply[pid] = !!item.applyExpiry
          expDur[pid] = {
            value: item.expiryDuration || 1,
            unit: item.expiryUnit || 'month',
          }
          expStart[pid] = item.startDate ? new Date(item.startDate) : null
          acc[pid] = item.accountName || ''

          // ===== init unit conversion from invoiceItem =====
          const unitIdFromItem =
            item.unitId ||
            getBaseUnitId(product) ||
            product?.prices?.[0]?.unitId
          const unitId = Number(unitIdFromItem || 0) || null
          unitIds[pid] = unitId

          const factorFromItem = Number(item.conversionFactor || 0)
          const factor =
            factorFromItem > 0 ? factorFromItem : getFactor(product, unitId)

          // item.price được hiểu là giá theo đơn vị đang chọn
          const unitPrice = Number(item.price || 0)

          // basePrice = unitPrice * factor (align Create semantics: display = base/factor)
          basePrices[pid] = factor > 0 ? unitPrice * factor : unitPrice

          // giữ nguyên giá đang bán để update không tự nhảy theo product.price hiện tại
          overrides[pid] = unitPrice

          product.__invoiceUnit = unitId
            ? {
              unitId,
              unitName: item.unitName || item?.unit?.name || '—',
              factor: factor > 0 ? factor : 1,
            }
            : null

          return product
        })

        setSelectedProducts(prods)
        setQuantities(qty)
        setDiscounts(dis)
        setNotes(nt)
        setGiveaway(give)
        setSelectedTaxes(tax)
        setApplyWarrantyItems(warr)
        setApplyExpiryItems(expApply)
        setExpiryDurations(expDur)
        setProductStartDate(expStart)
        setAccountName(acc)

        setSelectedUnitIds(unitIds)
        setBaseUnitPrices(basePrices)
        setPriceOverrides(overrides)

        setOtherExpenses(
          data.otherExpenses || { price: 0, description: 'Phí vận chuyển' },
        )

        // due date receipt UI (state) - đồng bộ
        if (data.dueDate) {
          // nếu backend trả date string/iso
          try {
            setReceiptDueDate(new Date(data.dueDate))
          } catch {
            setReceiptDueDate(null)
          }
        } else {
          setReceiptDueDate(null)
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || 'Không tải được hóa đơn')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoiceUpdateId])

  // =========================
  // Calculations (align Create)
  // =========================
  const calculateSubTotal = useCallback(
    (productId) => {
      const quantity = quantities[productId] || 1
      const discount = discounts[productId] || 0
      const product = selectedProducts.find((p) => p.id === productId)
      if (!product) return 0

      const price = getDisplayPrice(product)
      const subtotal = quantity * price
      return Math.max(subtotal - discount, 0)
    },
    [quantities, discounts, selectedProducts, getDisplayPrice],
  )

  const calculateTotalDiscount = useCallback(() => {
    return selectedProducts.reduce(
      (sum, p) => sum + Number(discounts[p.id] || 0),
      0,
    )
  }, [selectedProducts, discounts])

  const calculateTaxForProduct = useCallback(
    (productId) => {
      const product = selectedProducts.find((p) => p.id === productId)
      if (!product) return 0

      const quantity = quantities[productId] || 1
      const price = getDisplayPrice(product)
      const basePrice = price * quantity

      const selectedProductTaxes = selectedTaxes[productId] || []

      // align CreateInvoiceDialog: lấy taxes từ prices[0]
      const taxes = product?.prices?.[0]?.taxes || []

      return taxes
        .filter((t) => selectedProductTaxes.includes(t.id))
        .reduce(
          (sum, t) => sum + (basePrice * Number(t.percentage || 0)) / 100,
          0,
        )
    },
    [selectedProducts, quantities, selectedTaxes, getDisplayPrice],
  )

  const calculateTotalTax = useCallback(() => {
    return selectedProducts.reduce(
      (sum, p) => sum + calculateTaxForProduct(p.id),
      0,
    )
  }, [selectedProducts, calculateTaxForProduct])

  const handleCalculateSubTotalInvoice = useCallback(() => {
    // tổng trước giảm giá (tạm tính)
    return selectedProducts.reduce((sum, p) => {
      const price = getDisplayPrice(p)
      const quantity = quantities[p.id] || 1
      return sum + price * quantity
    }, 0)
  }, [selectedProducts, getDisplayPrice, quantities])

  const calculateInvoiceTotal = useCallback(() => {
    // tổng sau giảm giá, trước thuế & phí
    return selectedProducts.reduce((sum, p) => sum + calculateSubTotal(p.id), 0)
  }, [selectedProducts, calculateSubTotal])

  const calculateTotalAmount = useCallback(() => {
    // align Create: invoiceTotal + tax + expense
    return (
      calculateInvoiceTotal() +
      calculateTotalTax() +
      Number(otherExpenses?.price || 0)
    )
  }, [calculateInvoiceTotal, calculateTotalTax, otherExpenses])

  // =========================
  // Product selection (align Create)
  // =========================
  const handleSelectProduct = useCallback(
    (value) => {
      const ids = value.map((v) => v.value)
      const list = products.filter((p) => ids.includes(p.id))
      setSelectedProducts(list)

      // init defaults for states + cleanup removed
      setQuantities((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? 1
        return next
      })

      setDiscounts((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? 0
        return next
      })

      setNotes((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? ''
        return next
      })

      setGiveaway((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? 0
        return next
      })

      setSelectedTaxes((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? []
        return next
      })

      setApplyWarrantyItems((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? false
        return next
      })

      setApplyExpiryItems((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? false
        return next
      })

      setExpiryDurations((prev) => {
        const next = { ...prev }
        for (const p of list) {
          if (p.hasExpiry && !next[p.id])
            next[p.id] = { value: 1, unit: 'month' }
        }
        // cleanup removed
        for (const k of Object.keys(next)) {
          if (!ids.includes(Number(k))) delete next[k]
        }
        return next
      })

      setProductStartDate((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? null
        return next
      })

      setAccountName((prev) => {
        const next = {}
        for (const p of list) next[p.id] = prev[p.id] ?? ''
        return next
      })

      // unit conversion init
      setSelectedUnitIds((prev) => {
        const next = { ...prev }
        for (const p of list) {
          if (!next[p.id])
            next[p.id] = getBaseUnitId(p) || p?.prices?.[0]?.unitId
        }
        for (const k of Object.keys(next)) {
          if (!ids.includes(Number(k))) delete next[k]
        }
        return next
      })

      setBaseUnitPrices((prev) => {
        const next = { ...prev }
        for (const p of list) {
          if (next[p.id] == null) next[p.id] = Number(p.price || 0)
        }
        for (const k of Object.keys(next)) {
          if (!ids.includes(Number(k))) delete next[k]
        }
        return next
      })

      setPriceOverrides((prev) => {
        const next = { ...prev }
        for (const k of Object.keys(next)) {
          if (!ids.includes(Number(k))) delete next[k]
        }
        return next
      })
    },
    [products, getBaseUnitId],
  )

  // =========================
  // Receipt UI helpers
  // =========================
  const paymentMethod = form.watch('paymentMethod')
  useEffect(() => {
    // align Create: nếu không transfer thì clear bankAccount
    if (paymentMethod !== 'transfer') {
      form.setValue('bankAccount', null)
    }
  }, [paymentMethod, form])

  // =========================
  // Submit
  // =========================
  const onSubmit = async (data, mode) => {
    if (!localInvoiceData) return

    // Build items with unit conversion + display price (align Create)
    const items = selectedProducts.map((product) => {
      const qtyUnit = quantities[product.id] || 1
      const discount = discounts[product.id] || 0

      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId

      const unitName = getUnitNameById(product, unitId)
      const factor = getFactor(product, unitId)

      const baseQty = factor > 0 ? qtyUnit / factor : qtyUnit
      const priceUnit = getDisplayPrice(product)

      return {
        productId: product.id,
        productName: product.name,
        productType: product.type,
        image: product.image,

        unitId,
        unitName,

        quantity: qtyUnit,
        baseQuantity: baseQty,
        conversionFactor: factor, // optional debug

        giveaway: giveaway[product.id] || 0,

        price: priceUnit,
        taxAmount: calculateTaxForProduct(product.id),
        subTotal: calculateSubTotal(product.id),
        discount,
        total:
          calculateSubTotal(product.id) + calculateTaxForProduct(product.id),

        note: notes[product.id] || '',
        options: product.attributes || [],

        applyWarranty: !!applyWarrantyItems[product.id],
        conditions:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product.warrantyPolicy.conditions
            : '',
        periodMonths:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product.warrantyPolicy.periodMonths
            : 0,
        warrantyCost:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product.warrantyPolicy.warrantyCost
            : 0,

        applyExpiry: !!applyExpiryItems[product.id],
        accountName: applyExpiryItems[product.id]
          ? accountName[product.id] || ''
          : '',
        startDate: applyExpiryItems[product.id]
          ? productStartDate[product.id] || null
          : null,
        expiryDuration: applyExpiryItems[product.id]
          ? expiryDurations[product.id]?.value || null
          : null,
        expiryUnit: applyExpiryItems[product.id]
          ? expiryDurations[product.id]?.unit || null
          : null,
      }
    })

    const payload = {
      invoiceId: localInvoiceData.id,
      userId: authUser?.id, // FIX: không dùng biến undefined
      customerId: data.customerId,
      note: data.note,

      // align Create: subTotal là tạm tính (trước giảm)
      subTotal: handleCalculateSubTotalInvoice(),
      discount: calculateTotalDiscount(),
      taxAmount: calculateTotalTax(),
      amount: calculateTotalAmount(),

      items,

      // receipt (align Create)
      createReceipt: isCreateReceipt,
      paymentMethod: normalizePaymentMethod(data.paymentMethod),
      paymentNote: data.paymentNote,

      bankAccount:
        normalizePaymentMethod(data.paymentMethod) === 'transfer'
          ? data.bankAccount
          : null,

      // due date KHÔNG phụ thuộc transfer - chỉ phụ thuộc createReceipt (nhưng vẫn gửi null nếu không)
      dueDate: isCreateReceipt
        ? receiptDueDate
          ? new Date(receiptDueDate).toISOString()
          : data.dueDate || null
        : null,

      // số tiền thu: ưu tiên input user, fallback tổng tiền
      totalAmount: isCreateReceipt
        ? Number(totalAmount || calculateTotalAmount() || 0)
        : null,

      ...(otherExpenses?.price > 0 && {
        otherExpenses: [otherExpenses],
      }),
    }

    if (data.revenueSharing) {
      payload.revenueSharing = {
        sharePercentage: Number(data.revenueSharing.ratio || 0),
        userId: Number(data.revenueSharing.userId),
        amount:
          (handleCalculateSubTotalInvoice() - calculateTotalDiscount()) *
          Number(data.revenueSharing.ratio || 0),
      }
    }

    try {
      await api.put(`/invoice/${localInvoiceData.id}/update-pending`, payload)
      toast.success('Cập nhật hóa đơn thành công')

      const isAdmin = JSON.parse(
        localStorage.getItem('permissionCodes') || '[]',
      ).includes('GET_INVOICE')

      if (mode === 'update') {
        onOpenChange(false)
        return
      }

      const invoiceData = isAdmin
        ? await getInvoiceDetail(localInvoiceData.id)
        : await getInvoiceDetailByUser(localInvoiceData.id)

      if (mode === 'invoice') {
        setInvoicePrint(invoiceData) // FIX: dùng đúng state
        setTimeout(() => {
          setInvoicePrint(null)
          onOpenChange(false)
        }, 1000)
        return
      }

      if (mode === 'quotation') {
        const baseQuotation = buildQuotationData(invoiceData)
        setQuotationData(baseQuotation)
        setQuotationFileName(`${invoiceData.code || 'quotation'}.pdf`)
        setShowQuotationPreview(true)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  // =========================
  // Memo helpers for UI labels
  // =========================
  const selectedProductOptions = useMemo(() => {
    return selectedProducts.map((p) => ({
      label: `${p.name} - ${moneyFormat(getDisplayPrice(p))} - (ĐVT gốc: ${getBaseUnitName(p)})`,
      value: p.id,
    }))
  }, [selectedProducts, getDisplayPrice, getBaseUnitName])

  const productOptions = useMemo(() => {
    return (products || []).map((p) => ({
      label: `${p.name} - ${moneyFormat(p.price)} - (ĐVT gốc: ${getBaseUnitName(p)})`,
      value: p.id,
    }))
  }, [products, getBaseUnitName])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <PlusIcon className="mr-2 h-4 w-4" />
              Cập nhật
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="md:h-auto md:max-w-full">
          <DialogHeader>
            <DialogTitle>Cập nhật hóa đơn {localInvoiceData?.code}</DialogTitle>
            <DialogDescription>
              Hoàn thành các thông tin dưới đây để cập nhật hóa đơn
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
            <Form {...form}>
              <form id="update-invoice">
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* LEFT */}
                  <div className="flex-1 space-y-6 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold">Thông tin đơn</h2>
                      <Can permission={'CREATE_PRODUCT'}>
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={() => setShowCreateProductDialog(true)}
                        >
                          <PlusIcon className="mr-2 size-4" />
                          Thêm sản phẩm
                        </Button>
                      </Can>
                    </div>

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
                              <TableHead className="min-w-24">ĐVT</TableHead>
                              <TableHead className="min-w-20">Giá</TableHead>
                              <TableHead className="min-w-20">Thuế</TableHead>
                              <TableHead className="min-w-28">
                                Giảm giá
                              </TableHead>
                              <TableHead className="min-w-28">Tổng</TableHead>
                              <TableHead className="min-w-24">BH</TableHead>
                              <TableHead className="min-w-32">
                                Ghi chú
                              </TableHead>
                              <TableHead className="min-w-40">
                                Hạn dùng
                              </TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {selectedProducts.map((product, index) => {
                              const currentUnitId =
                                selectedUnitIds[product.id] ||
                                getBaseUnitId(product) ||
                                product?.prices?.[0]?.unitId

                              const unitOptions = getUnitOptions(product)

                              const quantity = quantities[product.id] || 1
                              const discount = discounts[product.id] || 0
                              const subTotal = calculateSubTotal(product.id)
                              const taxAmount = calculateTaxForProduct(
                                product.id,
                              )

                              const taxes = product?.prices?.[0]?.taxes || []

                              return (
                                <TableRow key={product.id}>
                                  <TableCell>{index + 1}</TableCell>

                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="font-medium">
                                        {product.name}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                          <strong>ĐVT gốc:</strong>{' '}
                                          {getBaseUnitName(product)}
                                        </span>

                                        {product?.attributes?.length > 0 && (
                                          <span>
                                            {product.attributes
                                              .map(
                                                (a) =>
                                                  `${a.name}: ${a.pivot.value} (${attributes[a.unit]})`,
                                              )
                                              .join(' · ')}
                                          </span>
                                        )}
                                      </div>

                                      {Array.isArray(
                                        product?.unitConversions,
                                      ) &&
                                        product.unitConversions.length > 0 && (
                                          <div className="break-words text-[11px] text-muted-foreground">
                                            Quy đổi:{' '}
                                            {product.unitConversions
                                              .map((c) => {
                                                const f = Number(
                                                  c?.conversionFactor || 0,
                                                )
                                                const u = c?.unit?.name || '—'
                                                // 1 base = f * u
                                                return f > 0
                                                  ? `1 ${getBaseUnitName(product)} = ${f} ${u}`
                                                  : null
                                              })
                                              .filter(Boolean)
                                              .join(' • ')}
                                          </div>
                                        )}
                                    </div>
                                  </TableCell>

                                  <TableCell>
                                    <Input
                                      type="number"
                                      className="h-7 w-16"
                                      value={quantity}
                                      onChange={(e) =>
                                        setQuantities((p) => ({
                                          ...p,
                                          [product.id]: Number(e.target.value),
                                        }))
                                      }
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Input
                                      type="number"
                                      className="h-7 w-16"
                                      value={giveaway[product.id] || 0}
                                      onChange={(e) =>
                                        setGiveaway((p) => ({
                                          ...p,
                                          [product.id]: Number(e.target.value),
                                        }))
                                      }
                                    />
                                  </TableCell>

                                  {/* ĐVT */}
                                  <TableCell>
                                    <Select
                                      value={
                                        currentUnitId
                                          ? String(currentUnitId)
                                          : ''
                                      }
                                      onValueChange={(val) => {
                                        const newUnitId = Number(val)
                                        setSelectedUnitIds((prev) => ({
                                          ...prev,
                                          [product.id]: newUnitId,
                                        }))

                                        // đổi ĐVT thì bỏ override để tự tính lại (align Create)
                                        setPriceOverrides((prev) => {
                                          const next = { ...prev }
                                          delete next[product.id]
                                          return next
                                        })
                                      }}
                                    >
                                      <SelectTrigger className="h-7 w-28">
                                        <SelectValue placeholder="ĐVT" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectGroup>
                                          {unitOptions.map((o) => (
                                            <SelectItem
                                              key={o.unitId}
                                              value={String(o.unitId)}
                                            >
                                              {o.unitName}
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>

                                  {/* Giá theo ĐVT */}
                                  <TableCell className="text-end">
                                    <MoneyInputQuick
                                      value={getDisplayPrice(product) ?? 0}
                                      onChange={(num) =>
                                        setPriceOverrides((prev) => ({
                                          ...prev,
                                          [product.id]: Number(num || 0),
                                        }))
                                      }
                                      className="h-7 w-24"
                                    />
                                  </TableCell>

                                  {/* Thuế */}
                                  <TableCell>
                                    <FormItem>
                                      {taxes.map((tax) => (
                                        <FormItem
                                          key={tax.id}
                                          className="flex items-center space-x-2"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={
                                                selectedTaxes[
                                                  product.id
                                                ]?.includes(tax.id) || false
                                              }
                                              onCheckedChange={(checked) =>
                                                setSelectedTaxes((p) => {
                                                  const list =
                                                    p[product.id] || []
                                                  return {
                                                    ...p,
                                                    [product.id]: checked
                                                      ? [...list, tax.id]
                                                      : list.filter(
                                                        (i) => i !== tax.id,
                                                      ),
                                                  }
                                                })
                                              }
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-normal">
                                            {tax.title}{' '}
                                            <span className="text-destructive">
                                              ({tax.percentage}%)
                                            </span>
                                          </FormLabel>
                                        </FormItem>
                                      ))}
                                    </FormItem>
                                  </TableCell>

                                  {/* Discount */}
                                  <TableCell>
                                    <MoneyInputQuick
                                      value={discount}
                                      onChange={(num) =>
                                        setDiscounts((p) => ({
                                          ...p,
                                          [product.id]: Number(num || 0),
                                        }))
                                      }
                                      className="h-7 w-24"
                                    />
                                  </TableCell>

                                  {/* Total line */}
                                  <TableCell className="text-end">
                                    {moneyFormat(subTotal + taxAmount)}
                                  </TableCell>

                                  {/* Warranty */}
                                  <TableCell className="text-center">
                                    {product?.warrantyPolicy ? (
                                      <div className="flex items-center justify-center gap-2">
                                        <Checkbox
                                          checked={
                                            !!applyWarrantyItems[product.id]
                                          }
                                          onCheckedChange={(checked) =>
                                            setApplyWarrantyItems((p) => ({
                                              ...p,
                                              [product.id]: !!checked,
                                            }))
                                          }
                                        />
                                        <span className="text-[11px] text-muted-foreground">
                                          {product.warrantyPolicy.periodMonths}{' '}
                                          tháng
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-[11px] italic text-muted-foreground">
                                        Không BH
                                      </span>
                                    )}
                                  </TableCell>

                                  {/* Note */}
                                  <TableCell>
                                    <Textarea
                                      rows={1}
                                      className="h-7 w-full"
                                      value={notes[product.id] || ''}
                                      onChange={(e) =>
                                        setNotes((p) => ({
                                          ...p,
                                          [product.id]: e.target.value,
                                        }))
                                      }
                                    />
                                  </TableCell>

                                  {/* Expiry */}
                                  <TableCell>
                                    {product.hasExpiry ? (
                                      <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={
                                              !!applyExpiryItems[product.id]
                                            }
                                            onCheckedChange={(checked) =>
                                              setApplyExpiryItems((p) => ({
                                                ...p,
                                                [product.id]: !!checked,
                                              }))
                                            }
                                          />
                                          <span className="text-xs">
                                            Áp dụng
                                          </span>
                                        </div>

                                        <Input
                                          className="h-7"
                                          placeholder="Tài khoản"
                                          disabled={
                                            !applyExpiryItems[product.id]
                                          }
                                          value={accountName[product.id] || ''}
                                          onChange={(e) =>
                                            setAccountName((p) => ({
                                              ...p,
                                              [product.id]: e.target.value,
                                            }))
                                          }
                                        />

                                        <Popover>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              disabled={
                                                !applyExpiryItems[product.id]
                                              }
                                              className="h-7 w-full justify-start text-left"
                                            >
                                              {productStartDate[product.id]
                                                ? dateFormat(
                                                  productStartDate[
                                                  product.id
                                                  ],
                                                )
                                                : 'Ngày bắt đầu'}
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="p-0">
                                            <DatePicker
                                              mode="single"
                                              selected={
                                                productStartDate[product.id]
                                              }
                                              onSelect={(d) =>
                                                setProductStartDate((p) => ({
                                                  ...p,
                                                  [product.id]: d,
                                                }))
                                              }
                                            />
                                          </PopoverContent>
                                        </Popover>

                                        <div className="flex gap-1">
                                          <Input
                                            type="number"
                                            min={1}
                                            className="h-7 w-20"
                                            disabled={
                                              !applyExpiryItems[product.id]
                                            }
                                            value={
                                              expiryDurations[product.id]
                                                ?.value || 1
                                            }
                                            onChange={(e) =>
                                              setExpiryDurations((p) => ({
                                                ...p,
                                                [product.id]: {
                                                  ...(p[product.id] || {
                                                    value: 1,
                                                    unit: 'month',
                                                  }),
                                                  value: Number(e.target.value),
                                                },
                                              }))
                                            }
                                          />
                                          <Select
                                            disabled={
                                              !applyExpiryItems[product.id]
                                            }
                                            value={
                                              expiryDurations[product.id]
                                                ?.unit || 'month'
                                            }
                                            onValueChange={(v) =>
                                              setExpiryDurations((p) => ({
                                                ...p,
                                                [product.id]: {
                                                  ...(p[product.id] || {
                                                    value: 1,
                                                    unit: 'month',
                                                  }),
                                                  unit: v,
                                                },
                                              }))
                                            }
                                          >
                                            <SelectTrigger className="h-7">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="month">
                                                Tháng
                                              </SelectItem>
                                              <SelectItem value="year">
                                                Năm
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs italic text-muted-foreground">
                                        Không áp dụng
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    <MultipleSelector
                      hidePlaceholderWhenSelected
                      onChange={handleSelectProduct}
                      options={productOptions}
                      value={selectedProductOptions}
                      placeholder="Tìm kiếm sản phẩm"
                    />

                    <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                      {/* NOTE tổng */}
                      <div className="flex flex-col space-y-4">
                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem className="mb-2 space-y-1">
                              <FormLabel>Ghi chú tổng hóa đơn</FormLabel>
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

                      {/* SUMMARY */}
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <div className="text-sm font-bold">Tạm tính:</div>
                          <div className="text-sm">
                            {moneyFormat(handleCalculateSubTotalInvoice())}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <div className="text-sm font-bold">Thuế:</div>
                          <div className="text-sm">
                            {moneyFormat(calculateTotalTax())}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <div className="text-sm font-bold">Giảm giá:</div>
                          <div className="text-sm">
                            {moneyFormat(calculateTotalDiscount())}
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <div className="text-sm font-bold">
                            Phí vận chuyển:
                          </div>
                          <div className="text-sm">
                            {moneyFormat(otherExpenses.price)}
                          </div>
                        </div>

                        <div className="text-sm font-bold text-primary">
                          <Button
                            onClick={() =>
                              setShowCreateOtherExpensesDialog(true)
                            }
                            type="button"
                            variant="outline"
                            className="h-6 border border-primary"
                          >
                            <IconPencil className="h-4 w-4" /> Cập nhật phí vận
                            chuyển
                          </Button>
                        </div>

                        <div className="flex justify-between border-t py-2">
                          <div className="text-sm font-bold">Tổng số tiền:</div>
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

                  {/* RIGHT */}
                  <div className="w-full rounded-lg border p-4 lg:w-72">
                    <div className="flex items-center justify-between">
                      <h2 className="py-2 text-lg font-semibold">Khách hàng</h2>

                      {selectedCustomer && (
                        <div
                          className="h-5 w-5 cursor-pointer text-destructive"
                          title="Chọn lại"
                          onClick={() => {
                            setSelectedCustomer(null)
                            form.setValue('customerId', null)
                          }}
                        >
                          <X className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    {selectedCustomer ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://ui-avatars.com/api/?bold=true&background=random&name=${selectedCustomer.name}`}
                            />
                            <AvatarFallback>KH</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {selectedCustomer.name}
                            </div>
                            <div className="text-sm text-primary">
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
                              title="Cập nhật khách hàng"
                            >
                              <Pencil className="h-4 w-4" />
                            </a>
                          </div>

                          <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center text-primary">
                              <MobileIcon className="mr-2 h-4 w-4" />
                              <a href={`tel:${selectedCustomer.phone}`}>
                                {selectedCustomer.phone || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-muted-foreground">
                              <Mail className="mr-2 h-4 w-4" />
                              <a href={`mailto:${selectedCustomer.email}`}>
                                {selectedCustomer.email || 'Chưa cập nhật'}
                              </a>
                            </div>

                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="mr-2 h-4 w-4" />
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
                              <FormLabel required>Khách hàng</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        'w-full justify-between font-normal',
                                        !field.value && 'text-muted-foreground',
                                      )}
                                    >
                                      {field.value
                                        ? customers.find(
                                          (c) =>
                                            c.id.toString() === field.value,
                                        )?.name
                                        : 'Chọn khách hàng'}
                                      <CaretSortIcon className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>

                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <Command>
                                    <CommandInput placeholder="Tìm kiếm..." />
                                    <CommandEmpty>Không tìm thấy</CommandEmpty>
                                    <CommandGroup>
                                      <CommandList>
                                        {customers.map((customer) => (
                                          <CommandItem
                                            key={customer.id}
                                            onSelect={() => {
                                              field.onChange(
                                                customer.id.toString(),
                                              )
                                              setSelectedCustomer(customer)
                                            }}
                                          >
                                            {customer.name} - {customer.phone}
                                            <CheckIcon
                                              className={cn(
                                                'ml-auto h-4 w-4',
                                                customer.id.toString() ===
                                                  field.value
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
                          className="my-3 flex cursor-pointer items-center text-sm text-primary hover:underline"
                          onClick={() => setShowCreateCustomerDialog(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm khách hàng mới
                        </div>
                      </>
                    )}

                    <Separator className="my-4" />

                    {/* RECEIPT */}
                    <div
                      className="my-3 flex cursor-pointer items-center text-sm text-primary hover:underline"
                      onClick={() => setIsCreateReceipt((p) => !p)}
                    >
                      <IconReceipt2 className="mr-2 h-4 w-4" />
                      Tạo phiếu thu
                    </div>

                    {isCreateReceipt && (
                      <div className="mb-4 space-y-3">
                        <FormField
                          control={form.control}
                          name="totalAmount"
                          render={() => (
                            <FormItem>
                              <FormLabel required>Số tiền thu</FormLabel>
                              <FormControl>
                                <Input
                                  className="text-end"
                                  value={moneyFormat(
                                    totalAmount || calculateTotalAmount(),
                                  )}
                                  onChange={(e) => {
                                    const raw = e.target.value.replace(
                                      /\D/g,
                                      '',
                                    )
                                    setTotalAmount(raw)
                                    form.setValue('totalAmount', raw)
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel required>
                                Phương thức thanh toán
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {paymentMethods.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                      <div className="flex items-center gap-2">
                                        <m.icon className="h-4 w-4 text-primary" />
                                        {m.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        {/* bankAccount chỉ phụ thuộc transfer (align CreateInvoiceDialog) */}
                        {normalizePaymentMethod(form.watch('paymentMethod')) ===
                          'transfer' && (
                            <FormField
                              control={form.control}
                              name="bankAccount"
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel required>
                                    Tài khoản nhận tiền
                                  </FormLabel>

                                  <Select
                                    onValueChange={(value) => {
                                      const selectedBank = banks.find(
                                        (b) => b.accountNumber === value,
                                      )
                                      field.onChange(selectedBank || null)
                                    }}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Chọn tài khoản ngân hàng" />
                                      </SelectTrigger>
                                    </FormControl>

                                    <SelectContent>
                                      {banks.map((bank, index) => (
                                        <SelectItem
                                          key={index}
                                          value={bank.accountNumber}
                                        >
                                          <div className="flex flex-col">
                                            <span className="font-medium">
                                              {bank.bankName} –{' '}
                                              {bank.accountNumber}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                              {bank.accountName} ·{' '}
                                              {bank.bankBranch}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                        {/* dueDate KHÔNG phụ thuộc transfer - chỉ hiển thị khi createReceipt */}
                        <FormItem>
                          <FormLabel>Hạn chót đóng tiền</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                {receiptDueDate
                                  ? dateFormat(receiptDueDate)
                                  : 'Chọn ngày'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0">
                              <DatePicker
                                mode="single"
                                selected={receiptDueDate}
                                onSelect={(d) => {
                                  setReceiptDueDate(d || null)
                                  // optional keep in form too
                                  form.setValue(
                                    'dueDate',
                                    d
                                      ? new Date(d).toISOString().slice(0, 10)
                                      : '',
                                  )
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>

                        <FormField
                          control={form.control}
                          name="paymentNote"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ghi chú thanh toán</FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* SHARING */}
                    <div
                      className="my-3 flex cursor-pointer items-center text-sm text-primary hover:underline"
                      onClick={() => setIsSharing(true)}
                    >
                      <IconUserShare className="mr-2 h-4 w-4" />
                      Tỉ lệ hưởng doanh số
                    </div>

                    {isSharing && (
                      <>
                        <FormField
                          control={form.control}
                          name="revenueSharing.ratio"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Chọn mức</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  className="space-y-1"
                                >
                                  {sharingRatios?.payload?.map((r, i) => (
                                    <FormItem
                                      key={i}
                                      className="flex items-center space-x-2"
                                    >
                                      <FormControl>
                                        <RadioGroupItem
                                          value={(r.sub / 10).toString()}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {r.main}/{r.sub}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="revenueSharing.userId"
                          render={({ field }) => (
                            <FormItem className="mt-2">
                              <FormLabel>Chọn người</FormLabel>
                              <Select onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {users
                                    .filter((u) => u.id !== authUser?.id)
                                    .map((u) => (
                                      <SelectItem
                                        key={u.id}
                                        value={u.id.toString()}
                                      >
                                        {u.fullName}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <div
                          className="mt-3 flex justify-end text-sm text-destructive"
                          onClick={() => {
                            setIsSharing(false)
                            form.setValue('revenueSharing', null)
                          }}
                        >
                          <div className="flex cursor-pointer items-center gap-1 rounded-md border border-destructive px-2 py-1">
                            <IconCircleX className="h-4 w-4" />
                            Hủy
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>

            <Button
              disabled={!selectedCustomer || !selectedProducts.length}
              onClick={form.handleSubmit((d) => onSubmit(d, 'quotation'))}
            >
              <IconFileTypePdf className="mr-2 h-4 w-4" />
              Cập nhật & In báo giá
            </Button>

            <Button
              disabled={!selectedCustomer || !selectedProducts.length}
              onClick={form.handleSubmit((d) => onSubmit(d, 'invoice'))}
            >
              <IconFileTypePdf className="mr-2 h-4 w-4" />
              Cập nhật & In
            </Button>

            <Button
              disabled={!selectedCustomer || !selectedProducts.length}
              onClick={form.handleSubmit((d) => onSubmit(d, 'update'))}
            >
              <IconDatabasePlus className="mr-2 h-4 w-4" />
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {invoicePrint && generalInformation && (
        <PrintInvoiceView invoice={invoicePrint} setting={generalInformation} />
      )}

      {quotationData && (
        <QuotationPreviewDialog
          open={showQuotationPreview}
          onOpenChange={setShowQuotationPreview}
          initialData={quotationData}
          onConfirm={async (finalData) => {
            await exportQuotationPdf(finalData, quotationFileName)
            toast.success('Đã xuất báo giá')
            setShowQuotationPreview(false)
            onOpenChange?.(false)
          }}
        />
      )}

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

      {showCreateOtherExpensesDialog && (
        <CreateOtherExpenses
          open={showCreateOtherExpensesDialog}
          onOpenChange={setShowCreateOtherExpensesDialog}
          otherExpenses={otherExpenses}
          setOtherExpenses={setOtherExpenses}
          showTrigger={false}
        />
      )}

      {showCreateProductDialog && (
        <CreateProductDialog
          open={showCreateProductDialog}
          onOpenChange={setShowCreateProductDialog}
          showTrigger={false}
        />
      )}
    </>
  )
}

export default UpdateInvoiceDialog
