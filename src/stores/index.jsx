import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './AuthSlice'
import userReducer from './UserSlice'
import customerReducer from './CustomerSlice'
import expiryReducer from './ExpirySlice'
import customerTimelineReducer from './CustomerTimelineSlice'
import promotionReducer from './PromotionSlice'
import supplierReducer from './SupplierSlice'
import debtReducer from './DebtSlice'
import categoryReducer from './CategorySlice'
import warehouseReducer from './WarehouseSlice'
import roleReducer from './RoleSlice'
import permissionReducer from './PermissionSlice'
import systemLogReducer from './SystemLogSlice'
import settingReducer from './SettingSlice'
import unitReducer from './UnitSlice'
import productReducer from './ProductSlice'
import stockTransactionReducer from './StockTransactionSlice'
import salesOrderReducer from './SalesOrderSlice'
import ticketReducer from './TicketSlice'
import taskReducer from './TaskSlice'
import materialReducer from './MaterialSlice'
import attendanceReducer from './AttendanceSlice'
import overtimeReducer from './OvertimeSlice'
import salaryReducer from './SalarySlice'
import taxReducer from './TaxSlice'
import creditNoteReducer from './CreditNoteSlice'
import attributeReducer from './AttributeSlice'
import invoiceReducer from './InvoiceSlice'
import purchaseOrderReducer from './PurchaseOrderSlice'
import receiptReducer from './ReceiptSlice'
import paymentReducer from './PaymentSlice'
import warehouseReceiptReducer from './WarehouseReceiptSlice'
import dashboardReducer from './DashboardSlice'
import warrantyReducer from './WarrantySlice'
import deliveryReducer from './DeliverySlice'
import warehouseReportReducer from './WarehouseReportSlice'
import notificationReducer from './NotificationSlice'
import newsReducer from './NewsSlice'

const persistConfig = { key: 'nam-viet', storage }

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducer,
    customer: customerReducer,
    expiry: expiryReducer,
    customerTimeline: customerTimelineReducer,
    promotion: promotionReducer,
    supplier: supplierReducer,
    debt: debtReducer,
    category: categoryReducer,
    warehouse: warehouseReducer,
    role: roleReducer,
    permission: permissionReducer,
    systemLog: systemLogReducer,
    setting: settingReducer,
    unit: unitReducer,
    product: productReducer,
    stockTransaction: stockTransactionReducer,
    salesOrder: salesOrderReducer,
    ticket: ticketReducer,
    task: taskReducer,
    material: materialReducer,
    attendance: attendanceReducer,
    overtime: overtimeReducer,
    salary: salaryReducer,
    tax: taxReducer,
    creditNote: creditNoteReducer,
    attribute: attributeReducer,
    invoice: invoiceReducer,
    purchaseOrder: purchaseOrderReducer,
    receipt: receiptReducer,
    payment: paymentReducer,
    warehouseReceipt: warehouseReceiptReducer,
    dashboard: dashboardReducer,
    warranty: warrantyReducer,
    delivery: deliveryReducer,
    warehouseReport: warehouseReportReducer,
    notification: notificationReducer,
    news: newsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
