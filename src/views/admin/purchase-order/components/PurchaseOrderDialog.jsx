import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/custom/Button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Form,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Plus, LayoutGrid, Edit, Package, FlaskConical } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { getProducts } from '@/stores/ProductSlice'
import { cn } from '@/lib/utils'
import { getSuppliers } from '@/stores/SupplierSlice'
import { getCategories } from '@/stores/CategorySlice'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { moneyFormat } from '@/utils/money-format'

import { createPurchaseOrderSchema } from '../schema'
import { createPurchaseOrder, updatePurchaseOrder, getPurchaseOrderDetail } from '@/stores/PurchaseOrderSlice'
import { toast } from 'sonner'
import { paymentMethods } from '../../receipt/data'
import { useMediaQuery } from '@/hooks/UseMediaQuery'

// Components
import MaterialCategorySidebar from './MaterialCategorySidebar'
import ProductGrid from '../../invoice/components/ProductGrid'
import PurchaseOrderSidebar from './PurchaseOrderSidebar'
import PurchaseOrderCart from './PurchaseOrderCart'
import CreateOtherExpenses from '../../invoice/components/CreateOtherExpenses'
import CreateProductDialog from '../../product/components/CreateProductDialog'

const PurchaseOrderDialog = ({
  open,
  onOpenChange,
  showTrigger = true,
  purchaseOrderId, // If present, acts as Update mode
  purchaseOrder, // Initial data for Update mode (optional)
  onSuccess,
  ...props
}) => {
  const dispatch = useDispatch()
  const products = useSelector((state) => state.product.products)
  // Ensure products have totalStock (defaulting to 0 if missing)
  const processedProducts = useMemo(() => {
    return products.map(p => {
      return {
        ...p,
        totalStock: Number(p.totalStock || p.currentStock || 0),
      }
    })
  }, [products])
  const allCategories = useSelector((state) => state.category.categories)
  const suppliers = useSelector((state) => state.supplier.suppliers)
  const loading = useSelector((state) => state.purchaseOrder.loading)
  const authUserWithRoleHasPermissions =
    useSelector((state) => state.auth.authUserWithRoleHasPermissions) || {}

  const isDesktop = useMediaQuery('(min-width: 768px)')
  const isUpdateMode = !!purchaseOrderId

  // UI States
  const [mobileView, setMobileView] = useState('products') // 'products' | 'cart'
  const [productMode, setProductMode] = useState('MATERIAL') // 'MATERIAL' | 'PRODUCT'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [openCombobox, setOpenCombobox] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState([])

  // Data States
  const [fetchedOrder, setFetchedOrder] = useState(null)

  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [supplierEditData, setSupplierEditData] = useState(null)

  const [selectedProducts, setSelectedProducts] = useState([])
  const [selectedUnitIds, setSelectedUnitIds] = useState({})
  const [baseUnitPrices, setBaseUnitPrices] = useState({})
  const [priceOverrides, setPriceOverrides] = useState({})
  const [discountRates, setDiscountRates] = useState({})
  const [quantities, setQuantities] = useState({})
  const [notes, setNotes] = useState({})
  const [selectedTaxes, setSelectedTaxes] = useState({})

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null)

  // Other Expenses
  const [showOtherExpenses, setShowOtherExpenses] = useState(false)
  const [otherExpenses, setOtherExpenses] = useState({
    price: 0,
    description: '',
  })

  // VAT
  const [vatRate, setVatRate] = useState(0)


  // Create Product Dialog State
  const [showCreateProduct, setShowCreateProduct] = useState(false)

  const form = useForm({
    resolver: zodResolver(createPurchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      orderDate: new Date(),
      status: 'draft',
      note: '',
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      paymentTerms: '',
      expectedDeliveryDate: null,
      isAutoApprove: true,
    },
  })

  // Start Update Mode: Fetch Detail if needed
  useEffect(() => {
    if (open && purchaseOrderId) {
      const fetchDetail = async () => {
        try {
          const result = await dispatch(getPurchaseOrderDetail(purchaseOrderId)).unwrap()
          setFetchedOrder(result)
        } catch (error) {
          console.error("Failed to fetch order detail", error)
        }
      }
      fetchDetail()
    }
  }, [open, purchaseOrderId, dispatch])

  const targetOrder = isUpdateMode ? (fetchedOrder || purchaseOrder) : null

  // Fetch Products & Suppliers
  useEffect(() => {
    if (open) {
      dispatch(getProducts({ type: productMode }))
      dispatch(getSuppliers())
      dispatch(getCategories({ type: productMode }))
    }
  }, [dispatch, open, productMode])

  // Populate Data for Update
  useEffect(() => {
    if (open && isUpdateMode && targetOrder && processedProducts.length > 0) {
      // 1. Set Form Values
      form.reset({
        supplierId: targetOrder.supplierId?.toString() || '',
        orderDate: targetOrder.orderDate ? new Date(targetOrder.orderDate) : new Date(),
        status: targetOrder.status || 'draft',
        note: targetOrder.note || '',
        paymentMethod: targetOrder.paymentMethod || 'transfer',
        paymentNote: targetOrder.paymentNote || '',
        paymentTerms: targetOrder.terms || '',
        expectedDeliveryDate: targetOrder.expectedDeliveryDate ? new Date(targetOrder.expectedDeliveryDate) : null,
        isAutoApprove: true, // Keep default even for update or map if backend provides
      })

      setExpectedDeliveryDate(targetOrder.expectedDeliveryDate ? new Date(targetOrder.expectedDeliveryDate) : null)

      // 2. Set Supplier
      if (targetOrder.supplier) {
        setSelectedSupplier(targetOrder.supplier)
        setSupplierEditData({
          name: targetOrder.supplier.supplierName || targetOrder.supplier.name,
          phone: targetOrder.supplier.phone,
          email: targetOrder.supplier.email,
          address: targetOrder.supplier.address,
          taxCode: targetOrder.supplier.taxCode,
        })
      }

      // 3. Set Items
      const items = targetOrder.items || []
      const productList = []
      const nextQuantities = {}
      const nextUnitIds = {}
      const nextPriceOverrides = {}
      const nextDiscountRates = {}
      const nextNotes = {}
      const nextBasePrices = {}
      // Taxes reconstruction skipped as per Update logic

      items.forEach(item => {
        const product = processedProducts.find(p => p.id === item.productId)
        if (product) {
          productList.push(product)
          const pid = product.id

          nextQuantities[pid] = item.quantity
          nextUnitIds[pid] = item.unitId
          const rate = (item.discount && item.unitPrice && item.quantity)
            ? (item.discount / (item.unitPrice * item.quantity)) * 100
            : 0
          nextDiscountRates[pid] = parseFloat(rate.toFixed(2)) // Keep 2 decimals
          nextNotes[pid] = item.note || ''
          nextPriceOverrides[pid] = item.unitPrice

          nextBasePrices[pid] = product.basePrice || product.price
        }
      })

      setSelectedProducts(productList)
      setQuantities(nextQuantities)
      setSelectedUnitIds(nextUnitIds)
      setPriceOverrides(nextPriceOverrides)
      setDiscountRates(nextDiscountRates)
      setNotes(nextNotes)
      setBaseUnitPrices(nextBasePrices)

      // 4. Other Expenses
      setOtherExpenses({
        price: targetOrder.otherCosts || 0,
        description: '',
      })
    }
  }, [open, isUpdateMode, targetOrder, products, form])

  // Reset States on Close
  useEffect(() => {
    if (open) return

    setSelectedProducts([])
    setSelectedUnitIds({})
    setBaseUnitPrices({})
    setPriceOverrides({})
    setDiscountRates({})
    setQuantities({})
    setNotes({})
    setSelectedTaxes({})
    setSelectedSupplier(null)
    setSupplierEditData(null)
    setExpectedDeliveryDate(null)
    setSearchQuery('')
    setSelectedCategory('all')
    setProductMode('MATERIAL')
    setMobileView('products')
    setIsPrintContract(false)
    setContractNumber('')
    setShowContractPreview(false)
    setContractPreviewData(null)
    setFetchedOrder(null)
    setOtherExpenses({ price: 0, description: '' })
    setVatRate(0)

    // Reset form to default values for CREATE mode mostly
    form.reset({
      supplierId: '',
      orderDate: new Date(),
      status: 'draft',
      note: '',
      paymentMethod: paymentMethods[0].value,
      paymentNote: '',
      contractNumber: '',
      paymentTerms: '',
      expectedDeliveryDate: null,
      isAutoApprove: true,
    })
  }, [open, form])

  // Filter categories by current product mode
  const flatCategories = useMemo(() =>
    allCategories.filter(c => c.type === productMode)
  , [allCategories, productMode])

  // Label helpers based on mode
  const modeLabel = productMode === 'MATERIAL' ? 'nguyên liệu' : 'sản phẩm'
  const modeLabelCapitalized = productMode === 'MATERIAL' ? 'Nguyên liệu' : 'Sản phẩm'

  // ====== CATEGORY LOGIC ======
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

  const productCounts = useMemo(() => {
    const counts = {}
    const base = selectedSupplier
      ? processedProducts.filter(p => p.supplier?.id === selectedSupplier.id)
      : processedProducts
    base.forEach(product => {
      const categoryId = product.categoryId || 'uncategorized'
      counts[categoryId] = (counts[categoryId] || 0) + 1
    })
    return counts
  }, [processedProducts, selectedSupplier])

  // ====== PRODUCT FILTERING ======
  useEffect(() => {
    let filtered = processedProducts

    // Filter by selected supplier
    if (selectedSupplier) {
      filtered = filtered.filter(p => p.supplier?.id === selectedSupplier.id)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => (p.categoryId || 'uncategorized') === selectedCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        (p.productName || p.name).toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query) ||
        p.supplier?.supplierName?.toLowerCase().includes(query)
      )
    }

    setFilteredProducts(filtered)
  }, [selectedCategory, processedProducts, searchQuery, selectedSupplier])

  // ====== UNIT HELPERS ======
  const getBaseUnitId = (product) =>
    product?.unitId || product?.baseUnitId || product?.prices?.[0]?.unitId || null

  const getBaseUnitName = (product) =>
    product?.unit?.unitName || product?.unit?.name || product?.baseUnit?.name || product?.prices?.[0]?.unitName || '—'

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

      if (priceOverrides[pid] != null) return Number(priceOverrides[pid] || 0)

      const basePrice = Number(baseUnitPrices[pid] ?? product?.basePrice ?? product?.price ?? 0)
      return factor > 0 ? basePrice / factor : basePrice
    },
    [baseUnitPrices, priceOverrides, selectedUnitIds, getFactor],
  )


  // ====== HANDLERS ======
  const handleAddProduct = (product) => {
    const isAlreadySelected = selectedProducts.some(p => p.id === product.id)
    if (isAlreadySelected) {
      handleRemoveProduct(product.id)
    } else {
      setSelectedProducts(prev => [...prev, product])
      setQuantities(prev => ({ ...prev, [product.id]: 1 }))
      setBaseUnitPrices(prev => ({ ...prev, [product.id]: product.basePrice || product.price }))
      setDiscountRates(prev => ({ ...prev, [product.id]: 0 }))

      const defaultUnit = getBaseUnitId(product) || product?.prices?.[0]?.unitId
      if (defaultUnit) {
        setSelectedUnitIds(prev => ({ ...prev, [product.id]: defaultUnit }))
      }

      if (!form.getValues('supplierId') && product.supplier?.id) {
        const supplier = suppliers.find(s => s.id === product.supplier.id) || product.supplier
        handleSelectSupplier(supplier)
      }
    }
  }

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
    const cleanup = (setter) => {
      setter(prev => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
    }
    cleanup(setSelectedUnitIds)
    cleanup(setBaseUnitPrices)
    cleanup(setPriceOverrides)
    cleanup(setDiscountRates)
    cleanup(setQuantities)
    cleanup(setNotes)
    cleanup(setSelectedTaxes)
  }

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    if (supplier) {
      form.setValue('supplierId', supplier.id.toString())
      setSupplierEditData({
        name: supplier.supplierName || supplier.name,
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        taxCode: supplier.taxCode || '',
      })
    } else {
      form.setValue('supplierId', '')
      setSupplierEditData(null)
    }
  }



  const handleUnitChange = (productId, unitId) => {
    setSelectedUnitIds(prev => ({ ...prev, [productId]: Number(unitId) }))
    setPriceOverrides(prev => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  const handleQuantityChange = (productId, value) => {
    setQuantities(prev => ({ ...prev, [productId]: Number(value) }))
  }

  const handlePriceChange = (productId, value) => {
    const numericValue = Number(value.replace(/,/g, '').replace(/\D/g, ''))
    setPriceOverrides(prev => ({ ...prev, [productId]: numericValue }))
  }

  const handleDiscountRateChange = (productId, value) => {
    if (value === '') {
      setDiscountRates(prev => ({ ...prev, [productId]: '' }))
      return
    }
    // allow decimal numbers but remove formatting or invalid chars
    let numericValue = Number(value.replace(/,/g, '').replace(/[^\d.]/g, ''))
    if (numericValue > 100) numericValue = 100
    setDiscountRates(prev => ({ ...prev, [productId]: numericValue }))
  }

  const handleNoteChange = (productId, value) => {
    setNotes(prev => ({ ...prev, [productId]: value }))
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

  // ====== CALCULATIONS ======
  const calculateSubTotal = (productId) => {
    if (!productId) {
      return selectedProducts.reduce((sum, p) => sum + calculateSubTotal(p.id), 0)
    }
    const quantity = quantities[productId] || 1
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0
    const discountRate = discountRates[productId] || 0
    const price = getDisplayPrice(product)
    const discountAmount = (price * quantity * discountRate) / 100
    const subtotal = price * quantity
    return subtotal - discountAmount > 0 ? subtotal - discountAmount : 0
  }

  const calculateTaxForProduct = (productId) => {
    const product = selectedProducts.find((prod) => prod.id === productId)
    if (!product) return 0
    const quantity = quantities[productId] || 1
    const price = getDisplayPrice(product)
    const basePrice = price * quantity
    const selectedProductTaxes = selectedTaxes[productId] || []
    const taxes = product?.taxes || product?.prices?.[0]?.taxes || []

    return taxes
      .filter((tax) => selectedProductTaxes.includes(tax.id))
      .reduce((sum, tax) => sum + (basePrice * tax.percentage) / 100, 0)
  }

  const calculateTotalTax = () => {
    return selectedProducts.reduce((sum, p) => sum + calculateTaxForProduct(p.id), 0)
  }

  const calculateTotalDiscount = () => {
    return selectedProducts.reduce((sum, p) => {
      const price = getDisplayPrice(p)
      const quantity = quantities[p.id] || 1
      const rate = discountRates[p.id] || 0
      const discountAmount = (price * quantity * rate) / 100
      return sum + discountAmount
    }, 0)
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
    const subTotal = calculateSubTotal()
    const tax = calculateTotalTax()
    const expenses = calculateExpenses()
    const vatAmount = Math.round(handleCalculateSubTotalInvoice() * (Number(vatRate) || 0) / 100)
    return subTotal + tax + expenses + vatAmount
  }

  const handleSetOtherExpenses = (data) => {
    setOtherExpenses(data)
  }

  const calculateExpenses = () => {
    return otherExpenses.price
  }

  // ====== SUBMIT ======
  const onSubmit = async (data) => {
    if (selectedProducts.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 nguyên liệu')
      return
    }

    if (!data.supplierId && (!supplierEditData?.name || !supplierEditData?.phone)) {
      toast.error('Vui lòng chọn nhà cung cấp hoặc nhập tên và số điện thoại cho nhà cung cấp mới')
      return
    }


    if (supplierEditData) {
      const phoneRegex = /^(0)(2|3|5|7|8|9)([0-9]{8,9})$/
      if (supplierEditData.phone && !phoneRegex.test(supplierEditData.phone)) {
        toast.error('SĐT nhà cung cấp không hợp lệ (Bắt đầu bằng 02, 03, 05, 07, 08, 09 và có 10-11 số)')
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (supplierEditData.email && !emailRegex.test(supplierEditData.email)) {
        toast.error('Email nhà cung cấp không hợp lệ')
        return
      }
    }

    // Validate Unit Price
    for (const product of selectedProducts) {
      const priceUnit = getDisplayPrice(product)
      if (priceUnit <= 0) {
        toast.error(`Đơn giá của nguyên liệu "${product.name}" phải lớn hơn 0`)
        return
      }
    }

    const items = selectedProducts.map((product, index) => {
      const unitId =
        selectedUnitIds[product.id] ||
        getBaseUnitId(product) ||
        product?.prices?.[0]?.unitId
      const unitName = getUnitNameById(product, unitId)
      const factor = getFactor(product, unitId)
      const qtyUnit = quantities[product.id] || 1
      const qtyBase = factor > 0 ? qtyUnit / factor : qtyUnit
      const priceUnit = getDisplayPrice(product)

      const subTotal = calculateSubTotal(product.id)
      const taxAmt = calculateTaxForProduct(product.id)
      const rate = discountRates[product.id] || 0
      const discountAmount = (priceUnit * qtyUnit * rate) / 100

      const taxRate = (() => {
        const productTaxes = selectedTaxes[product.id] || []
        const allTaxes = product?.taxes || product?.prices?.[0]?.taxes || []
        return allTaxes
          .filter((t) => productTaxes.includes(t.id))
          .reduce((sum, t) => sum + t.percentage, 0)
      })()

      return {
        productId: product.id,
        productType: product.type,
        unitId,
        unitName,
        quantity: qtyUnit,
        baseQuantity: qtyBase,
        conversionFactor: factor,
        price: priceUnit,
        taxRate: String(taxRate),
        taxIds: selectedTaxes[product.id] || [],
        taxAmount: taxAmt,
        discountRate: rate,
        discountAmount: discountAmount,
        total: subTotal + taxAmt,
        periodMonths: "0",
        warrantyCost: 0,
        applyWarranty: false,
      }
    })

    const formattedDate = expectedDeliveryDate
      ? (expectedDeliveryDate instanceof Date ? expectedDeliveryDate.toISOString().split('T')[0] : expectedDeliveryDate)
      : (data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate).toISOString().split('T')[0] : null)


    const commonPayload = {
      supplierId: data.supplierId ? Number(data.supplierId) : (isUpdateMode ? Number(targetOrder?.supplierId) : null),
      orderDate: data.orderDate ? new Date(data.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expectedDeliveryDate: formattedDate,
      otherCosts: otherExpenses.price,
      vatRate: Number(vatRate) || 0,
      vatAmount: Math.round(handleCalculateSubTotalInvoice() * (Number(vatRate) || 0) / 100),
      isAutoApprove: data.isAutoApprove,

      notes: data.note,
      paymentTerms: data.paymentTerms,
      updatedBy: authUserWithRoleHasPermissions.id,

      ...(supplierEditData && {
        newSupplier: {
          name: supplierEditData.name,
          phone: supplierEditData.phone,
          email: supplierEditData.email || '',
          address: supplierEditData.address || '',
          taxCode: supplierEditData.taxCode || '',
        }
      }),
    }

    try {
      if (isUpdateMode) {
        // UPDATE PAYLOAD
        const updatePayload = {
          ...commonPayload,
          purchaseOrderId: targetOrder.id,
          taxAmount: calculateTotalTax(),
          discount: calculateTotalDiscount(),
          subTotal: handleCalculateSubTotalInvoice(),
          totalAmount: calculateTotalAmount(),
          details: items,
        }
        await dispatch(updatePurchaseOrder(updatePayload)).unwrap()
        toast.success('Cập nhật đơn hàng thành công')
      } else {
        // CREATE PAYLOAD
        const createPayload = {
          ...commonPayload,
          taxAmount: calculateTotalTax(),
          discount: calculateTotalDiscount(),
          subTotal: handleCalculateSubTotalInvoice(),
          totalAmount: calculateTotalAmount(),
          details: items,
          createdBy: authUserWithRoleHasPermissions.id,
        }
        const newOrder = await dispatch(createPurchaseOrder(createPayload)).unwrap()
        toast.success('Tạo đơn hàng thành công')
        if (onSuccess) onSuccess(newOrder)
      }

      onOpenChange(false)
    } catch (error) {
      console.log('Submit error:', error)
      toast.error(isUpdateMode ? 'Có lỗi xảy ra khi cập nhật đơn hàng' : 'Có lỗi xảy ra khi tạo đơn hàng')
    }
  }

  // Expose dialog state for mobile nav
  useEffect(() => {
    if (!isDesktop && open) {
      window.__purchaseOrderDialog = {
        setMobileView,
        selectedProductsCount: selectedProducts.length,
        currentView: mobileView,
      }
    }
    return () => {
      delete window.__purchaseOrderDialog
    }
  }, [isDesktop, open, setMobileView, selectedProducts.length, mobileView])

  // Mobile Render
  if (!isDesktop && open) {
    return (
      <>
        <div className="fixed inset-0 top-14 bottom-16 bg-background z-40 flex flex-col pt-0">
          <div className="px-4 py-3 border-b flex items-center justify-between bg-background">
            <div className="flex items-center gap-2">
              {mobileView === 'cart' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileView('products')}
                >
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {mobileView === 'products' ? `Chọn ${modeLabel}` : 'Đơn hàng'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {mobileView === 'products' ?
                    (isUpdateMode ? 'Cập nhật đơn hàng' : `${selectedProducts.length} ${modeLabel} đã chọn`) :
                    (isUpdateMode ? 'Cập nhật đơn hàng' : 'Hoàn tất đơn hàng')
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
              <Plus className="h-5 w-5 rotate-45" />
            </Button>
          </div>

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
                          {searchQuery ? searchQuery : `Tìm kiếm ${modeLabel}...`}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[calc(100vw-32px)] p-0 z-[1001]" align="start">
                        <Command shouldFilter={false}>
                          <CommandInput
                            placeholder={`Nhập tên hoặc mã ${modeLabel}...`}
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                          />
                          <CommandList>
                            <CommandEmpty>Không tìm thấy {modeLabel}.</CommandEmpty>
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
                                          <span className='text-primary'>{moneyFormat(product.basePrice || product.price)}</span>
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
                      Hiển thị {filteredProducts.length} / {products.length} {modeLabel}
                    </div>
                  </div>

                  <div className="px-4 py-2 border-b flex items-center justify-between bg-background">
                    <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProductMode('MATERIAL')
                          setSelectedCategory('all')
                          setSearchQuery('')
                        }}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                          productMode === 'MATERIAL'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        )}
                      >
                        <FlaskConical className="h-3 w-3" />
                        Nguyên liệu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setProductMode('PRODUCT')
                          setSelectedCategory('all')
                          setSearchQuery('')
                        }}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                          productMode === 'PRODUCT'
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground"
                        )}
                      >
                        <Package className="h-3 w-3" />
                        Sản phẩm
                      </button>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8 text-xs shadow-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setShowCreateProduct(true)
                      }}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm {modeLabel}
                    </Button>
                  </div>

                  <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
                    {/* Category Sidebar */}
                    <div className="border-b p-2 flex items-center gap-2">
                      <div className="flex-1 overflow-x-auto">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setSelectedCategory('all')} className={cn("px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all", selectedCategory === 'all' ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted/80")}>Tất cả</button>
                          {flatCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => setSelectedCategory(category.id)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all",
                                selectedCategory === category.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted/50 text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {category.categoryName}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto min-w-0 w-full">
                      <ProductGrid products={filteredProducts} onAddProduct={handleAddProduct} selectedProductIds={selectedProducts.map(p => p.id)} loading={false} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <div className="flex flex-col">
                    <div className="[&>div]:!w-full [&>div]:border-0 [&>div]:!bg-transparent [&>div]:shadow-none">
                      <PurchaseOrderCart
                        selectedProducts={selectedProducts}
                        quantities={quantities}
                        selectedUnitIds={selectedUnitIds}
                        priceOverrides={priceOverrides}
                        discountRates={discountRates}
                        selectedTaxes={selectedTaxes}
                        notes={notes}
                        onQuantityChange={handleQuantityChange}
                        onUnitChange={handleUnitChange}
                        onPriceChange={handlePriceChange}
                        onDiscountRateChange={handleDiscountRateChange}
                        onTaxChange={handleTaxChange}
                        onNoteChange={handleNoteChange}
                        onRemoveProduct={handleRemoveProduct}
                        getUnitOptions={getUnitOptions}
                        getDisplayPrice={getDisplayPrice}
                        calculateSubTotal={calculateSubTotal}
                        calculateTaxForProduct={calculateTaxForProduct}
                      />
                    </div>
                    <div className="border-t [&>div]:!w-full [&>div]:!max-w-full">
                      <PurchaseOrderSidebar
                        form={form}
                        suppliers={suppliers}
                        selectedSupplier={selectedSupplier}
                        supplierEditData={supplierEditData}
                        onSupplierEditDataChange={setSupplierEditData}
                        onSelectSupplier={handleSelectSupplier}
                        paymentMethods={paymentMethods}
                        calculateSubTotal={calculateSubTotal}
                        calculateTotalTax={calculateTotalTax}
                        calculateTotalDiscount={calculateTotalDiscount}
                        calculateTotalAmount={calculateTotalAmount}
                        onSubmit={onSubmit}
                        loading={loading}
                        expectedDeliveryDate={expectedDeliveryDate}
                        onExpectedDeliveryDateChange={setExpectedDeliveryDate}
                        isPrintContract={isPrintContract}
                        setIsPrintContract={setIsPrintContract}
                        contractNumber={contractNumber}
                        setContractNumber={setContractNumber}
                        otherExpenses={otherExpenses}
                        calculateExpenses={calculateExpenses}
                        onEditExpenses={() => setShowOtherExpenses(true)}
                        isUpdate={isUpdateMode}
                        vatRate={vatRate}
                        onVatRateChange={setVatRate}
                        vatAmount={Math.round(handleCalculateSubTotalInvoice() * (Number(vatRate) || 0) / 100)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <CreateProductDialog
          open={showCreateProduct}
          onOpenChange={setShowCreateProduct}
          defaultType={productMode}
          onSuccess={() => {
            dispatch(getProducts({ type: productMode }))
            setShowCreateProduct(false)
            toast.success(`Đã thêm ${modeLabel} mới`)
          }}
          showTrigger={false}
          contentClassName="z-[10006]"
          overlayClassName="z-[10005]"
        />
      </>
    )
  }

  // Prevent render if desktop view closed or not open
  if (!isDesktop) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={isDesktop} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            {isUpdateMode ? <Edit className="mr-2 size-4" /> : <Plus className="mr-2 size-4" />}
            {isUpdateMode ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-screen w-screen p-0 m-0 h-[calc(100vh-64px)] md:max-h-screen md:h-screen">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle>{isUpdateMode ? 'Cập nhật đơn đặt hàng' : 'Tạo đơn đặt hàng mới'}</DialogTitle>
          <DialogDescription>{isUpdateMode ? 'Chỉnh sửa thông tin đơn đặt hàng' : `Chọn ${modeLabel} và điền thông tin để tạo đơn đặt hàng`}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden border-t">
            <div className="flex flex-1 overflow-hidden">
              <div className="flex flex-col w-[700px] shrink-0 border-r">
                <div className="p-4 border-b bg-background/80 backdrop-blur-sm z-30 relative">
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className="w-full justify-between"
                      >
                        {searchQuery ? searchQuery : `Tìm kiếm ${modeLabel}...`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[660px] p-0 z-[1001]" align="start">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder={`Nhập tên hoặc mã ${modeLabel}...`}
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy {modeLabel}.</CommandEmpty>
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
                                      <div className='text-xs text-muted-foreground flex gap-2'>
                                        <span>{product.code}</span>
                                        {product.supplier?.supplierName && (
                                          <>
                                            <span>•</span>
                                            <span>NCC: {product.supplier.supplierName}</span>
                                          </>
                                        )}
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
                    Hiển thị {filteredProducts.length} / {products.length} {modeLabel}
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setProductMode('MATERIAL')
                        setSelectedCategory('all')
                        setSearchQuery('')
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        productMode === 'MATERIAL'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      Nguyên liệu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProductMode('PRODUCT')
                        setSelectedCategory('all')
                        setSearchQuery('')
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                        productMode === 'PRODUCT'
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Package className="h-3.5 w-3.5" />
                      Sản phẩm
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowCreateProduct(true)
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Thêm {modeLabel}
                  </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  <MaterialCategorySidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    productCounts={productCounts}
                  />

                  <ProductGrid
                    products={filteredProducts}
                    onAddProduct={handleAddProduct}
                    selectedProductIds={selectedProducts.map(p => p.id)}
                    loading={false}
                    priceKey="basePrice"
                  />
                </div>
              </div>

              <PurchaseOrderCart
                selectedProducts={selectedProducts}
                quantities={quantities}
                selectedUnitIds={selectedUnitIds}
                priceOverrides={priceOverrides}
                discountRates={discountRates}
                selectedTaxes={selectedTaxes}
                notes={notes}
                onQuantityChange={handleQuantityChange}
                onUnitChange={handleUnitChange}
                onPriceChange={handlePriceChange}
                onDiscountRateChange={handleDiscountRateChange}
                onTaxChange={handleTaxChange}
                onNoteChange={handleNoteChange}
                onRemoveProduct={handleRemoveProduct}
                getUnitOptions={getUnitOptions}
                getDisplayPrice={getDisplayPrice}
                calculateSubTotal={calculateSubTotal}
                calculateTaxForProduct={calculateTaxForProduct}
              />

              <PurchaseOrderSidebar
                form={form}
                suppliers={suppliers}
                selectedSupplier={selectedSupplier}
                supplierEditData={supplierEditData}
                onSupplierEditDataChange={setSupplierEditData}
                onSelectSupplier={handleSelectSupplier}
                paymentMethods={paymentMethods}
                calculateSubTotal={calculateSubTotal}
                calculateTotalTax={calculateTotalTax}
                calculateTotalDiscount={calculateTotalDiscount}
                calculateTotalAmount={calculateTotalAmount}
                onSubmit={onSubmit}
                loading={loading}
                expectedDeliveryDate={expectedDeliveryDate}
                onExpectedDeliveryDateChange={setExpectedDeliveryDate}
                otherExpenses={otherExpenses}
                calculateExpenses={calculateExpenses}
                onEditExpenses={() => setShowOtherExpenses(true)}
                isUpdate={isUpdateMode}
                vatRate={vatRate}
                onVatRateChange={setVatRate}
                vatAmount={Math.round(handleCalculateSubTotalInvoice() * (Number(vatRate) || 0) / 100)}
              />
            </div>
          </form>
        </Form>
      </DialogContent>

      <CreateOtherExpenses
        open={showOtherExpenses}
        onOpenChange={setShowOtherExpenses}
        setOtherExpenses={handleSetOtherExpenses}
        otherExpenses={otherExpenses}
        showTrigger={false}
      />


      <CreateProductDialog
        open={showCreateProduct}
        onOpenChange={setShowCreateProduct}
        defaultType={productMode}
        onSuccess={() => {
          dispatch(getProducts({ type: productMode }))
          setShowCreateProduct(false)
          toast.success(`Đã thêm ${modeLabel} mới`)
        }}
        showTrigger={false}
        contentClassName="z-[10006]"
        overlayClassName="z-[10005]"
      />
    </Dialog>
  )
}

export default PurchaseOrderDialog
