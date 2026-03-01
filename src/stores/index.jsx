import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './AuthSlice'
import userReducer from './UserSlice'
import notificationReducer from './NotificationSlice'
import customerReducer from './CustomerSlice'
import expiryReducer from './ExpirySlice'
import customerTimelineReducer from './CustomerTimelineSlice'
import debtReducer from './DebtSlice'

const persistConfig = { key: 'nam-viet', storage }

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    user: userReducer,
    notification: notificationReducer,
    customer: customerReducer,
    expiry: expiryReducer,
    customerTimeline: customerTimelineReducer,
    debt: debtReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const persistor = persistStore(store)
