import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './AuthSlice'
import userReducer from './UserSlice'
import customerReducer from './CustomerSlice'
import expiryReducer from './ExpirySlice'
import customerTimelineReducer from './CustomerTimelineSlice'
import debtReducer from './DebtSlice'
import categoryReducer from './CategorySlice'
import roleReducer from './RoleSlice'
import permissionReducer from './PermissionSlice'
import systemLogReducer from './SystemLogSlice'
import settingReducer from './SettingSlice'

const persistConfig = { key: 'nam-viet', storage }

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducer,
    customer: customerReducer,
    expiry: expiryReducer,
    customerTimeline: customerTimelineReducer,
    debt: debtReducer,
    category: categoryReducer,
    role: roleReducer,
    permission: permissionReducer,
    systemLog: systemLogReducer,
    setting: settingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
