import { createSlice } from '@reduxjs/toolkit'

// Key dùng để lưu trạng thái thông báo đã đọc vào localStorage
const NOTIFICATION_STORAGE_KEY = 'nam_viet_notifications'

// Đọc trạng thái đã đọc từ localStorage
const getReadNotifications = () => {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// Lưu trạng thái đã đọc vào localStorage
const saveReadNotifications = (data) => {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(data))
  } catch {
    // ignore
  }
}

const initialState = {
  notifications: [],
  readMap: getReadNotifications(), // { [notificationKey]: true }
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    /**
     * Thêm thông báo mới nếu chưa tồn tại (theo key)
     * payload: { key, title, message, link, type, createdAt }
     */
    addNotification: (state, action) => {
      const noti = action.payload
      // Không thêm nếu đã tồn tại notification với cùng key
      const exists = state.notifications.find((n) => n.key === noti.key)
      if (!exists) {
        state.notifications.push({
          ...noti,
          id: noti.key,
          unread: !state.readMap[noti.key],
          createdAt: noti.createdAt || new Date().toISOString(),
        })
      }
    },

    /**
     * Xóa thông báo theo key (khi không còn cảnh báo)
     */
    removeNotification: (state, action) => {
      const key = action.payload
      state.notifications = state.notifications.filter((n) => n.key !== key)
      // Cũng xóa khỏi readMap
      delete state.readMap[key]
      saveReadNotifications(state.readMap)
    },

    /**
     * Đánh dấu đã đọc 1 thông báo
     */
    markAsRead: (state, action) => {
      const key = action.payload
      const noti = state.notifications.find((n) => n.key === key)
      if (noti) {
        noti.unread = false
      }
      state.readMap[key] = true
      saveReadNotifications(state.readMap)
    },

    /**
     * Đánh dấu tất cả đã đọc
     */
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.unread = false
        state.readMap[n.key] = true
      })
      saveReadNotifications(state.readMap)
    },

    /**
     * Xóa tất cả notifications
     */
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} = notificationSlice.actions

export default notificationSlice.reducer
