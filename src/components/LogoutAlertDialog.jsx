import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { useDispatch } from 'react-redux'
import { logout } from '@/stores/AuthSlice'
import { clearNotifications } from '@/stores/NotificationSlice'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const LogoutAlertDialog = ({ isOpen, onOpenChange }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const signOut = async () => {
    try {
      await dispatch(logout()).unwrap()
      dispatch(clearNotifications())
      // Xóa trạng thái đã đọc khi đăng xuất
      localStorage.removeItem('nam_viet_notifications')
      navigate('/')
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bạn có chắc muốn đăng xuất chứ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cần phải đăng nhập để sử dụng các tính năng
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Hủy
          </AlertDialogCancel>
          <Button variant="destructive" onClick={signOut}>
            Đăng xuất
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LogoutAlertDialog
