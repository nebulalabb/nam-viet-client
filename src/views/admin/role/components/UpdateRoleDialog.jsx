import { Button } from '@/components/custom/Button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog'
import { PlusIcon } from '@radix-ui/react-icons'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDispatch, useSelector } from 'react-redux'
import { updateRole, getRolePermissions } from '@/stores/RoleSlice'
import { updateRoleSchema } from '../schema'
import { useEffect, useState, useMemo } from 'react'
import { getPermission } from '@/stores/PermissionSlice'
import { Checkbox } from '@/components/ui/checkbox'
const UpdateRoleDialog = ({
  role,
  open,
  onOpenChange,
  showTrigger = true,
  ...props
}) => {
  const loading = useSelector((state) => state.role.loading)
  const permissions = useSelector((state) => state.permission.permissions)

  const form = useForm({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      roleKey: role?.roleKey || '',
      roleName: role?.roleName || '',
    },
  })

  const [checkedPermissions, setCheckedPermissions] = useState([])
  const dispatch = useDispatch()
  const onSubmit = async (data) => {
    try {
      await dispatch(
        updateRole({ id: role.id, ...data, permissions: checkedPermissions }),
      ).unwrap()
      form.reset()
      onOpenChange?.(false)
    } catch (error) {
      console.log('Submit error: ', error)
    }
  }

  useEffect(() => {
    dispatch(getPermission())
    if (role?.id) {
      dispatch(getRolePermissions(role.id)).unwrap().then((ids) => {
        setCheckedPermissions(ids)
      }).catch(() => { })
    }
  }, [dispatch, role?.id])

  // Helper to get all permission IDs from a group or item
  const getAllPermissionIds = (node) => {
    let ids = []
    if (node.permissions) {
      ids = [...ids, ...node.permissions.map((p) => p.id)]
    }
    if (node.items) {
      node.items.forEach((item) => {
        ids = [...ids, ...getAllPermissionIds(item)]
      })
    }
    return ids
  }

  // Create a map of permission code to ID for dependency logic
  const codeToIdMap = useMemo(() => {
    const map = {}
    const traverse = (nodes) => {
      nodes.forEach((node) => {
        if (node.permissions) {
          node.permissions.forEach((p) => {
            if (p.code) map[p.code] = p.id
          })
        }
        if (node.items) traverse(node.items)
      })
    }
    traverse(permissions)
    return map
  }, [permissions])

  const handleCheck = (isChecked, node, type) => {
    let updatedCheckedPermissions = [...checkedPermissions]
    const idsToToggle = getAllPermissionIds(node)

    if (type === 'permission') {
      // Single permission toggle
      if (isChecked) {
        updatedCheckedPermissions.push(node.id)

        // Custom Logic: If GET_INVOICE or PURCHASE_ORDER_VIEW_ALL is checked, auto-check GET_USER
        if (node.code === 'GET_INVOICE' || node.code === 'PURCHASE_ORDER_VIEW_ALL') {
          const getUserId = codeToIdMap['GET_USER']
          if (getUserId && !updatedCheckedPermissions.includes(getUserId)) {
            updatedCheckedPermissions.push(getUserId)
          }
        }
      } else {
        // Validation: Cannot uncheck GET_USER if dependent permissions are active
        if (node.code === 'GET_USER') {
          const getInvoiceId = codeToIdMap['GET_INVOICE']
          const getPurchaseOrderId = codeToIdMap['PURCHASE_ORDER_VIEW_ALL']

          const hasDependentPermissions = updatedCheckedPermissions.some(id =>
            (getInvoiceId && id === getInvoiceId) ||
            (getPurchaseOrderId && id === getPurchaseOrderId)
          )

          if (hasDependentPermissions) {
            toast.warning('Bạn đang chọn quyền xem đơn bán / đơn mua thì bắt buộc phải chọn quyền xem người dùng')
            return // Stop execution, do not uncheck
          }
        }

        updatedCheckedPermissions = updatedCheckedPermissions.filter(
          (id) => id !== node.id,
        )
      }
    } else {
      // Group/Item toggle
      if (isChecked) {
        // Add all distinct IDs
        const newIds = idsToToggle.filter(
          (id) => !updatedCheckedPermissions.includes(id),
        )
        updatedCheckedPermissions = [...updatedCheckedPermissions, ...newIds]

        // Custom Logic: Check if GET_INVOICE or PURCHASE_ORDER_VIEW_ALL was added
        const getInvoiceId = codeToIdMap['GET_INVOICE']
        const getPurchaseOrderId = codeToIdMap['PURCHASE_ORDER_VIEW_ALL']

        if (
          (getInvoiceId && newIds.includes(getInvoiceId)) ||
          (getPurchaseOrderId && newIds.includes(getPurchaseOrderId))
        ) {
          const getUserId = codeToIdMap['GET_USER']
          if (getUserId && !updatedCheckedPermissions.includes(getUserId)) {
            updatedCheckedPermissions.push(getUserId)
          }
        }
      } else {
        // Validation: Check if GET_USER is being removed via group uncheck
        const getUserId = codeToIdMap['GET_USER']
        if (getUserId && idsToToggle.includes(getUserId)) {
          const getInvoiceId = codeToIdMap['GET_INVOICE']
          const getPurchaseOrderId = codeToIdMap['PURCHASE_ORDER_VIEW_ALL']

          // Let's look at remaining permissions AFTER removal
          const remainingPermissions = updatedCheckedPermissions.filter(id => !idsToToggle.includes(id))

          const hasDependent = remainingPermissions.some(id =>
            (getInvoiceId && id === getInvoiceId) ||
            (getPurchaseOrderId && id === getPurchaseOrderId)
          )

          if (hasDependent) {
            toast.warning('Bạn đang chọn quyền xem đơn bán / đơn mua thì bắt buộc phải chọn quyền xem người dùng')
            return
          }
        }

        // Remove all IDs
        updatedCheckedPermissions = updatedCheckedPermissions.filter(
          (id) => !idsToToggle.includes(id),
        )
      }
    }

    setCheckedPermissions(updatedCheckedPermissions)
  }

  // Check if all permissions in a node are checked
  const isAllChecked = (node) => {
    const allIds = getAllPermissionIds(node)
    if (allIds.length === 0) return false
    return allIds.every((id) => checkedPermissions.includes(id))
  }

  // Check if some permissions in a node are checked (for indeterminate state)
  const isIndeterminate = (node) => {
    const allIds = getAllPermissionIds(node)
    if (allIds.length === 0) return false
    const checkedCount = allIds.filter((id) =>
      checkedPermissions.includes(id),
    ).length
    return checkedCount > 0 && checkedCount < allIds.length
  }

  const renderPermission = (groups) => {
    return groups.map((group) => (
      <div key={group.key} className="col-span-full mb-6">
        {/* Group Header */}
        <div className="mb-4 flex items-center space-x-2 border-b pb-2">
          <Checkbox
            id={`group-${group.key}`}
            checked={isAllChecked(group)}
            // indeterminate={isIndeterminate(group)} // shadcn checkbox might not support indeterminate prop directly in strict mode or needs ref
            onCheckedChange={(checked) => handleCheck(checked, group, 'group')}
          />
          <label
            htmlFor={`group-${group.key}`}
            className="text-lg font-semibold cursor-pointer"
          >
            {group.label}
          </label>
        </div>

        {/* Group Items */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {group.items?.map((item) => (
            <div
              key={item.key}
              className="rounded-lg border p-4 shadow-sm transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center space-x-2 border-b pb-2">
                <Checkbox
                  id={`item-${item.key}`}
                  checked={isAllChecked(item)}
                  onCheckedChange={(checked) =>
                    handleCheck(checked, item, 'item')
                  }
                />
                <label
                  htmlFor={`item-${item.key}`}
                  className="font-medium cursor-pointer"
                >
                  {item.label}
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {item.permissions?.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`perm-${permission.id}`}
                      checked={checkedPermissions.includes(permission.id)}
                      onCheckedChange={(checked) =>
                        handleCheck(checked, permission, 'permission')
                      }
                    />
                    <label
                      htmlFor={`perm-${permission.id}`}
                      className="text-sm cursor-pointer text-muted-foreground"
                    >
                      {permission.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="mx-2" variant="outline" size="sm">
            <PlusIcon className="mr-2 size-4" aria-hidden="true" />
            Cập nhật
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="md:h-auto md:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Cập nhật vai trò: {role.name}</DialogTitle>
          <DialogDescription>
            Điền vào chi tiết phía dưới để cập nhật vai trò
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-auto md:max-h-[75vh]">
          <Form {...form}>
            <form id="update-role" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="mb-3 grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="roleKey"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Mã vai trò</FormLabel>
                      <FormControl>
                        <Input
                          readOnly
                          placeholder="Nhập mã vai trò"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className="text-primary">
                        <strong className="text-destructive">Lưu ý:</strong>&nbsp;Mã vai trò không thể thay đổi sau khi tạo và mã vai trò
                        phải là duy nhất.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roleName"
                  render={({ field }) => (
                    <FormItem className="mb-2 space-y-1">
                      <FormLabel required={true}>Tên vai trò</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Nhập tên vai trò"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <FormDescription className="text-primary">
                        <strong className="text-destructive">Lưu ý:</strong>&nbsp;Tên
                        vai trò phải là duy nhất.
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="col-span-full">
                  <label htmlFor="permissions" className="text-sm font-medium">
                    Chọn các quyền cho vai trò
                  </label>
                </div>
                <>{renderPermission(permissions)}</>
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset()
              }}
            >
              Hủy
            </Button>
          </DialogClose>

          <Button form="update-role" loading={loading}>
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateRoleDialog
