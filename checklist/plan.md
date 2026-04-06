# Checklist Công Việc

## Task 1: Tự động hoàn thành đơn bán khi thanh toán trả trước
- [x] Xác định nguyên tắc nhận diện "trả trước" (Khi tổng tiền <= -currentDebt và số tiền trả = 0, hoặc thông qua phương thức thanh toán đặc biệt).
- [x] Cập nhật API `createDeliveryOrder` và `createPickupOrder` (backend) để KHÔNG tự động đổi trạng thái đơn hàng thành `completed` khi tạo. Đơn bán chỉ auto-complete thông qua `checkAndCompleteOrder()` khi thỏa mãn: (1) phiếu XK đầy đủ + (2) thanh toán đủ (phiếu thu hoặc credit trả trước).
- [x] Bổ sung trigger trừ kho (gọi hàm `complete`) khi đơn bán chuyển sang `completed` luôn. → Đã có sẵn trong flow: postTransaction → checkAndCompleteOrder.
- [x] Fix double-count debt trong `checkAndCompleteOrder`: bỏ increment currentDebt trong nhánh prepaid credit (vì đã tính lúc tạo đơn).
- [x] Xác minh hiển thị ở phía Client. → Client hiển thị đúng theo trạng thái từ API, không cần thay đổi.

## Task 2: Gắn Nhà cung cấp cho Nguyên liệu trong UI Đơn đặt hàng
- [x] Sửa `CreateProductDialog.jsx` bổ sung trường chọn nhà cung cấp (`supplierId`) khi tạo nguyên liệu (khớp với `Product.supplierId` ở backend). → Đã có sẵn.
- [x] Cập nhật `PurchaseOrderDialog.jsx`: Khi chọn một nguyên liệu đã có `supplierId`, tự động điền nhà cung cấp đó vào form đơn nhập. → Đã có sẵn.
- [x] Cập nhật tính năng search trong `PurchaseOrderDialog.jsx`: bổ sung search nguyên liệu theo tên của nhà cung cấp. → Đã có sẵn.

## Task 3: Đổi tên Sidebar và Thêm trang Công nợ đối tác (Partner Debt)
- [x] Sidebar: Đổi `Công nợ` -> `Công nợ khách hàng`. Thêm mục mới `Công nợ nhà cung cấp` (Partner Debt). → Đã có sẵn.
- [x] Tạo trang `/partner` (Đối tác/Nhà cung cấp) với UI giống `customer` nhưng trỏ tới API của `supplier`. → Đã có sẵn.
- [x] Tạo trang `/partner-debt` hiển thị bảng công nợ nhà cung cấp (UI tương tự `customer-debt`). → Đã có sẵn.
- [x] Gắn dữ liệu của bảng `partner-debt` lấy từ `suppliers`, `purchase-orders` (đơn mua), `payment-vouchers` (phiếu chi). → Đã có sẵn.
- [x] Kiểm tra phân quyền truy cập. → Đã có sẵn (permission: GET_DEBT).
