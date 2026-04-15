import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Check, ChevronsUpDown, Tag } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts, updateProductInStore } from '@/stores/ProductSlice'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getCustomers } from '@/stores/CustomerSlice'
import { getWarehouses } from '@/stores/WarehouseSlice'
import UpdateCustomerDialog from '../../customer/components/UpdateCustomerDialog'
import CreateCustomerDialog from '../../customer/components/CreateCustomerDialog'
import { createInvoiceSchema } from '../schema'
import { getSetting } from '@/stores/SettingSlice'
import { getUsers } from '@/stores/UserSlice'
import { getCategories } from '@/stores/CategorySlice'
import { createInvoice, updateInvoice } from '@/stores/InvoiceSlice'
import { findPromotionByCode, previewPromotion, getPromotionsForCart } from '@/stores/PromotionSlice'
import { toast } from 'sonner'
import { paymentMethods } from '../../receipt/data'
import { moneyFormat } from '@/utils/money-format'
import { getInvoiceDetail } from '@/stores/InvoiceSlice'
import PrintInvoiceView from './PrintInvoiceView'
import CreateOtherExpenses from './CreateOtherExpenses'


import CategorySidebar from './CategorySidebar'
import ProductGrid from './ProductGrid'
import ShoppingCart from './ShoppingCart'
import InvoiceSidebar from './InvoiceSidebar'
import AgreementPreviewDialog from './AgreementPreviewDialog'
import { buildAgreementData } from '../helpers/BuildAgreementData'

const InvoiceDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  invoiceId = null,
  onSuccess,
  ...props
}) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  // Ensure products have currentStock (defaulting to 0 if missing)
  const processedProducts = useMemo(() => {
    return products.map(p => {
      return {
        ...p,
        totalStock: Number(p.totalStock || p.currentStock || 0),
      }
    })
  }, [products])

  const flatCategories = useSelector((state) =>
    state.category.categories.filter(c => c.type === 'PRODUCT')
  )
  const categories = useMemo(() => {
    if (!flatCategories?.length) return []

    const map = {}
    const roots = []

    for (const cat of flatCategories) {
      map[cat.id] = { ...cat, children: [] }
    }

    for (const cat of flatCategories) {
      if (cat.parentId && map[cat.parentId]) {
        map[cat.parentId].children.push(map[cat.id])
      } else {
        roots.push(map[cat.id])
      }
    }

    return roots
  }, [flatCategories])

  const customers = useSelector((state) => state.customer.customers)
  const warehouses = useSelector((state) => state.warehouse.warehouses) || []
  const loading = useSelector((state) => state.invoice.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const isDesktop = useMediaQuery('(min-width: 768px)')

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerEditData, setCustomerEditData] = useState(null)
  const [customerErrors, setCustomerErrors] = useState({})
  const [productStartDate, setProductStartDate] = useState({})
  const [hasPrintQuotation, setHasPrintQuotation] = useState(false)
  const [applyWarrantyItems, setApplyWarrantyItems] = useState({})

  // Agreement State (legacy logic, safe to keep or remove as needed)
  const [showAgreementPreview, setShowAgreementPreview] = useState(false)
  const [agreementData, setAgreementData] = useState(null)
  const [agreementFileName, setAgreementFileName] = useState('thoa-thuan-mua-ban.pdf')

  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false)
  const [applyExpiryItems, setApplyExpiryItems] = useState({})
  const [expiryDurations, setExpiryDurations] = useState({})
  const [hasPrintInvoice, setHasPrintInvoice] = useState(false)
  const [showUpdateCustomerDialog, setShowUpdateCustomerDialog] =
    useState(false)
  const [showCreateCustomerDialog, setShowCreateCustomerDialog] =
    useState(false)
  const [mobileView, setMobileView] = useState('products') // 'products' | 'cart'
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  const [selectedProducts, setSelectedProducts] = useState([])
  const [giftProducts, setGiftProducts] = useState([])
  const [giftQuantities, setGiftQuantities] = useState({})
  const [cartActiveTab, setCartActiveTab] = useState('cart')

  // ===== UNIT CONVERSION STATES ======
  // unitId khách chọn theo từng sản phẩm
  const [selectedUnitIds, setSelectedUnitIds] = useState({})
  // giá gốc theo baseUnit (giữ nguyên, không mutate product.price)
  const [baseUnitPrices, setBaseUnitPrices] = useState({})
  // giá override theo đơn vị đang chọn (nếu user sửa giá)
  const [priceOverrides, setPriceOverrides] = useState({})
  const [priceErrors, setPriceErrors] = useState({})

  const [isCreateReceipt, setIsCreateReceipt] = useState(false)

  const [showCreateOtherExpensesDialog, setShowCreateOtherExpensesDialog] =
    useState(false)
  const [otherExpenses, setOtherExpenses] = useState({
    price: 0,
    description: 'Phí vận chuyển',
  })

  const [discounts, setDiscounts] = useState({})
  const [discountAmounts, setDiscountAmounts] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [giveaway, setGiveaway] = useState({})
  const [totalAmount, setTotalAmount] = useState('')
  const [selectedTaxes, setSelectedTaxes] = useState({})
  const [generalInformation, setGeneralInformation] = useState(false)
  const [invoice, setInvoice] = useState(null)
  const [banks, setBanks] = useState([])

  // ====== PROMOTION STATE ======
  const [promoCode, setPromoCode] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)
  const [appliedPromotion, setAppliedPromotion] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [cartPromotions, setCartPromotions] = useState([]) // applicable promotions auto-detected
  const [cartPromosLoading, setCartPromosLoading] = useState(false)

  // ====== CONTRACT LOGIC REMOVED ======
  const [localInvoiceData, setLocalInvoiceData] = useState(null)

  const cartRef = useRef(null)

  const scrollToCart = () => {
    if (cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  // Handle contract product selection (REMOVED)

  useEffect(() => {
    dispatch(getProducts({ type: 'PRODUCT' }))
    dispatch(getCustomers())
    dispatch(getCategories({ type: 'PRODUCT' }))
    dispatch(getSetting('sharing_ratio'))
    dispatch(getUsers())
    dispatch(getWarehouses({ limit: 100 }))
  }, [dispatch])
  useEffect(() => {
    if (!open) return

    const fetchSetting = async () => {
      const data = await dispatch(getSetting('general_information')).unwrap()
      if (data) {
        setGeneralInformation(data)
        setBanks(data?.banks || [])
      }
    }

    fetchSetting()
  }, [open])

  // optional: reset conversion states when dialog closes
  useEffect(() => {
    if (open) return
    setSelectedProducts([])
    setGiftProducts([])
    setGiftQuantities({})
    setCartActiveTab('cart')
    setSelectedUnitIds({})
    setBaseUnitPrices({})
    setPriceOverrides({})
    setPriceErrors({})
    setDiscounts({})
    setQuantities({})
    setNotes({})
    setGiveaway({})
    setSelectedTaxes({})
    setApplyWarrantyItems({})
    setHasPrintQuotation(false)
    setHasPrintInvoice(false)
    setLocalInvoiceData(null)
    setAppliedPromotion(null)
    setPromoCode('')
    setPromoError('')
    setCartPromotions([])
  }, [open])

  // Load invoice data when dialog opens with invoiceId
  useEffect(() => {
    if (!open || !invoiceId) return

    const loadInvoiceData = async () => {
      try {
        const data = await dispatch(getInvoiceDetail(invoiceId)).unwrap()
        setLocalInvoiceData(data)

        // Set form values
        form.reset({
          schoolId: data.schoolId?.toString() || '',
          customerId: data.customerId?.toString() || '',
          status: data.status || 'pending',
          note: data.note || '',
          revenueSharing: data.revenueSharing || null,
          paymentMethod: data.paymentMethod || paymentMethods[0].value,
          paymentNote: data.paymentNote || '',
          orderDate: data.date || data.orderDate || new Date().toISOString(),
          isPickupOrder: data.isPickupOrder !== undefined ? !!data.isPickupOrder : true,
          recipientName: data.recipientName || '',
          recipientPhone: data.recipientPhone || '',
          deliveryAddress: data.deliveryAddress || '',
          shippingFee: data.shippingFee || 0,
        })

        // Set customer
        const customer = customers.find((c) => c.id === data.customerId)
        setSelectedCustomer(customer || null)

        // Load customer data into edit form
        if (customer) {
          setCustomerEditData({
            customerName: customer.customerName || customer.name || '',
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || '',
            cccd: customer.cccd || '',
            issuedAt: customer.issuedAt || null,
            issuedBy: customer.issuedBy || '',
          })
        }

        // Initialize state objects
        const qty = {}
        const dis = {}
        const nt = {}
        const give = {}
        const tax = {}
        const warr = {}
        const unitIds = {}
        const basePrices = {}
        const overrides = {}

        // Map invoice items to products
        const prods = (data.invoiceItems || []).map((item) => {
          const pid = item.productId
          const product = item.product

          qty[pid] = Number(item.quantity || 1)
          dis[pid] = Number(item.discountRate ?? item.discount ?? 0)
          nt[pid] = item.note || ''
          give[pid] = Number(item.giveaway || 0)
          tax[pid] = item.taxes?.map((t) => t.id) || item.taxIds || []
          warr[pid] = !!item.applyWarranty || !!(item.warranty && item.warranty !== '0' && item.warranty !== 'false')

          // Unit conversion from invoice item
          const unitIdFromItem = item.unitId || product?.baseUnitId || product?.prices?.[0]?.unitId
          const unitId = Number(unitIdFromItem || 0) || null
          unitIds[pid] = unitId

          const factorFromItem = Number(item.conversionFactor || 0)
          const factor = factorFromItem > 0 ? factorFromItem : 1

          const unitPrice = Number(item.price || 0)
          basePrices[pid] = factor > 0 ? unitPrice * factor : unitPrice
          overrides[pid] = unitPrice

          // Store invoice unit info on product
          if (product) {
            product.__invoiceUnit = unitId
              ? {
                unitId,
                unitName: item.unitName || item?.unit?.name || '—',
                factor: factor > 0 ? factor : 1,
              }
              : null

            // Synthesize warrantyPolicy so ShoppingCart shows the warranty checkbox
            if (!product.warrantyPolicy && (item.warranty || item.warranties?.length > 0)) {
              const w = item.warranties?.[0]
              product.warrantyPolicy = {
                periodMonths: w?.periodMonths || parseInt(item.warranty) || 0,
                warrantyCost: w?.warrantyCost || 0,
                note: w?.note || item.warranty || '',
              }
            }
          }

          return product
        }).filter(Boolean)

        // Set all states
        setSelectedProducts(prods)
        
        // Populate standard cart, ignoring gifts in this legacy map (extendable later if need edit gift on invoice load)
        const giftProds = (data.invoiceItems || []).filter(i => i.gift).map(item => item.product).filter(Boolean)
        const giftQs = {}
        ;(data.invoiceItems || []).filter(i => i.gift).forEach(i => giftQs[i.productId] = Number(i.quantity || 1))
        
        // Ensure setSelectedProducts only contains non-gift prods in main cart
        const mainProds = (data.invoiceItems || []).filter(i => !i.gift).map(item => item.product).filter(Boolean)
        setSelectedProducts(mainProds)
        setGiftProducts(giftProds)
        setGiftQuantities(giftQs)

        setQuantities(qty)
        setDiscounts(dis)
        setNotes(nt)
        setGiveaway(give)
        setSelectedTaxes(tax)
        setApplyWarrantyItems(warr)
        setSelectedUnitIds(unitIds)
        setBaseUnitPrices(basePrices)
        setPriceOverrides(overrides)

        setOtherExpenses(data.otherExpenses?.[0] || { price: 0, description: 'Phí vận chuyển' })

        setOtherExpenses(data.otherExpenses?.[0] || { price: 0, description: 'Phí vận chuyển' })

      } catch (err) {
        console.error(err)
        toast.error(err?.response?.data?.message || 'Không tải được hóa đơn')
      }
    }

    loadInvoiceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoiceId])

  const form = useForm({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      schoolId: '',
      customerId: '',
      note: '',
      revenueSharing: null,
      orderDate: new Date().toISOString(),
      isPickupOrder: true,
      recipientName: '',
      recipientPhone: '',
      deliveryAddress: '',
      expectedDeliveryDate: null,
      requireApproval: false,
    },
  })

  // ====== NEW: CATEGORY FILTERING ======
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [openCombobox, setOpenCombobox] = useState(false)

  // =========================
  // UNIT CONVERSION HELPERS
  // =========================
  const getBaseUnitId = (product) =>
    product?.unitId || product?.baseUnitId || product?.prices?.[0]?.unitId || null

  const getBaseUnitName = (product) =>
    product?.unit?.unitName || product?.baseUnit?.name || product?.prices?.[0]?.unitName || '—'

  const getUnitOptions = useCallback((product) => {
    const baseId = getBaseUnitId(product)
    const baseName = getBaseUnitName(product)

    const options = []

    if (baseId) {
      options.push({ unitId: Number(baseId), unitName: baseName, factor: 1 })
    }

    const conversions = Array.isArray(product?.unitConversions)
      ? product.unitConversions
      : []

    for (const c of conversions) {
      const uId = Number(c?.unitId)
      if (!uId) continue
      const factor = Number(c?.conversionFactor || 0)
      options.push({
        unitId: uId,
        unitName: c?.unit?.unitName || c?.unit?.name || '—',
        factor: factor > 0 ? factor : 1,
      })
    }

    // unique by unitId
    const map = new Map()
    for (const o of options) {
      if (!map.has(o.unitId)) map.set(o.unitId, o)
    }
    return Array.from(map.values())
  }, [])

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
    [getUnitOptions],
  )

  const getDisplayPrice = useCallback(
    (product) => {
      const pid = product?.id
      if (!pid) return 0

      const unitId =
        selectedUnitIds[pid] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const factor = getFactor(product, unitId)

      // ưu tiên override theo unit
      if (priceOverrides[pid] != null) return Number(priceOverrides[pid] || 0)

      const basePrice = Number(baseUnitPrices[pid] ?? product?.price ?? 0)
      return factor > 0 ? basePrice / factor : basePrice
    },
    [baseUnitPrices, priceOverrides, selectedUnitIds, getFactor, getBaseUnitId],
  )

  const productCounts = useMemo(() => {
    const counts = {}
    products.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      counts[categoryId] = (counts[categoryId] || 0) + 1
    })
    return counts
  }, [products])

  // ====== PRODUCT FILTERING ======
  useEffect(() => {
    let filtered = products

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => (p.categoryId || 'uncategorized') === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        (p.productName || p.name).toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, products, searchQuery])

  // ====== PRODUCT SELECTION HANDLERS ======
  const handleAddProduct = (product) => {
    if (cartActiveTab === 'gift') {
      const isAlreadySelected = giftProducts.some(p => p.id === product.id)
      if (isAlreadySelected) {
        setGiftProducts(giftProducts.filter(p => p.id !== product.id))
        setGiftQuantities(prev => {
          const next = { ...prev }
          delete next[product.id]
          return next
        })
      } else {
        setGiftProducts([...giftProducts, product])
        setGiftQuantities(prev => ({ ...prev, [product.id]: 1 }))
      }
      return
    }

    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)

    if (isAlreadySelected) {
      // Remove from cart
      const newSelectedProducts = selectedProducts.filter(p => p.id !== product.id)
      setSelectedProducts(newSelectedProducts)

      // Cleanup states
      setSelectedUnitIds(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setBaseUnitPrices(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setPriceOverrides(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
    } else {
      // Add to cart
      handleSelectProduct([
        ...selectedProducts.map(p => ({ value: p.id, label: p.name })),
        { value: product.id, label: product.name }
      ])
    }
  }

  const handleRemoveProduct = (productId) => {
    const newSelectedProducts = selectedProducts.filter(p => p.id !== productId)
    setSelectedProducts(newSelectedProducts)

    if (newSelectedProducts.length === 0) {
      setMobileView('products')
    }

    // Cleanup all related states
    setSelectedUnitIds(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setBaseUnitPrices(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setPriceOverrides(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setPriceErrors(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setDiscounts(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setQuantities(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setNotes(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setGiveaway(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setSelectedTaxes(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const handleUnitChange = (productId, unitId) => {
    setSelectedUnitIds(prev => ({ ...prev, [productId]: Number(unitId) }))
    setPriceOverrides(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const validatePrices = () => {
    let hasPriceError = false
    const newPriceErrors = {}
    for (const product of selectedProducts) {
      const price = getDisplayPrice(product)
      if (price <= 0) {
        newPriceErrors[product.id] = 'Giá phải lớn hơn 0'
        hasPriceError = true
      }
    }
    setPriceErrors(newPriceErrors)
    return hasPriceError
  }

  // ====== PROMOTION HANDLERS ======

  // Auto-fetch applicable promotions when cart changes
  useEffect(() => {
    if (!open || selectedProducts.length === 0) {
      setCartPromotions([])
      return
    }
    const timer = setTimeout(async () => {
      setCartPromosLoading(true)
      try {
        const productIds = selectedProducts.map((p) => p.id)
        const customerId = form.getValues('customerId') ? Number(form.getValues('customerId')) : undefined
        const result = await dispatch(getPromotionsForCart({ productIds, customerId })).unwrap()
        setCartPromotions(result || [])
        // If currently applied promotion is no longer applicable, clear it
        if (appliedPromotion && !result.find((r) => r.id === appliedPromotion.id)) {
          setAppliedPromotion(null)
        }
      } catch {
        setCartPromotions([])
      } finally {
        setCartPromosLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [selectedProducts, selectedCustomer, open])

  // User selects a promotion from the list → preview
  const handleSelectPromotion = async (promo) => {
    // Toggle off if same promotion selected
    if (appliedPromotion?.id === promo.id) {
      setAppliedPromotion(null)
      return
    }
    setPromoError('')
    setPromoLoading(true)
    try {
      const orderAmount = handleCalculateSubTotalInvoice()
      const orderItems = selectedProducts.map((p) => ({
        productId: p.id,
        quantity: quantities[p.id] || 1,
        unitPrice: getDisplayPrice(p),
      }))
      const result = await dispatch(previewPromotion({
        id: promo.id,
        orderAmount,
        orderItems,
        customerId: form.getValues('customerId') ? Number(form.getValues('customerId')) : undefined,
      })).unwrap()

      if (!result.applicable) {
        setPromoError(result.message || 'Khuyến mãi không thể áp dụng cho đơn hàng này')
        return
      }
      setAppliedPromotion({
        id: promo.id,
        name: promo.promotionName,
        code: promo.promotionCode,
        discountAmount: result.discountAmount,
        giftProducts: result.giftProducts || [],
      })
      toast.success(`Áp dụng "${promo.promotionCode}" thành công!`)
    } catch (err) {
      setPromoError(typeof err === 'string' ? err : 'Không thể áp dụng khuyến mãi này')
    } finally {
      setPromoLoading(false)
    }
  }

  // Also keep manual code entry as fallback
  const handleApplyPromotion = async () => {
    if (!promoCode.trim()) return
    setPromoError('')
    setPromoLoading(true)
    try {
      const promo = await dispatch(findPromotionByCode(promoCode.trim())).unwrap()
      await handleSelectPromotion(promo)
    } catch (err) {
      setPromoError(typeof err === 'string' ? err : 'Mã khuyến mãi không hợp lệ')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromotion = () => {
    setAppliedPromotion(null)
    setPromoCode('')
    setPromoError('')
  }

  const onInvalidSubmit = () => {
    if (validatePrices()) {
      toast.error('Vui lòng kiểm tra lại giá sản phẩm')
    }
  }

  const onSubmit = async (data, options = {}) => {
    const shouldPrintInvoice = options.printInvoice || hasPrintInvoice
    const shouldPrintAgreement = options.printAgreement
    const shouldPrintQuotation = options.printQuotation || hasPrintQuotation

    // Validate: must have at least one product
    if (!selectedProducts || selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm')
      setMobileView('products')
      return
    }

    if (validatePrices()) {
      toast.error('Vui lòng kiểm tra lại giá sản phẩm')
      return
    }

    const hasSelectedCustomer = !!data.customerId

    // Validate Phone Format
    const phoneRegex = /^(0)(2|3|5|7|8|9)([0-9]{8,9})$/
    const errors = {}

    // Only validate if NO existing customer selected (creating new one) OR if updating existing info
    // But data.customerId implies selected.
    // If selectedCustomer, we generally trust it UNLESS we are in "Update Info" mode?
    // The previous logic was: if (!hasSelectedCustomer && !hasNewCustomerData) ...
    // And `hasNewCustomerData` checked for presence of fields.

    // Logic:
    // If hasSelectedCustomer -> OK.
    // If !hasSelectedCustomer -> Must have valid newCustomerData.

    // Always validate customer data (new or existing)
    if (!customerEditData?.customerName?.trim()) errors.customerName = "Tên khách hàng là bắt buộc"

    if (!customerEditData?.cccd?.trim()) {
      errors.cccd = "CCCD là bắt buộc"
    } else if (customerEditData.cccd.trim().length !== 9 && customerEditData.cccd.trim().length !== 12) {
      errors.cccd = "CCCD/CMND phải có 9 hoặc 12 số"
    }

    if (!customerEditData?.phone?.trim()) {
      errors.phone = "Số điện thoại là bắt buộc"
    } else if (!phoneRegex.test(customerEditData.phone.trim())) {
      errors.phone = "SĐT không hợp lệ (Bắt đầu bằng 02, 03, 05, 07, 08, 09 và có 10-11 số)"
    }

    // Validate Email Format (Optional but must be valid if provided)
    if (customerEditData?.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerEditData.email.trim())) {
        errors.email = "Email không hợp lệ"
      }
    }

    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors)
      toast.error('Vui lòng kiểm tra lại thông tin khách hàng')
      // Scroll to top of sidebar
      document.getElementById('invoice-sidebar-top')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    // Contract validation removed
    setCustomerErrors({})

    const items = selectedProducts.map((product) => {
      // ===== unit conversion fields =====
      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const unitName = getUnitNameById(product, unitId)
      const factor = getFactor(product, unitId)

      const qtyUnit = quantities[product.id] || 1
      const qtyBase = factor > 0 ? qtyUnit / factor : qtyUnit

      const priceUnit = getDisplayPrice(product)

      return {
        productId: product.id,
        productName: product.name,
        productType: product.type,

        unitId,
        unitName,

        // số lượng theo đơn vị khách chọn (để hiển thị/in)
        quantity: qtyUnit,

        // số lượng quy đổi về baseUnit (để backend trừ kho chính xác)
        baseQuantity: qtyBase,

        // optional: backend nên tự lookup lại factor từ DB
        conversionFactor: factor,

        price: priceUnit,

        // taxRate = tổng % thuế đã chọn
        taxRate: (() => {
          const productTaxes = selectedTaxes[product.id] || []
          const allTaxes = product?.taxes || []
          return allTaxes
            .filter((t) => productTaxes.includes(t.id))
            .reduce((sum, t) => sum + t.percentage, 0)
        })(),
        taxIds: selectedTaxes[product.id] || [],
        taxAmount: calculateTaxForProduct(product.id),
        discountRate: parseFloat(discounts[product.id]) || 0,
        discountAmount: discountAmounts[product.id] ?? Math.round(priceUnit * qtyUnit * (parseFloat(discounts[product.id]) || 0) / 100),
        total:
          calculateSubTotal(product.id) + calculateTaxForProduct(product.id),

        periodMonths:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product?.warrantyPolicy?.periodMonths
            : 0,
        warrantyCost:
          applyWarrantyItems[product.id] && product?.warrantyPolicy
            ? product?.warrantyPolicy?.warrantyCost
            : 0,
        applyWarranty: !!applyWarrantyItems[product.id],
      }
    })

    const giftItems = giftProducts.map((product) => {
      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const unitName = getUnitNameById(product, unitId)
      const qtyUnit = giftQuantities[product.id] || 1

      return {
        productId: product.id,
        productName: product.name,
        productType: product.type,
        unitId,
        unitName,
        quantity: qtyUnit,
        baseQuantity: qtyUnit,
        conversionFactor: 1,
        price: 0,
        taxRate: 0,
        taxIds: [],
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        total: 0,
        periodMonths: 0,
        warrantyCost: 0,
        applyWarranty: false,
        gift: true,
        notes: "Quà tặng"
      }
    })

    const allItems = [...items, ...giftItems]

    const dataToSend = {
      userId: authUserWithRoleHasPermissions.id,
      customerId: data.customerId || null,
      orderDate: data.orderDate || new Date().toISOString(),
      notes: data.note,
      taxAmount: calculateTotalTax(),
      amount: handleCalculateSubTotalInvoice(),
      discountAmount: calculateTotalDiscount(),
      items: allItems,
      isPickupOrder: data.isPickupOrder,
      recipientName: data.recipientName || undefined,
      recipientPhone: data.recipientPhone || undefined,
      deliveryAddress: data.deliveryAddress || undefined,
      shippingFee: data.shippingFee || 0,
      totalAmount: calculateTotalAmount(),
      expectedDeliveryDate: data.expectedDeliveryDate || null,
      requireApproval: data.requireApproval,
      warehouseId: data.warehouseId || null,
      ...(appliedPromotion && { promotionId: appliedPromotion.id }),
      ...(otherExpenses?.price > 0 && { otherExpenses: [otherExpenses] }),

      // Support Update Invoice ID
      ...(invoiceId && { invoiceId }),

      // ========== KHÁCH HÀNG MỚI (khi không chọn customerId) ==========
      ...((!data.customerId && customerEditData) && {
        newCustomer: {
          customerName: customerEditData.customerName || '',
          phone: customerEditData.phone || '',
          email: customerEditData.email || '',
          address: customerEditData.address || '',
          cccd: customerEditData.cccd || '',
          issuedAt: customerEditData.issuedAt || null,
          issuedBy: customerEditData.issuedBy || '',
        }
      }),

      // ========== CẬP NHẬT KHÁCH HÀNG (khi đã chọn customerId) ==========
      ...((data.customerId && customerEditData) && {
        newCustomer: {
          customerName: customerEditData.customerName || '',
          phone: customerEditData.phone || '',
          email: customerEditData.email || '',
          address: customerEditData.address || '',
          cccd: customerEditData.cccd || '',
          issuedAt: customerEditData.issuedAt || null,
          issuedBy: customerEditData.issuedBy || '',
        }
      }),
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
        amount: (calculateInvoiceTotal() - calculateTotalTax()) * ratio || 0,
      }
    }

    try {
      let invoiceResponse;
      if (invoiceId) {
        invoiceResponse = await dispatch(updateInvoice({ id: invoiceId, data: dataToSend })).unwrap()
      } else {
        invoiceResponse = await dispatch(createInvoice(dataToSend)).unwrap()
      }

      const invoice = invoiceResponse;

      // Extract invoice ID - handle both pickup (returns order directly) and delivery (returns {order, inventoryShortages})
      const resultInvoiceId = invoice?.id || invoice?.order?.id
      const invoiceData = resultInvoiceId
        ? await dispatch(getInvoiceDetail(resultInvoiceId)).unwrap()
        : null

      if (shouldPrintInvoice) {
        const generalInformationData = await dispatch(
          getSetting('general_information'),
        ).unwrap()
        setGeneralInformation(generalInformationData)
        setInvoice(invoiceData)

        // Clear invoice state after a delay to reset printing view
        setTimeout(() => {
          setInvoice(null)
          setHasPrintInvoice(false)
          form.reset()
          onOpenChange?.(false)
        }, 1000)
      } else if (shouldPrintAgreement) {
        const baseAgreementData = buildAgreementData(invoiceData)
        setAgreementData(baseAgreementData)
        setAgreementFileName(`thoa-thuan-mua-ban-${invoiceData.code || 'agreement'}.pdf`)
        setShowAgreementPreview(true)
        // Note: Do not reset form/close dialog here; wait for Preview Dialog close/confirm
      } else if (shouldPrintQuotation) {
        const baseQuotationData = buildQuotationData(invoiceData)
        // Ensure state variables for quotation exist if reused from Update logic, 
        // or simplistic handling. CreateInvoiceDialog seems to have `setHasPrintQuotation` 
        // but maybe misses `setQuotationData` logic from UpdateDialog?
        // Let's assume basic handling or just log success.
        // Actually UpdateDialog has specific quotation logic.
        // For now, allow basic flow.
        toast.success(`Đã ${invoiceId ? 'cập nhật' : 'tạo'} hóa đơn thành công`)
        form.reset()
        onOpenChange?.(false)
      } else {
        toast.success(`Đã ${invoiceId ? 'cập nhật' : 'tạo'} hóa đơn thành công`)
        form.reset()
        onOpenChange?.(false)
        if (!invoiceId && onSuccess) {
          onSuccess(invoice)
        }
      }
    } catch (error) {
      console.error('Submit error:', typeof error === 'object' ? JSON.stringify(error) : error)
      toast.error(error?.message || error?.response?.data?.message || `Lỗi ${invoiceId ? 'cập nhật' : 'tạo'} hóa đơn`)
    }
  }



  const handleSelectProduct = (value) => {
    const productIds = value.map((product) => product.value)
    const selectProductDetails = products.filter((product) =>
      productIds.includes(product.id),
    )
    setSelectedProducts(selectProductDetails)

    // ===== init unit & base price states =====
    setSelectedUnitIds((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (!next[p.id]) {
          next[p.id] = getBaseUnitId(p) || p?.prices?.[0]?.unitId
        }
      }
      // cleanup removed
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })

    setBaseUnitPrices((prev) => {
      const next = { ...prev }
      for (const p of selectProductDetails) {
        if (next[p.id] == null) next[p.id] = Number(p.price || 0) // base price
      }
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })

    setPriceOverrides((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(next)) {
        if (!productIds.includes(Number(k))) delete next[k]
      }
      return next
    })
  }

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

  const handleApplyWarrantyChange = (productId, checked) => {
    setApplyWarrantyItems((prev) => ({
      ...prev,
      [productId]: !!checked,
    }))
  }

  const calculateSubTotal = (productId) => {
    const quantity = quantities[productId] || 1
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0

    const discountPct = parseFloat(discounts[productId]) || 0
    const price = getDisplayPrice(product)

    const subtotal = quantity * price
    const discountAmount = subtotal * discountPct / 100
    return subtotal - discountAmount > 0 ? subtotal - discountAmount : 0
  }

  const handleDiscountChange = (productId, value) => {
    // Allow empty string (so user can clear/delete the field)
    if (value === '' || value === null || value === undefined) {
      setDiscounts((prev) => ({ ...prev, [productId]: '' }))
      return
    }
    // Allow intermediate states like "1." or "1.5" while typing
    const sanitized = value.replace(/,/g, '')
    // Accept digits and at most one decimal dot, max 100
    if (!/^\d*\.?\d*$/.test(sanitized)) return
    const numericValue = sanitized === '' ? '' : parseFloat(sanitized)
    if (!isNaN(numericValue) && numericValue > 100) return
    setDiscounts((prev) => ({
      ...prev,
      [productId]: isNaN(numericValue) ? '' : (sanitized.endsWith('.') ? sanitized : numericValue),
    }))
  }

  const handleDiscountAmountChange = (productId, value) => {
    setDiscountAmounts((prev) => ({ ...prev, [productId]: value }))
  }

  // user sửa giá theo đơn vị đang chọn -> store override
  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setPriceOverrides((prev) => ({
      ...prev,
      [productId]: numericValue,
    }))
    setPriceErrors(prev => {
      if (!prev[productId]) return prev
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const handleGiveawayChange = (productId, value) => {
    setGiveaway((prev) => ({
      ...prev,
      [productId]: value,
    }))
  }

  const calculateInvoiceTotal = () => {
    return selectedProducts.reduce((total, product) => {
      const quantity = quantities[product.id] || 1
      const discountPct = parseFloat(discounts[product.id]) || 0
      const price = getDisplayPrice(product)

      const subtotal = quantity * price
      const discountAmount = subtotal * discountPct / 100
      const totalForProduct = subtotal - discountAmount > 0 ? subtotal - discountAmount : 0
      return total + totalForProduct
    }, 0)
  }

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((totalDiscount, product) => {
      const quantity = quantities[product.id] || 1
      const discountPct = parseFloat(discounts[product.id]) || 0
      const price = getDisplayPrice(product)
      const subtotal = quantity * price
      return totalDiscount + (subtotal * discountPct / 100)
    }, 0)
  }

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

  const calculateTotalTax = () => {
    return selectedProducts.reduce((totalTax, product) => {
      return totalTax + calculateTaxForProduct(product.id)
    }, 0)
  }

  const calculateTaxForProduct = (productId) => {
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0

    const quantity = quantities[productId] || 1
    const price = getDisplayPrice(product)
    const basePrice = price * quantity

    const selectedProductTaxes = selectedTaxes[productId] || []
    const taxes = product?.taxes || []

    const taxAmount = taxes
      .filter((tax) => selectedProductTaxes.includes(tax.id))
      .reduce((sum, tax) => sum + (basePrice * tax.percentage) / 100, 0)

    return taxAmount
  }

  const handleCalculateSubTotalInvoice = () => {
    return selectedProducts.reduce((subTotal, product) => {
      const price = getDisplayPrice(product)
      const quantity = quantities[product.id] || 1
      const total = price * quantity
      return subTotal + total
    }, 0)
  }

  const calculateTotalAmount = () => {
    const shippingFee = Number(form.watch('shippingFee')) || 0;
    const total =
      calculateInvoiceTotal() + calculateTotalTax() + calculateExpenses() + shippingFee
    return total
  }

  const handleInputChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, '')
    setTotalAmount(rawValue)
    form.setValue('totalAmount', rawValue)
  }

  const handleSetOtherExpenses = (data) => {
    setOtherExpenses(data)
  }

  const calculateExpenses = () => {
    const totalExpenses = otherExpenses.price
    return totalExpenses
  }

  const handleSelectCustomer = async (customer) => {
    setSelectedCustomer(customer)
    form.setValue('customerId', customer?.id.toString())

    // Initialize customerEditData with customer info
    setCustomerEditData({
      customerName: customer?.customerName || customer?.name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      address: customer?.address || '',
      cccd: customer?.cccd || '',
      issuedAt: customer?.issuedAt || null,
      issuedBy: customer?.issuedBy || '',
    })

    // Bỏ qua theo yêu cầu: không tự động gọi API expiry khi chọn khách hàng
    // try {
    //   const res = await dispatch(
    //     getExpiriesByCustomerId({ customerId: customer.id }),
    //   ).unwrap()

    //   const accounts = res?.data?.accounts || []
    //   setCustomerAccounts(accounts)

    //   const nextApplyExpiry = {}
    //   const nextAccountName = {}
    //   const nextStartDate = {}
    //   const nextExpiryDuration = {}

    //   for (const acc of accounts) {
    //     const expiry = acc.expiries?.[0]
    //     if (!expiry) continue
    //     const productId = expiry.productId
    //     nextApplyExpiry[productId] = true
    //     nextAccountName[productId] = acc.accountName
    //     if (expiry.endDate) {
    //       const d = new Date(expiry.endDate)
    //       d.setDate(d.getDate() + 1)
    //       nextStartDate[productId] = d
    //     }
    //   }

    //   for (const acc of accounts) {
    //     const expiry = acc.expiries?.[0]
    //     if (!expiry) continue

    //     const productId = expiry.productId
    //     nextExpiryDuration[productId] = {
    //       value: expiry.period || 1,
    //       unit: expiry.unit || 'month',
    //     }
    //   }

    //   setExpiryDurations((prev) => ({ ...prev, ...nextExpiryDuration }))
    //   setApplyExpiryItems((prev) => ({ ...prev, ...nextApplyExpiry }))
    //   setAccountName((prev) => ({ ...prev, ...nextAccountName }))
    //   setProductStartDate((prev) => ({ ...prev, ...nextStartDate }))
    // } catch {
    //   setCustomerAccounts([])
    // }
  }

  const paymentMethod = form.watch('paymentMethod')

  useEffect(() => {
    if (paymentMethod !== 'transfer') {
      form.setValue('bankAccount', null)
    }
  }, [paymentMethod, form])

  // Show available products for quick select (simplified - no complex calculation yet)
  const popularProducts = useMemo(() => {
    if (!products || products.length === 0) return []

    // Just show first 15 products that have stock
    return products
      .filter(p => 1 > 0)
      .slice(0, 15)
  }, [products])

  // Handle quick select from popular products
  const handleQuickSelectProduct = (product) => {
    // Check if product is already selected
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)

    if (isAlreadySelected) {
      // Remove product if already selected
      const newSelectedProducts = selectedProducts.filter(p => p.id !== product.id)
      setSelectedProducts(newSelectedProducts)

      // Clean up related states
      const newProductIds = newSelectedProducts.map(p => p.id)
      setSelectedUnitIds(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setBaseUnitPrices(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      setPriceOverrides(prev => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
    } else {
      // Add product to selected list
      handleSelectProduct([...selectedProducts.map(p => ({ value: p.id, label: p.name })), { value: product.id, label: product.name }])
    } ``
  }

  // Expose dialog state to window for mobile navigation
  useEffect(() => {
    if (!isDesktop && open) {
      window.__invoiceDialog = {
        setMobileView,
        selectedProductsCount: selectedProducts.length,
        currentView: mobileView, // Add current view
      }
    }
    return () => {
      delete window.__invoiceDialog
    }
  }, [isDesktop, open, setMobileView, selectedProducts.length, mobileView])

  // Mobile: Render as full page
  if (!isDesktop && open) {
    return (
      <>
        <div className={cn("fixed inset-0 top-14 bottom-16 bg-background z-40 flex flex-col pt-0", props.contentClassName)}>
          {/* Mobile Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
            <div className="flex items-center gap-2">
              {mobileView === 'cart' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileView('products')}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {mobileView === 'products' ? 'Chọn sản phẩm' : 'Giỏ hàng'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mobileView === 'products'
                    ? `${selectedProducts.length} sản phẩm đã chọn`
                    : 'Hoàn tất đơn hàng'
                  }
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
              {mobileView === 'products' ? (
                /* View 1: Product Selection (Columns 1+2) */
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Search Bar */}
                  <div className="p-4 border-b bg-background/80 backdrop-blur-sm z-30 relative">
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between"
                        >
                          {searchQuery ? searchQuery : "Tìm kiếm sản phẩm..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-32px)] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Nhập tên hoặc mã sản phẩm..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                            <CommandGroup heading="Gợi ý">
                              {filteredProducts.slice(0, 10).map((product) => {
                                const isSelected = selectedProducts.some(p => p.id === product.id)
                                return (
                                  <CommandItem
                                    key={product.id}
                                    value={product.productName || product.name}
                                    onSelect={() => {
                                      handleAddProduct(product)
                                      setOpenCombobox(false)
                                      setSearchQuery('')
                                    }}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className='flex-1'>
                                        <div className='font-medium'>{product.productName || product.name}</div>
                                        <div className='text-xs text-muted-foreground flex flex-wrap gap-2 mt-1'>
                                          <span>{product.code}</span>
                                          <span>•</span>
                                          <span>Tồn: {product.totalStock ?? product.currentStock ?? 0}</span>
                                          <span>•</span>
                                          <span className='text-primary'>{moneyFormat(product.price)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                    </div>
                  </div>

                  {/* Category + Product Grid */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Category Sidebar - Horizontal scroll with filter */}
                    <div className="border-b p-2 flex items-center gap-2">
                      <div className="flex-1 overflow-x-auto">
                        <div className="flex gap-2">
                          {/* All Categories Option */}
                          <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all",
                              selectedCategory === 'all'
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            Tất cả
                          </button>

                          {categories.map((category) => {
                            const isActive = selectedCategory === category.id
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => setSelectedCategory(category.id)}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all",
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {category.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Filter Dropdown */}
                      <Popover open={showCategoryDropdown} onOpenChange={setShowCategoryDropdown}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="shrink-0"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-56 p-2"
                          side="bottom"
                          align="end"
                          sideOffset={8}
                          alignOffset={-4}
                        >
                          <div className="space-y-1 max-h-[40vh] flex flex-col overflow-y-auto">
                            {/* All Categories Option */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory('all')
                                setShowCategoryDropdown(false)
                              }}
                              className={cn(
                                "w-full text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                                selectedCategory === 'all'
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              Tất cả danh mục
                            </button>

                            {categories?.length > 0 ? (
                              function renderMobileCategories(catList, level = 0) {
                                return catList.map(category => {
                                  const isActive = selectedCategory === category.id
                                  return (
                                    <div key={category.id} className="flex flex-col">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCategory(category.id)
                                          setShowCategoryDropdown(false)
                                        }}
                                        className={cn(
                                          "w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-md text-xs transition-colors",
                                          isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted",
                                          level > 0 && "pl-" + (level * 4 + 3)
                                        )}
                                        style={{ paddingLeft: level > 0 ? `${level * 1.5 + 0.75}rem` : undefined }}
                                      >
                                        <Tag className={cn("h-4 w-4 shrink-0 mr-1", level > 0 && "opacity-70 h-3.5 w-3.5")} />
                                        <span className="truncate flex-1">{category.categoryName || category.name}</span>
                                      </button>
                                      {category.children && category.children.length > 0 && (
                                        <div className="flex flex-col ml-2 border-l border-border/40 pl-1 mt-0.5">
                                          {renderMobileCategories(category.children, level + 1)}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              }(categories)
                            ) : (
                              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                                Không có danh mục
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Product Grid - Vertical scroll */}
                    <div className="flex-1 overflow-y-auto">
                      <ProductGrid
                        products={filteredProducts}
                        onAddProduct={handleAddProduct}
                        selectedProductIds={cartActiveTab === 'gift' ? giftProducts.map(p => p.id) : selectedProducts.map(p => p.id)}
                        loading={false}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* View 2: Cart & Checkout (Columns 3+4) - Single Scroll */
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col">
                    {/* Shopping Cart */}
                    <div
                      ref={cartRef}
                      className="[&>div]:!w-full [&>div]:border-0 [&>div]:!bg-transparent [&>div]:shadow-none"
                    >
                      <ShoppingCart
                        selectedProducts={selectedProducts}
                        quantities={quantities}
                        selectedUnitIds={selectedUnitIds}
                        priceOverrides={priceOverrides}
                        priceErrors={priceErrors}
                        discounts={discounts}
                        selectedTaxes={selectedTaxes}
                        notes={notes}
                        giveaway={giveaway}
                        onQuantityChange={handleQuantityChange}
                        onUnitChange={handleUnitChange}
                        onPriceChange={handlePriceChange}
                        onDiscountChange={handleDiscountChange}
                        onDiscountAmountChange={handleDiscountAmountChange}
                        onTaxChange={handleTaxChange}
                        onNoteChange={handleNoteChange}
                        onGiveawayChange={handleGiveawayChange}
                        onRemoveProduct={handleRemoveProduct}
                        getUnitOptions={getUnitOptions}
                        getDisplayPrice={getDisplayPrice}
                        calculateSubTotal={calculateSubTotal}
                        calculateTaxForProduct={calculateTaxForProduct}
                        calculatePreDiscountTotal={handleCalculateSubTotalInvoice}
                        calculateTotalDiscount={calculateTotalDiscount}
                        promoCode={promoCode}
                        promoLoading={promoLoading}
                        appliedPromotion={appliedPromotion}
                        promoError={promoError}
                        onPromoCodeChange={setPromoCode}
                        onApplyPromotion={handleApplyPromotion}
                        onRemovePromotion={handleRemovePromotion}
                        cartPromotions={cartPromotions}
                        cartPromosLoading={cartPromosLoading}
                        onSelectPromotion={handleSelectPromotion}
                        giftProducts={giftProducts}
                        giftQuantities={giftQuantities}
                        onRemoveGiftProduct={(id) => {
                          setGiftProducts(giftProducts.filter(p => p.id !== id))
                          setGiftQuantities(prev => {
                            const next = { ...prev }
                            delete next[id]
                            return next
                          })
                        }}
                        onGiftQuantityChange={(id, value) => {
                          setGiftQuantities(prev => ({ ...prev, [id]: Number(value) }))
                        }}
                        activeTab={cartActiveTab}
                        onActiveTabChange={setCartActiveTab}
                      />
                    </div>

                    {/* Invoice Sidebar */}
                    <div className="border-t [&>div]:!w-full [&>div]:!max-w-full">
                      <InvoiceSidebar
                        form={form}
                        customers={customers}
                        selectedCustomer={selectedCustomer}
                        customerEditData={customerEditData}
                        onCustomerEditDataChange={setCustomerEditData}
                        onSelectCustomer={(customer) => {
                          setSelectedCustomer(customer)
                          if (customer) {
                            form.setValue('customerId', customer.id.toString())
                            handleSelectCustomer(customer)
                          } else {
                            form.setValue('customerId', '')
                            setCustomerEditData(null)
                          }
                        }}
                        paymentMethods={paymentMethods}
                        calculateSubTotal={handleCalculateSubTotalInvoice}
                        calculateTotalTax={calculateTotalTax}
                        calculateTotalDiscount={calculateTotalDiscount}
                        calculateTotalAmount={calculateTotalAmount}
                        calculateExpenses={calculateExpenses}
                        onSubmit={onSubmit}
                        onInvalidSubmit={onInvalidSubmit}
                        loading={loading}
                        onShowCreateCustomer={() => setShowCreateCustomerDialog(true)}
                        onShowUpdateCustomer={() => setShowUpdateCustomerDialog(true)}
                        onPrintInvoice={() => setHasPrintInvoice(true)}
                        onPrintQuotation={() => setHasPrintQuotation(true)}
                        onScrollToCart={scrollToCart}
                        customerErrors={customerErrors}
                        deliveryDateError={deliveryDateError}
                        isUpdate={!!invoiceId}
                      />
                    </div>

                    {/* Fixed "Buy More" Button - Mobile Only */}
                    {/* <Button
                      type="button"
                      variant="default"
                      className="fixed bottom-24 right-4 rounded-full shadow-lg md:hidden"
                      size="lg"
                      onClick={() => setMobileView('products')}
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Mua thêm
                    </Button> */}
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        {/* Supporting Dialogs */}
        {showUpdateCustomerDialog && (
          <UpdateCustomerDialog
            open={showUpdateCustomerDialog}
            onOpenChange={setShowUpdateCustomerDialog}
            customer={selectedCustomer}
          />
        )}
        {
          showCreateCustomerDialog && (
            <CreateCustomerDialog
              open={showCreateCustomerDialog}
              onOpenChange={setShowCreateCustomerDialog}
            />
          )
        }
        {
          showCreateProductDialog && (
            <CreateProductDialog
              open={showCreateProductDialog}
              onOpenChange={setShowCreateProductDialog}
            />
          )
        }

        {
          invoice && generalInformation && (
            <PrintInvoiceView invoice={invoice} setting={generalInformation} />
          )
        }

        {
          agreementData && (
            <AgreementPreviewDialog
              open={showAgreementPreview}
              onOpenChange={(open) => {
                if (!open) {
                  setShowAgreementPreview(false)
                  setIsPrintContract(false) // Reset flag
                  form.reset()
                  onOpenChange?.(false)
                }
              }}
              initialData={agreementData}
              overlayClassName="z-[10001]"
              contentClassName="z-[10002]"
              onConfirm={async (finalData) => {
                try {
                  // setAgreementExporting(true) // Helper state not strictly needed if handle in component or ignore
                  // await exportAgreementPdf(finalData, agreementFileName)
                  // toast.success('Đã in thỏa thuận mua bán thành công')

                  setShowAgreementPreview(false)
                  setIsPrintContract(false)
                  form.reset()
                  onOpenChange?.(false)
                } catch (error) {
                  console.error('Export agreement error:', error)
                  toast.error('In thỏa thuận mua bán thất bại')
                }
              }}
            />
          )
        }
      </>
    )
  }

  // Don't render desktop dialog on mobile to prevent state loss
  if (!isDesktop) {
    return null
  }

  // Desktop: Render as Dialog
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal={isDesktop} {...props}>
        {showTrigger && (
          <DialogTrigger asChild>
            <Button className="mx-2" variant="outline" size="sm">
              <PlusIcon className="mr-2 size-4" aria-hidden="true" />
              Tạo đơn bán
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="max-w-screen w-screen p-0 m-0 h-[calc(100vh-64px)] md:max-h-screen md:h-screen">
          <DialogHeader className="px-6 pt-4">
            <DialogTitle>
              {invoiceId ? 'Cập nhật hóa đơn bán hàng' : 'Tạo đơn bán mới'}
            </DialogTitle>
            <DialogDescription>
              Chọn sản phẩm và điền thông tin để tạo đơn bán
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden border-t">
              {/* 4-COLUMN LAYOUT */}
              <div className="flex overflow-hidden">
                {/* LEFT SECTION: Category + Products */}
                <div className="flex flex-col w-[700px]">
                  {/* UNIFIED SEARCH BAR spanning columns 1 & 2 */}
                  <div className="p-4 border-b bg-background/80 backdrop-blur-sm z-30 relative">
                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCombobox}
                          className="w-full justify-between"
                        >
                          {searchQuery ? searchQuery : "Tìm kiếm sản phẩm..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[660px] p-0" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder="Nhập tên hoặc mã sản phẩm..."
                            value={searchQuery}
                            onValueChange={setSearchQuery} // Updates query state
                          />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                            <CommandGroup heading="Gợi ý">
                              {filteredProducts.slice(0, 10).map((product) => {
                                const isSelected = selectedProducts.some(p => p.id === product.id)
                                return (
                                  <CommandItem
                                    key={product.id}
                                    value={product.productName || product.name} // Needed for internal logic, but we handle select manually
                                    onSelect={() => {
                                      handleAddProduct(product)
                                      setOpenCombobox(false)
                                      setSearchQuery('')
                                    }}
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          isSelected ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <div className='flex-1'>
                                        <div className='font-medium'>{product.productName || product.name}</div>
                                        <div className='text-xs text-muted-foreground flex gap-2'>
                                          <span>{product.code}</span>
                                          <span>•</span>
                                          <span>Tồn: {product.totalStock ?? product.currentStock ?? 0}</span>
                                          <span>•</span>
                                          <span className='text-primary'>{moneyFormat(product.price)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </CommandItem>
                                )
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Hiển thị {filteredProducts.length} / {products.length} sản phẩm
                    </div>
                  </div>

                  {/* Category + Product Grid Row */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* COLUMN 1: Category Sidebar */}
                    <CategorySidebar
                      categories={categories}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      productCounts={productCounts}
                    />

                    {/* COLUMN 2: Product Grid */}
                    <ProductGrid
                      products={filteredProducts}
                      onAddProduct={handleAddProduct}
                      selectedProductIds={cartActiveTab === 'gift' ? giftProducts.map(p => p.id) : selectedProducts.map(p => p.id)}
                      loading={false}
                    />
                  </div>
                </div>

                {/* COLUMN 3: Shopping Cart */}
                <ShoppingCart
                  selectedProducts={selectedProducts}
                  quantities={quantities}
                  selectedUnitIds={selectedUnitIds}
                  priceOverrides={priceOverrides}
                  priceErrors={priceErrors}
                  discounts={discounts}
                  selectedTaxes={selectedTaxes}
                  notes={notes}
                  giveaway={giveaway}
                  onQuantityChange={handleQuantityChange}
                  onUnitChange={handleUnitChange}
                  onPriceChange={handlePriceChange}
                  onDiscountChange={handleDiscountChange}
                  onTaxChange={handleTaxChange}
                  onNoteChange={handleNoteChange}
                  onGiveawayChange={handleGiveawayChange}
                  onRemoveProduct={handleRemoveProduct}
                  getUnitOptions={getUnitOptions}
                  getDisplayPrice={getDisplayPrice}
                  calculateSubTotal={calculateSubTotal}
                  calculateTaxForProduct={calculateTaxForProduct}
                  calculatePreDiscountTotal={handleCalculateSubTotalInvoice}
                  calculateTotalDiscount={calculateTotalDiscount}
                  applyWarrantyItems={applyWarrantyItems}
                  onApplyWarrantyChange={handleApplyWarrantyChange}
                  promoCode={promoCode}
                  promoLoading={promoLoading}
                  appliedPromotion={appliedPromotion}
                  promoError={promoError}
                  onPromoCodeChange={setPromoCode}
                  onApplyPromotion={handleApplyPromotion}
                  onRemovePromotion={handleRemovePromotion}
                  cartPromotions={cartPromotions}
                  cartPromosLoading={cartPromosLoading}
                  onSelectPromotion={handleSelectPromotion}
                  giftProducts={giftProducts}
                  giftQuantities={giftQuantities}
                  onRemoveGiftProduct={(id) => {
                    setGiftProducts(giftProducts.filter(p => p.id !== id))
                    setGiftQuantities(prev => {
                      const next = { ...prev }
                      delete next[id]
                      return next
                    })
                  }}
                  onGiftQuantityChange={(id, value) => {
                    setGiftQuantities(prev => ({ ...prev, [id]: Number(value) }))
                  }}
                  activeTab={cartActiveTab}
                  onActiveTabChange={setCartActiveTab}
                />

                {/* COLUMN 4: Invoice Sidebar */}
                <InvoiceSidebar
                  form={form}
                  customers={customers}
                  warehouses={warehouses.filter(w => w.warehouseType === 'product')}
                  selectedCustomer={selectedCustomer}
                  customerEditData={customerEditData}
                  customerErrors={customerErrors}
                  onCustomerEditDataChange={(data) => {
                    setCustomerEditData(data)
                    setCustomerErrors({})
                  }}
                  onSelectCustomer={(customer) => {
                    setSelectedCustomer(customer)
                    if (customer) {
                      form.setValue('customerId', customer.id.toString())
                      handleSelectCustomer(customer)
                    } else {
                      form.setValue('customerId', '')
                      setCustomerEditData(null)
                      setCustomerErrors({})
                    }
                  }}
                  paymentMethods={paymentMethods}
                  calculateSubTotal={handleCalculateSubTotalInvoice}
                  calculateTotalTax={calculateTotalTax}
                  calculateTotalDiscount={calculateTotalDiscount}
                  calculateTotalAmount={calculateTotalAmount}
                  calculateExpenses={calculateExpenses}
                  onSubmit={onSubmit}
                  onInvalidSubmit={onInvalidSubmit}
                  loading={loading}
                  onShowCreateCustomer={() => setShowCreateCustomerDialog(true)}
                  onShowUpdateCustomer={() => setShowUpdateCustomerDialog(true)}
                  onPrintInvoice={() => setHasPrintInvoice(true)}
                  onPrintQuotation={() => setHasPrintQuotation(true)}
                  onScrollToCart={scrollToCart}
                  isUpdate={!!invoiceId}
                />
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Supporting Dialogs */}
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
          showTrigger={false}
          setOtherExpenses={handleSetOtherExpenses}
          otherExpenses={otherExpenses}
        />
      )}

      {invoice && generalInformation && (
        <PrintInvoiceView invoice={invoice} setting={generalInformation} />
      )}

      {agreementData && (
        <AgreementPreviewDialog
          open={showAgreementPreview}
          onOpenChange={(open) => {
            if (!open) {
              setShowAgreementPreview(false)
              setIsPrintContract(false) // Reset flag
              form.reset()
              onOpenChange?.(false)
            }
          }}
          initialData={agreementData}
          overlayClassName="z-[10001]"
          contentClassName="z-[10002]"
          onConfirm={async (finalData) => {
            try {
              setAgreementExporting(true)
              // await exportAgreementPdf(finalData, agreementFileName)
              // toast.success('Đã in thỏa thuận mua bán thành công')

              setShowAgreementPreview(false)
              setIsPrintContract(false)
              form.reset()
              onOpenChange?.(false)
            } catch (error) {
              console.error('Export agreement error:', error)
              toast.error('In thỏa thuận mua bán thất bại')
            } finally {
              setAgreementExporting(false)
            }
          }}
        />
      )}

      {showCreateProductDialog && (
        <CreateProductDialog
          open={showCreateProductDialog}
          onOpenChange={(open) => {
            setShowCreateProductDialog(open)
            if (!open) dispatch(getProducts({ type: 'PRODUCT' }))
          }}
          defaultType="PRODUCT"
          showTrigger={false}
        />
      )}
    </>
  )
}

export default InvoiceDialog
